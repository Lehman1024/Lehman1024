<!--
Lehman's cultivation-themed GitHub profile, card layout, and maintenance guide.

@author Lehman+AI
@site https://www.lehman.top
@since 2026/10/10 17:33
-->

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/profile/hero-mobile.svg">
    <img src="assets/profile/hero.svg" width="780" alt="逐风修行录 · Lehman — 以01为剑，以AI入道">
  </picture>
</p>

<p align="center">
  <img src="assets/profile/realm.svg" width="380" alt="修行境界 — GitHub 注册年限与当前境界">
  &nbsp;
  <img src="assets/profile/pet.svg" width="380" alt="随身灵宠 · 青岚 — 随 GitHub 贡献积累修为">
</p>

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/profile/activity-mobile.svg">
    <img src="assets/profile/activity.svg" width="780" alt="岁修录 — GitHub 贡献记录，桌面近一年，手机最近 16 周">
  </picture>
</p>

<div align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/profile/formations-mobile.svg">
    <img src="assets/profile/formations.svg" width="780" align="top" alt="诸天阵法 · 方寸之间，连通山海">
  </picture><br>
  <a href="https://www.lehman.top/">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-1-mobile.svg">
      <img src="assets/profile/link-1.svg" width="780" align="top" alt="逐风者 · 个人天地与灵感起点">
    </picture>
  </a><br>
  <a href="https://blog.lehman.top/">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-2-mobile.svg">
      <img src="assets/profile/link-2.svg" width="780" align="top" alt="Lehman 博客 · 文字、思考与日常记录">
    </picture>
  </a><br>
  <a href="https://www.windseeker.link/">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-3-mobile.svg">
      <img src="assets/profile/link-3.svg" width="780" align="top" alt="追风导航 · 常用网址，一处抵达">
    </picture>
  </a><br>
  <a href="https://disk.windseeker.link/">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-4-mobile.svg">
      <img src="assets/profile/link-4.svg" width="780" align="top" alt="追风网盘 · 文件与资料的云端驿站">
    </picture>
  </a><br>
  <a href="https://fairy-tales.windseeker.link/">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-5-mobile.svg">
      <img src="assets/profile/link-5.svg" width="780" align="top" alt="追风童话集 · 收藏童心，让故事继续">
    </picture>
  </a><br>
  <a href="https://github.com/Lehman1024">
    <picture>
      <source media="(max-width: 600px)" srcset="assets/profile/link-6-mobile.svg">
      <img src="assets/profile/link-6.svg" width="780" align="top" alt="GitHub · 代码与开源的修行之地">
    </picture>
  </a>
</div>
<br>

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/profile/arsenal-mobile.svg">
    <img src="assets/profile/arsenal.svg" width="780" alt="随身法器 — 技术栈与创作工具">
  </picture>
</p>

<p align="center">
  <img src="assets/profile/languages.svg" width="380" alt="灵根谱 — 公开非 Fork 仓库的主要语言分布">
  &nbsp;
  <img src="assets/profile/vows.svg" width="380" alt="道心札记 — 关于 Lehman 与持续创造">
</p>

<h2 align="center">山海有期，逐风不止。</h2>

<details>
  <summary>修行法则 · 数据如何计算</summary>
  <p>境界按 GitHub 注册年限计算：0 年练气、1 年筑基、2 年金丹、3 年元婴、5 年化神、8 年炼虚、12 年合体、16 年大乘、20 年渡劫、25 年飞升。</p>
  <p>灵宠始终名为「青岚」，成长阶段按近一年贡献总数计算：0 龙蛋、50 幼龙、200 青龙、800 应龙、2000 神龙。贡献采用 GitHub 的贡献统计口径，包括符合条件的提交、议题、拉取请求等，不等同于提交次数。</p>
  <p>修行日历在桌面展示近一年，在手机展示最近 16 周。语言分布按公开非 Fork 仓库的主要语言计数；获得的 Star 也仅汇总公开非 Fork 仓库。</p>
  <p>每天北京时间 08:17 定时更新，实际执行可能延迟。岁修录标注数据更新时间；账户资料抓取失败时停止更新，贡献日历无法获取时显示缺失，不编造数值。连续天数在今日尚未贡献时允许从昨天起算，日期采用 GitHub 贡献日历口径。</p>
</details>

<details>
  <summary>洞府维护 · 本地生成与预览</summary>
  <p>使用 Node.js 22，在仓库根目录运行以下命令。联网更新可设置环境变量 <code>GITHUB_TOKEN</code>，GitHub Actions 会自动提供。</p>
  <pre><code>node scripts/generate-profile.mjs
node scripts/generate-profile.mjs --cached
node scripts/preview.mjs
node --test scripts/github-data.test.mjs</code></pre>
  <p>第一条抓取数据并生成卡片，第二条使用本地缓存重新生成，第三条启动预览，第四条验证贡献数据解析与异常处理。预览地址：<a href="http://127.0.0.1:8787/">http://127.0.0.1:8787/</a>；浅色背景：<a href="http://127.0.0.1:8787/?theme=light">?theme=light</a>。</p>
</details>
