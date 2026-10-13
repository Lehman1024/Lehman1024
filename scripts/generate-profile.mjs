/**
 * 将 GitHub 公开数据绘制为逐风修行录卡片，供个人主页直接引用。
 *
 * @author Lehman+AI
 * @site https://www.lehman.top
 * @since 2026/10/10 17:30
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fetchProfile } from './github-data.mjs';
import { renderDragon } from './dragon.mjs';

const output = new URL('../assets/profile/', import.meta.url);
const username = process.env.PROFILE_USERNAME || 'Lehman1024';
const cached = process.argv.includes('--cached');
const data = cached
  ? JSON.parse(await readFile(new URL('data.json', output), 'utf8'))
  : await fetchProfile(username);
const art = await readFile(new URL('../assets/art/immortal-mountains.webp', import.meta.url));
const artUri = `data:image/webp;base64,${art.toString('base64')}`;
const updated = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(data.updatedAt)).replaceAll('/', '.');
const p = { bg: '#0b171b', line: '#28413f', text: '#e8eee5', muted: '#92aaa5', jade: '#9cdbbd', gold: '#dbc28d' };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const num = (value) => value == null ? '—' : Number(value).toLocaleString('en-US');
const txt = (x, y, value, size = 14, fill = p.text, attrs = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs}>${esc(value)}</text>`;
const line = (x1, y, x2) => `<path d="M${x1} ${y}H${x2}" stroke="${p.line}"/>`;
const serif = 'font-family="Noto Serif SC,Source Han Serif SC,Songti SC,SimSun,serif"';
const mono = 'font-family="SFMono-Regular,Consolas,Liberation Mono,monospace"';

function svg(width, height, label, body, frameHeight = height, frameEdges = 'card') {
  let frame = `<rect x=".75" y=".75" width="${width - 1.5}" height="${frameHeight - 1.5}" rx="16" fill="url(#background)" stroke="${p.line}" stroke-width="1.5"/>`;
  // The website slices share one frame without relying on README CSS or table padding.
  if (frameEdges !== 'card') {
    const right = width - .75;
    const outline = frameEdges === 'top'
      ? `M.75 ${height}V16.75Q.75 .75 16.75 .75H${width - 16.75}Q${right} .75 ${right} 16.75V${height}`
      : frameEdges === 'bottom'
        ? `M.75 0V${height - 16.75}Q.75 ${height - .75} 16.75 ${height - .75}H${width - 16.75}Q${right} ${height - .75} ${right} ${height - 16.75}V0`
        : `M.75 0V${height}M${right} 0V${height}`;
    frame = `${frameEdges === 'middle' ? `<rect x=".75" width="${width - 1.5}" height="${height}" fill="#0d1d21"/>` : ''}<path d="${outline}" fill="${frameEdges === 'middle' ? 'none' : '#0d1d21'}" stroke="${p.line}" stroke-width="1.5"/>`;
  }
  return `<!--
${label}；由 scripts/generate-profile.mjs 自动生成。

@author Lehman+AI
@site https://www.lehman.top
@since 2026/10/10 17:30
-->
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<defs><linearGradient id="background" x2="1" y2="1"><stop stop-color="#112429"/><stop offset="1" stop-color="#091317"/></linearGradient><linearGradient id="jade"><stop stop-color="#477c6c"/><stop offset="1" stop-color="#b2e4c6"/></linearGradient><clipPath id="frame"><rect x="1" y="1" width="${width - 2}" height="${frameHeight - 2}" rx="16"/></clipPath></defs>
<g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Microsoft YaHei,sans-serif">
${frame}
${body}
</g></svg>\n`;
}

function hero(mobile = false) {
  const w = mobile ? 380 : 780;
  const h = mobile ? 368 : 278;
  return svg(w, h, '逐风修行录 · Lehman 的 GitHub 修仙主页', `
<defs><linearGradient id="veil"><stop stop-color="#09171c" stop-opacity=".8"/><stop offset=".65" stop-color="#09171c" stop-opacity=".12"/><stop offset="1" stop-color="#09171c" stop-opacity=".06"/></linearGradient><linearGradient id="mobile-veil" x2="0" y2="1"><stop stop-color="#09171c"/><stop offset=".5" stop-color="#09171c" stop-opacity=".75"/><stop offset="1" stop-color="#09171c" stop-opacity=".1"/></linearGradient></defs>
<g clip-path="url(#frame)"><image href="${artUri}" x="${mobile ? -254 : 0}" y="${mobile ? 65 : 0}" width="${mobile ? 790 : 780}" height="${mobile ? 303 : 278}" preserveAspectRatio="xMidYMid slice"/><rect width="${w}" height="${h}" fill="url(#${mobile ? 'mobile-veil' : 'veil'})"/></g>
${txt(30, 39, 'LEHMAN  /  逐风者', 12, p.gold, `${mono} letter-spacing="2"`)}
${txt(30, mobile ? 105 : 119, '逐风修行录', mobile ? 42 : 48, p.text, `${serif} font-weight="600" letter-spacing="5"`)}
${txt(32, mobile ? 143 : 158, '以01为剑，以AI入道。', mobile ? 15 : 17, '#c9d7ca', 'letter-spacing="2"')}
${txt(32, mobile ? 179 : 197, 'VIBE CODING · AI', 10, '#a9beb2', `${mono} letter-spacing="1.5"`)}
<g clip-path="url(#frame)"><rect x="1" y="${h - 47}" width="${w - 2}" height="46" fill="#09171c" fill-opacity=".86"/></g>
${line(30, h - 47, w - 30)}
<circle cx="35" cy="${h - 23}" r="3" fill="${p.jade}"/>
${txt(47, h - 19, 'Fall down, get up, this is success！', 11, p.muted)}
${txt(w - 30, h - 19, '@Lehman1024', 11, p.gold, `${mono} text-anchor="end"`)}
`);
}

function realmState() {
  const stages = [['练气', 0], ['筑基', 1], ['金丹', 2], ['元婴', 3], ['化神', 5], ['炼虚', 8], ['合体', 12], ['大乘', 16], ['渡劫', 20], ['飞升', 25]];
  const days = Math.max(0, Math.floor((Date.parse(data.updatedAt) - Date.parse(data.createdAt)) / 86400000));
  const years = days / 365.25;
  const index = stages.findLastIndex(([, threshold]) => years >= threshold);
  const current = stages[Math.max(0, index)];
  const next = stages[index + 1];
  const progress = next ? Math.min(100, Math.floor((years - current[1]) / (next[1] - current[1]) * 100)) : 100;
  return { name: current[0], next: next?.[0], days, years, progress, phase: ['初期', '中期', '后期'][Math.min(2, Math.floor(progress / 100 * 3))] };
}

function realm() {
  const r = realmState();
  const metrics = [[data.publicRepos, '洞府 · 公开仓库'], [data.stars, '法宝 · 获得星标'], [data.followers, '同道 · 关注者']];
  return svg(380, 350, `修行境界：${r.name}${r.phase}，按 GitHub 注册时长计算`, `
${txt(26, 37, '修行境界', 12, p.gold, 'letter-spacing="2"')}
<g transform="translate(302 99)" fill="none" stroke="${p.gold}"><circle r="37" stroke-opacity=".18"/><circle r="28" stroke-opacity=".36"/><path d="M0-45V-32M0 32V45M-45 0H-32M32 0H45" stroke-opacity=".5"/><path d="M0-20L8-7L20 0L8 7L0 20L-8 7L-20 0L-8-7Z" stroke-opacity=".75"/><circle r="5" fill="${p.gold}" stroke="none"/></g>
${txt(26, 105, r.name, 43, p.text, `${serif} letter-spacing="4"`)}
${txt(133, 102, `· ${r.phase}`, 15, p.gold)}
${txt(27, 137, `入道 ${r.years.toFixed(1)} 载 · 已历 ${num(r.days)} 日`, 12, p.muted)}
<rect x="26" y="165" width="328" height="5" rx="2.5" fill="#263c38"/><rect x="26" y="165" width="${Math.max(3, 328 * r.progress / 100)}" height="5" rx="2.5" fill="url(#jade)"/>
${txt(26, 193, r.next ? `下一境 · ${r.next}` : '道心无界 · 继续前行', 11, p.muted)}
${txt(354, 193, `${r.progress}%`, 11, p.jade, `${mono} text-anchor="end"`)}
${line(26, 216, 354)}
${metrics.map(([value, label], i) => txt(26 + i * 116, 258, num(value), 29, p.text, mono) + txt(26 + i * 116, 282, label, 10, p.muted)).join('')}
${txt(26, 326, `始于 ${data.createdAt.slice(0, 10).replaceAll('-', '.')}  /  境界随注册年限成长`, 10, p.muted)}
`);
}

function pet() {
  const c = data.contributions;
  const levels = [['龙蛋', 0], ['幼龙', 50], ['青龙', 200], ['应龙', 800], ['神龙', 2000]];
  const stage = c ? levels.findLast(([, min]) => c.total >= min)[0] : '静修';
  const recent = c ? c.days.slice(-30).reduce((sum, d) => sum + d.count, 0) : null;
  return svg(380, 350, '随身灵宠 · 青岚，随 GitHub 贡献积累修为', `
${txt(26, 37, '随身灵宠', 12, p.gold, 'letter-spacing="2"')}
${txt(26, 79, '青岚', 27, p.text, `${serif} letter-spacing="3"`)}
<rect x="278" y="58" width="76" height="26" rx="13" fill="#1e3a32" stroke="#395a48"/>
${txt(316, 76, `灵阶 · ${stage}`, 10, p.jade, 'text-anchor="middle"')}
<g transform="translate(64 76) scale(.82)">${renderDragon()}</g>
${txt(190, 277, c?.today ? '今日灵气充盈，伴你踏云而行。' : '山风入怀，静候下一次灵光。', 11, p.muted, 'text-anchor="middle"')}
${line(26, 294, 354)}
${txt(26, 324, '近 30 日灵力', 10, p.muted)}
${txt(129, 325, recent == null ? '待同步' : `${num(recent)} 贡献`, 12, p.jade, mono)}
${txt(354, 325, `连续 ${num(c?.currentStreak)} 日`, 11, p.gold, 'text-anchor="end"')}
`);
}

function activity(mobile = false) {
  const w = mobile ? 380 : 780;
  const c = data.contributions;
  const days = c?.days || [];
  const selected = mobile ? days.slice(-112) : days;
  const size = mobile ? 13 : 9;
  const step = mobile ? 20 : 13;
  const firstWeekday = selected.length ? new Date(`${selected[0].date}T00:00:00Z`).getUTCDay() : 0;
  const x = mobile ? 27 : 45;
  const y = 132;
  const max = Math.max(1, ...selected.map((d) => d.count));
  const colors = ['#1c3030', '#2d5144', '#467e60', '#77ac7e', '#c5dca0'];
  const cells = selected.map((d, i) => `<rect x="${x + Math.floor((i + firstWeekday) / 7) * step}" y="${y + ((i + firstWeekday) % 7) * step}" width="${size}" height="${size}" rx="2" fill="${colors[d.count ? Math.min(4, Math.ceil(d.count / max * 4)) : 0]}"><title>${esc(d.date)} · ${d.count} contributions</title></rect>`).join('');
  const months = selected.map((d, i) => d.date.slice(-2) === '01' ? txt(x + Math.floor((i + firstWeekday) / 7) * step, y - 14, `${Number(d.date.slice(5, 7))}月`, 9, p.muted) : '').join('');
  const h = mobile ? 394 : 298;
  return svg(w, h, mobile ? '岁修录 · 最近 16 周贡献与近一年统计' : '岁修录 · 近一年 GitHub 贡献', `
${txt(26, 37, '岁修录', 12, p.gold, 'letter-spacing="2"')}
${txt(w - 26, 37, `更新 ${updated} CST`, 9, p.muted, `${mono} text-anchor="end"`)}
${txt(26, 80, '一日一炼，积跬成道。', mobile ? 23 : 27, p.text, serif)}
${!mobile ? txt(w - 26, 78, '每一格微光，都是走过的路。', 12, p.muted, 'text-anchor="end"') : ''}
${c ? months + cells : txt(26, 155, '贡献数据待同步', 16, p.muted)}
${txt(26, mobile ? 293 : 245, mobile ? '最近 16 周 · GitHub 贡献日历' : '近一年 · GitHub 贡献日历', 10, p.muted)}
${[0, 1, 2, 3, 4].map((level) => `<rect x="${w - 91 + level * 13}" y="${mobile ? 283 : 236}" width="9" height="9" rx="2" fill="${colors[level]}"/>`).join('')}
${line(26, mobile ? 313 : 261, w - 26)}
${txt(26, mobile ? 341 : 285, `近一年  ${num(c?.total)} 次贡献`, 11, p.jade)}
${txt(mobile ? 26 : w - 26, mobile ? 369 : 285, `最长连续  ${num(c?.longestStreak)} 日   ·   今日  ${num(c?.today)} 次`, 11, p.muted, mobile ? '' : 'text-anchor="end"')}
`);
}

function arsenal(mobile = false) {
  const w = mobile ? 380 : 780;
  const h = mobile ? 432 : 300;
  const groups = [
    ['铸剑 · 服务端', ['Java 21', 'Spring Cloud', 'Python', 'Django']],
    ['御风 · 界面', ['Vue', 'TypeScript', 'React', 'Vite', 'HTML / CSS', 'JavaScript', 'Node.js', 'jQuery']],
    ['藏经 · 数据', ['MySQL', 'Oracle', 'MongoDB']],
    ['天工 · 工具', ['Git', 'Docker', 'AI Agent']],
  ];
  let body = txt(26, 37, '随身法器', 12, p.gold, 'letter-spacing="2"') + txt(26, 79, '工欲善其事，先利其器。', mobile ? 22 : 27, p.text, serif);
  for (const [i, [name, names]] of groups.entries()) {
    const x = mobile ? 26 : 26 + i % 2 * 380;
    const y = mobile ? 119 + i * 74 : 123 + Math.floor(i / 2) * 75;
    body += txt(x, y, name, 12, p.jade);
    body += txt(x, y + 23, names.slice(0, 4).join('  /  '), 10, p.muted, mono);
    if (names.length > 4) body += txt(x, y + 42, names.slice(4).join('  /  '), 10, p.muted, mono);
  }
  body += line(26, h - 38, w - 26) + txt(26, h - 16, '学如逆水行舟，不进则退。', 10, p.muted);
  return svg(w, h, '随身法器 · Lehman 的技术栈', body);
}

function languages() {
  const entries = data.languages.slice(0, 5);
  const total = data.languages.reduce((sum, entry) => sum + entry.count, 0);
  const colors = ['#a5d9b5', '#d6c38c', '#729c96', '#b6a6ba', '#8aabd0'];
  let body = txt(26, 37, '灵根谱', 12, p.gold, 'letter-spacing="2"') + txt(26, 79, '万法同源，各有所长。', 22, p.text, serif);
  if (!entries.length) body += txt(26, 139, '静候第一门语言入谱', 14, p.muted);
  entries.forEach((entry, i) => {
    const y = 135 + i * 33;
    body += `<circle cx="31" cy="${y - 4}" r="4" fill="${colors[i]}"/>` + txt(45, y, entry.name, 12, p.text, mono) + txt(354, y, `${entry.count} 仓库`, 11, p.muted, 'text-anchor="end"')
      + `<rect x="172" y="${y - 9}" width="100" height="5" rx="2" fill="#203733"/><rect x="172" y="${y - 9}" width="${100 * entry.count / total}" height="5" rx="2" fill="${colors[i]}"/>`;
  });
  body += line(26, 294, 354) + txt(26, 324, '按公开原创仓库的主语言统计', 10, p.muted);
  return svg(380, 350, '灵根谱 · 公开原创仓库主语言分布', body);
}

function vows() {
  return svg(380, 350, '道心札记 · 关于 Lehman', `
${txt(26, 37, '道心札记', 12, p.gold, 'letter-spacing="2"')}
${txt(26, 88, '逐风而行，', 30, p.text, serif)}
${txt(26, 132, '把灵感写成日常。', 30, p.text, serif)}
${txt(26, 182, '一名来自中国的 Vibe Coding 工程师。', 12, p.muted)}
${txt(26, 207, '在代码里造物，也在故事里远行。', 12, p.muted)}
<path d="M26 251Q103 224 192 249T352 238M26 262Q117 237 201 258T352 253" stroke="#43675b" stroke-width="1" fill="none"/>
${line(26, 294, 354)}
${txt(26, 324, '风不停，修行不止。', 11, p.gold)}
${txt(354, 324, 'LEHMAN', 10, p.muted, `${mono} letter-spacing="2" text-anchor="end"`)}
`);
}

function formations(mobile = false) {
  const w = mobile ? 380 : 780;
  return svg(w, 100, '诸天阵法 · 方寸之间，连通山海', `
${txt(26, 30, '诸天阵法', 12, p.gold, 'letter-spacing="2"')}
${txt(26, 69, '方寸之间，连通山海。', mobile ? 22 : 27, p.text, serif)}
<g transform="translate(${w - 57} 50)" fill="none" stroke="${p.gold}" stroke-width="1">
  <circle r="31" stroke-opacity=".15"/><circle r="22" stroke-opacity=".3"/>
  <path d="M0-22L19 11H-19ZM0 22L-19-11H19Z" stroke-opacity=".42"/>
  <path d="M-39 0H-29M29 0H39M0-39V-29M0 29V39" stroke-opacity=".25"/>
  <circle r="3" fill="${p.jade}" stroke="none"/>
</g>`, 100, 'top');
}

function navigation(label, caption, icon, mobile = false, last = false) {
  const w = mobile ? 380 : 780;
  return svg(w, 96, `诸天阵法 · ${label} · ${caption}`, `
${line(26, .75, w - 26)}
<rect x="24" y="25" width="46" height="46" rx="13" fill="#16312d" stroke="#315347"/>
<g transform="translate(35 36)" fill="none" stroke="${p.jade}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
${txt(86, 41, label, 17, p.text, 'font-weight="500"')}
${txt(86, 65, caption, 11, p.muted)}
<path d="M${w - 38} 33L${w - 28} 23M${w - 36} 23H${w - 28}V31" fill="none" stroke="${p.gold}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
`, 96, last ? 'bottom' : 'middle');
}

const files = {
  'hero.svg': hero(), 'hero-mobile.svg': hero(true), 'realm.svg': realm(), 'pet.svg': pet(),
  'activity.svg': activity(), 'activity-mobile.svg': activity(true),
  'arsenal.svg': arsenal(), 'arsenal-mobile.svg': arsenal(true),
  'formations.svg': formations(), 'formations-mobile.svg': formations(true),
  'languages.svg': languages(), 'vows.svg': vows(),
};
const sites = [
  ['逐风者', '个人天地与灵感起点', '<path d="M1 21L9 7L14 15L18 10L24 21Z"/><circle cx="18" cy="4" r="2.5"/><path d="M7 21L11 15"/>'],
  ['Lehman 博客', '文字、思考与日常记录', '<path d="M5 3H2V23H21V18M8 17L9 11L19 1L24 6L14 16ZM9 11L14 16M17 3L22 8M7 20H15"/>'],
  ['追风导航', '常用网址，一处抵达', '<circle cx="12" cy="12" r="10.5"/><path d="M16 7L14 14L7 17L10 10Z"/><circle cx="12" cy="12" r="1"/>'],
  ['追风网盘', '文件与资料的云端驿站', '<path d="M6 20H19A5 5 0 0 0 20 10A8 8 0 0 0 5 8A6 6 0 0 0 6 20Z"/><path d="M12 10V17M9 14L12 17L15 14"/>'],
  ['追风童话集', '收藏童心，让故事继续', '<path d="M12 5C8 2 4 3 1 4V21C5 20 8 20 12 23C16 20 19 20 23 21V4C20 3 16 2 12 5V23M5 9L8 10M5 13L8 14M16 9L19 8M16 13L19 12"/>'],
  ['GitHub', '代码与开源的修行之地', '<path d="M7 5L1 12L7 19M17 5L23 12L17 19M14 3L10 21"/>'],
];
sites.forEach(([label, caption, icon], i) => {
  files[`link-${i + 1}.svg`] = navigation(label, caption, icon, false, i === sites.length - 1);
  files[`link-${i + 1}-mobile.svg`] = navigation(label, caption, icon, true, i === sites.length - 1);
});
await mkdir(output, { recursive: true });
for (const [name, content] of Object.entries(files)) await writeFile(new URL(name, output), content, 'utf8');
if (!cached) await writeFile(new URL('data.json', output), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Generated ${Object.keys(files).length} cards for ${data.username}`);
console.log(`Source snapshot: ${data.updatedAt}; contributions: ${data.contributions ? 'available' : 'unavailable'}`);
