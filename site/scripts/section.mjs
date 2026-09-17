/**
 * 栏目管理工具。
 *
 * 用法（在 site 目录下）：
 *     npm run section
 *
 * 它读写 site.config.mjs，改完会自动重写那个文件并保持注释头。
 * 不需要你手动编辑任何代码。
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createInterface } from 'node:readline/promises'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = join(HERE, '..', 'site.config.mjs')

/** 布局选项，给菜单用 */
const LAYOUTS = [
  { value: 'stream', hint: '一行一条，适合文字、笔记' },
  { value: 'gallery', hint: '卡片网格，适合照片、作品' },
  { value: 'timeline', hint: '按月份分组，适合日记、流水' },
]

const PALETTE = ['#9a6b3f', '#5b7c99', '#8a5a6b', '#5f8256', '#7a6f9a', '#a07a3c', '#4f7f7a', '#8f5f5f']

const rl = createInterface({ input: process.stdin, output: process.stdout })

/* ---------------------------------------------------------------- 读写配置 */

async function load() {
  const mod = await import(`${pathToFileURL(CONFIG_PATH).href}?t=${Date.now()}`)
  return {
    sections: [...mod.SECTIONS].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    defaultSection: mod.DEFAULT_SECTION,
  }
}

/** 保留文件顶部的注释头，只重写导出部分。 */
function write(sections, defaultSection) {
  const raw = readFileSync(CONFIG_PATH, 'utf8')
  const marker = 'export const SECTIONS ='
  const cut = raw.indexOf(marker)
  if (cut < 0) throw new Error('site.config.mjs 里找不到 `export const SECTIONS =`，无法安全重写')
  const header = raw.slice(0, cut)

  const body = sections
    .map((s) =>
      [
        '  {',
        `    id: ${JSON.stringify(s.id)},`,
        `    label: ${JSON.stringify(s.label)},`,
        `    desc: ${JSON.stringify(s.desc ?? '')},`,
        `    glyph: ${JSON.stringify(s.glyph ?? '·')},`,
        `    color: ${JSON.stringify(s.color ?? '#9a6b3f')},`,
        `    layout: ${JSON.stringify(s.layout ?? 'stream')},`,
        `    order: ${s.order ?? 100},`,
        '  },',
      ].join('\n'),
    )
    .join('\n')

  writeFileSync(
    CONFIG_PATH,
    `${header}export const SECTIONS = [\n${body}\n]\n\n/**\n * 默认栏目：写内容时不填 kind，就归到这里。\n * 必须是上面某个栏目的 id。\n */\nexport const DEFAULT_SECTION = ${JSON.stringify(defaultSection)}\n`,
    'utf8',
  )
}

/* ------------------------------------------------------------------ 小工具 */

const isValidId = (v) => /^[a-z0-9][a-z0-9-]*$/.test(v)

function print(sections, defaultSection) {
  console.log('')
  console.log('  当前栏目')
  console.log('  ──────────────────────────────────────────────────')
  sections.forEach((s, i) => {
    const def = s.id === defaultSection ? '  ← 默认' : ''
    console.log(
      `  ${String(i + 1).padStart(2)}. ${s.glyph}  ${s.label.padEnd(6, '　')}  ${s.id.padEnd(12)}  ${String(s.layout).padEnd(8)} ${s.color}${def}`,
    )
    console.log(`      ${s.desc ?? ''}`)
  })
  console.log('')
}

async function ask(question) {
  return (await rl.question(question)).trim()
}

async function pickLayout(current) {
  console.log('')
  LAYOUTS.forEach((l, i) => console.log(`    ${i + 1}. ${l.value.padEnd(9)} ${l.hint}`))
  const ans = await ask(`  选一个（回车保持 ${current}）: `)
  if (ans === '') return current
  const n = Number(ans)
  if (Number.isInteger(n) && n >= 1 && n <= LAYOUTS.length) return LAYOUTS[n - 1].value
  const byName = LAYOUTS.find((l) => l.value === ans)
  return byName ? byName.value : current
}

/* -------------------------------------------------------------------- 操作 */

async function addSection(state) {
  const id = await ask('  新栏目的 id（英文小写，会成为网址，如 collection）: ')
  if (!isValidId(id)) return console.log('  ✗ id 只能用英文小写字母、数字、连字符')
  if (state.sections.some((s) => s.id === id)) return console.log('  ✗ 这个 id 已经存在了')

  const label = await ask('  显示名称（中文，如 收藏）: ')
  if (!label) return console.log('  ✗ 名称不能为空')

  const desc = await ask('  一句话说明（可留空）: ')
  const glyph = (await ask('  图标用哪个汉字（可留空，默认取名称第一个字）: ')) || label[0]
  const color = (await ask(`  主色（可留空，默认 ${PALETTE[state.sections.length % PALETTE.length]}）: `)) || PALETTE[state.sections.length % PALETTE.length]
  const layout = await pickLayout('stream')
  const orderAns = await ask(`  顺序（数字，小的在前；回车用 ${(state.sections.at(-1)?.order ?? 0) + 10}）: `)

  state.sections.push({
    id,
    label,
    desc,
    glyph,
    color,
    layout,
    order: Number(orderAns) || (state.sections.at(-1)?.order ?? 0) + 10,
  })
  console.log(`  ✓ 已添加「${label}」`)
}

