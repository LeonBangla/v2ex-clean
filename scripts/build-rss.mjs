import fs from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import RSS from 'rss';

const SOURCE_URL = 'https://www.v2ex.com/index.xml';
const SITE_URL = 'https://www.v2ex.com/';
const OUT_DIR = path.resolve('public');
const OUT_FILE = path.join(OUT_DIR, 'v2ex-clean.xml');
const INDEX_FILE = path.join(OUT_DIR, 'index.html');

const BLOCK_CATEGORY = '推广';

function getCategories(item) {
  const cats = [];

  if (Array.isArray(item.categories)) {
    cats.push(...item.categories);
  }

  if (item.category) {
    cats.push(item.category);
  }

  return cats
    .filter(Boolean)
    .map(x => String(x).trim());
}

function isBlocked(item) {
  const categories = getCategories(item);
  return categories.includes(BLOCK_CATEGORY);
}

function normalizeDate(item) {
  if (item.isoDate) return new Date(item.isoDate);
  if (item.pubDate) return new Date(item.pubDate);
  return new Date();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 RSS Cleaner for Inoreader'
    }
  });

  const source = await parser.parseURL(SOURCE_URL);
  const rawItems = source.items || [];
  const cleanItems = rawItems.filter(item => !isBlocked(item));

  const feed = new RSS({
    title: 'V2EX 最新主题（去推广）',
    description: '基于 V2EX 官方 RSS 自动生成，仅过滤“推广”分类。',
    feed_url: 'https://LeonBangla.github.io/v2ex-clean/v2ex-clean.xml',
    site_url: SITE_URL,
    language: 'zh-CN',
    pubDate: new Date(),
    ttl: 10
  });

  for (const item of cleanItems) {
    feed.item({
      title: item.title || '无标题',
      url: item.link,
      guid: item.guid || item.link,
      date: normalizeDate(item),
      description: item.content || item.contentSnippet || item.summary || '',
      categories: getCategories(item)
    });
  }

  fs.writeFileSync(OUT_FILE, feed.xml({ indent: true }), 'utf8');

  const now = new Date();
  fs.writeFileSync(INDEX_FILE, `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>V2EX 最新主题（去推广）</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,"Microsoft YaHei",sans-serif;max-width:760px;margin:40px auto;padding:0 18px;line-height:1.7}
code{background:#f3f4f6;padding:2px 6px;border-radius:6px}
a{color:#2563eb}
</style>
</head>
<body>
<h1>V2EX 最新主题（去推广）</h1>
<p>RSS 地址：<a href="./v2ex-clean.xml">v2ex-clean.xml</a></p>
<p>Inoreader 订阅地址：</p>
<p><code>https://LeonBangla.github.io/v2ex-clean/v2ex-clean.xml</code></p>
<p>原始 RSS：<a href="${SOURCE_URL}">${SOURCE_URL}</a></p>
<p>过滤规则：去掉分类/标签为 <code>${BLOCK_CATEGORY}</code> 的条目</p>
<p>最近生成：${now.toLocaleString('zh-CN', { hour12: false })}</p>
<p>原始条数：${rawItems.length}；保留条数：${cleanItems.length}；过滤条数：${rawItems.length - cleanItems.length}</p>
</body>
</html>`, 'utf8');

  console.log(`已生成 ${OUT_FILE}`);
  console.log(`原始条数：${rawItems.length}，保留条数：${cleanItems.length}，过滤条数：${rawItems.length - cleanItems.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
