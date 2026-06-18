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

const text = [
item.title || '',
item.content || '',
item.contentSnippet || '',
item.summary || '',
item.link || ''
].join(' ');

return (
categories.includes(BLOCK_CATEGORY) ||
text.includes('推广') ||
text.includes('/go/promotions') ||
text.includes('/go/promotion')
);
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
'User-Agent': 'Mozilla/5.0 RSS Cleaner'
}
});

const source = await parser.parseURL(SOURCE_URL);

const rawItems = source.items || [];

const cleanItems = rawItems.filter(item => !isBlocked(item));

const feed = new RSS({
title: 'V2EX 最新主题（去推广）',
description: '基于 V2EX 官方 RSS 自动生成，仅过滤推广内容。',
feed_url: 'https://leonbangla.github.io/v2ex-clean/v2ex-clean.xml',
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
description:
item.content ||
item.contentSnippet ||
item.summary ||
'',
categories: getCategories(item)
});
}

fs.writeFileSync(
OUT_FILE,
feed.xml({ indent: true }),
'utf8'
);

const now = new Date();

fs.writeFileSync(
INDEX_FILE,
`<!doctype html>

<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>V2EX 最新主题（去推广）</title>
</head>
<body>
<h1>V2EX 最新主题 RSS（去推广）</h1>

<p>RSS 地址：</p>

<p>
<a href="./v2ex-clean.xml">
v2ex-clean.xml
</a>
</p>

<p>更新时间：${now.toLocaleString('zh-CN')}</p>

<p>原始条数：${rawItems.length}</p>

<p>过滤后条数：${cleanItems.length}</p>

</body>
</html>`,
    'utf8'
  );

console.log(
`原始:${rawItems.length} 保留:${cleanItems.length}`
);
}

main().catch(err => {
console.error(err);
process.exit(1);
});