async function removeSection(state) {
  const ans = await ask('  要删哪个？（输入序号或 id）: ')
  const idx = /^\d+$/.test(ans)
    ? Number(ans) - 1
    : state.sections.findIndex((s) => s.id === ans)
  if (idx < 0 || idx >= state.sections.length) return console.log('  ✗ 找不到')

  const target = state.sections[idx]
  const yes = await ask(`  确认删除「${target.label}」？它的内容文件不会被删，只是不再显示。(y/N) `)
  if (yes.toLowerCase() !== 'y') return console.log('  已取消')

  state.sections.splice(idx, 1)
  if (state.defaultSection === target.id) state.defaultSection = state.sections[0]?.id ?? 'writing'
  console.log(`  ✓ 已删除「${target.label}」`)
}

async function editSection(state) {
  const ans = await ask('  要改哪个？（输入序号或 id）: ')
  const idx = /^\d+$/.test(ans)
    ? Number(ans) - 1
    : state.sections.findIndex((s) => s.id === ans)
  if (idx < 0 || idx >= state.sections.length) return console.log('  ✗ 找不到')

  const s = state.sections[idx]
  console.log(`  改动「${s.label}」（直接回车表示不改）`)

  const label = await ask(`    名称 [${s.label}]: `)
  if (label) s.label = label

  const desc = await ask(`    说明 [${s.desc}]: `)
  if (desc) s.desc = desc

  const glyph = await ask(`    图标 [${s.glyph}]: `)
  if (glyph) s.glyph = glyph

  const color = await ask(`    主色 [${s.color}]: `)
  if (color) s.color = color

  console.log(`    布局现在是 ${s.layout}`)
  const layout = await pickLayout(s.layout)
  s.layout = layout

  const order = await ask(`    顺序 [${s.order}]: `)
  if (order) s.order = Number(order) || s.order

  console.log(`  ✓ 已更新「${s.label}」`)
}

async function reorder(state) {
  const ans = await ask('  新的顺序（用逗号分隔序号，例如 3,1,2,4；回车取消）: ')
  if (!ans) return
  const nums = ans.split(',').map((v) => Number(v.trim()) - 1)
  if (nums.length !== state.sections.length || nums.some((n) => !(n >= 0 && n < state.sections.length))) {
    return console.log('  ✗ 序号不对，需要把每个栏目都列一次')
  }
  const next = nums.map((n) => state.sections[n])
  next.forEach((s, i) => (s.order = (i + 1) * 10))
  state.sections = next
  console.log('  ✓ 顺序已更新')
}

/* -------------------------------------------------------------------- 菜单 */

async function main() {
  console.log('')
  console.log('  ╔══════════════════════════════════════╗')
  console.log('  ║   栏目管理                           ║')
  console.log('  ╚══════════════════════════════════════╝')

  let state = await load()

  for (;;) {
    print(state.sections, state.defaultSection)
    console.log('  a 加一个    e 改一个    d 删一个    r 调顺序    s 换默认栏目    q 存盘退出')
    const cmd = (await ask('  做什么？: ')).toLowerCase()

    if (cmd === 'q' || cmd === '') {
      write(state.sections, state.defaultSection)
      console.log('')
      console.log('  ✓ 已保存到 site.config.mjs')
      console.log('    本地 npm run dev 的话会立刻刷新；线上要提交推送后才会更新。')
      console.log('')
      break
    } else if (cmd === 'a') await addSection(state)
    else if (cmd === 'e') await editSection(state)
    else if (cmd === 'd') await removeSection(state)
    else if (cmd === 'r') await reorder(state)
    else if (cmd === 's') {
      const ans = await ask('  默认栏目用哪个 id？: ')
      if (state.sections.some((s) => s.id === ans)) {
        state.defaultSection = ans
        console.log(`  ✓ 默认栏目改为 ${ans}`)
      } else console.log('  ✗ 找不到这个 id')
    } else console.log('  没听懂，输入 a / e / d / r / s / q')
  }

  rl.close()
}

main().catch((error) => {
  console.error('出错了:', error?.message ?? error)
  rl.close()
  process.exit(1)
})
