
/*{{{  fold marker*/

/*}}}*/

import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import * as cheerio from 'cheerio';
import { sites } from './sites.js';
import { getEngineTags, getAllTagKeys } from './tags.js';
import { applyRules } from './rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const __data     = path.join(__dirname, 'data.js');
const __html     = path.join(__dirname, 'index.htm');

const data = [];

/* Helpers */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

function looksLikeCloudflare(html, status) {
  if (!html) return false;
  if (status === 403) return true;
  const h = html.slice(0, 2000);
  return /Just a moment/i.test(h) ||
         /cf-.*challenge/i.test(h) ||
         /cf-browser-verification/i.test(h) ||
         /data-cf-beacon/i.test(h) ||
         /captcha/i.test(h);
}

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithNode(url, referer) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        // Node’s TLS fingerprint is still detectable, but these headers help a bit:
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'sec-ch-ua': '"Chromium";v="121", "Not A(Brand";v="99", "Google Chrome";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        ...(referer ? { 'Referer': referer } : {})
      },
      redirect: 'follow'
    });
  } catch (err) {
    return { ok: false, status: 0, statusText: String(err), text: '' };
  }

  const text = await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, statusText: res.statusText, text };
}

async function fetchWithPlaywright(url, referer) {
  let pw;
  try {
    pw = await import('playwright');
  } catch (e) {
    return { ok: false, status: 0, statusText: 'playwright-not-installed', text: '' };
  }

  const { chromium } = pw;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: UA,
      viewport: { width: 1365, height: 900 },
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
        ...(referer ? { 'Referer': referer } : {})
      }
    });
    const page = await context.newPage();
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // If Cloudflare page shows up, wait a bit for the check to complete.
    try {
      await page.waitForFunction(
        () => !/just a moment/i.test(document.title) &&
              !document.querySelector('#challenge-running') &&
              !document.querySelector('[data-translate="turnstile-error"]'),
        { timeout: 20000 }
      );
    } catch {
      // ignore; we’ll still try to read content
    }

    // Final wait to let any meta refresh/redirect settle
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const html = await page.content();
    const status = resp ? resp.status() : 0;
    return { ok: true, status, statusText: 'OK', text: html };
  } finally {
    await browser.close();
  }
}

async function fetchHtml(url, referer) {
  // 1) Try Node fetch
  const n = await fetchWithNode(url, referer);
  if (n.ok && !looksLikeCloudflare(n.text, n.status)) {
    return n.text;
  }

  // 2) Fallback to Playwright if blocked
  const p = await fetchWithPlaywright(url, referer);
  if (p.ok && p.text && !looksLikeCloudflare(p.text, p.status)) {
    return p.text;
  }

  // 3) If playwright not installed or still blocked, surface best error
  const reason = n.ok ? `blocked (${n.status})` : (n.statusText || 'blocked');
  const extra  = p.statusText === 'playwright-not-installed'
    ? ' (install with "npm i playwright" for fallback)'
    : '';
  throw new Error(`cannot fetch ${url}: ${reason}${extra}`);
}

/*{{{  scrape sites*/

for (const s of sites) {
  if (!s.enabled) continue;

  // Use the site’s own domain as referer if available
  const referer = (() => {
    try {
      const u = new URL(s.url);
      return `${u.protocol}//${u.host}/`;
    } catch {
      return undefined;
    }
  })();

  let html = '';
  try {
    html = await fetchHtml(s.url, referer);
  } catch (err) {
    console.error(String(err).slice(0, 500));
    // don’t abort the whole run — continue with the next site
    continue;
  }

  const $ = cheerio.load(html);
  let ratings = [];
  try {
    ratings = s.extract($) || [];
  } catch (e) {
    console.error(`extract() threw for ${s.id}:`, e);
    continue;
  }

  for (const r0 of ratings) {
    const r = { ...r0 };
    console.log(s.id, r.engine, r.value);

    r.engine = applyRules(r.engine);
    let d = data.find(d => d.engine.toLowerCase() === r.engine.toLowerCase());

    if (!d) {
      d = { engine: r.engine };
      data.push(d);
    }

    d[s.id] = r.value;
  }

  // small delay to be polite and avoid tripping rate limits
  await sleep(500);
}

/*}}}*/
/*{{{  add tags*/

for (const d of data) {
  const found = getEngineTags(d.engine);
  for (const f of found) {
    for (const [key, value] of Object.entries(f)) {
      if (value === undefined || value === null) continue;
      d[key] = value;
    }
  }
}

/*}}}*/

const dataStr = JSON.stringify(data, null, 2);
JSON.parse(dataStr);
writeFileSync(__data, `const tabledata = ${dataStr};`, 'utf8');

/*{{{  create index.htm*/

const nocache = Date.now();

/*{{{  get update string*/

const d         = new Date();
const day       = d.getDate();
const month     = d.toLocaleString('en-GB', { month: 'short' });
const year      = d.getFullYear();
const hh        = String(d.getHours()).padStart(2, '0');
const mm        = String(d.getMinutes()).padStart(2, '0');
const updateStr = `Elox updated on ${day} ${month} ${year} at ${hh}${mm} UTC`;

/*}}}*/
/*{{{  create tag columns*/

let tagColumns = '';
let tagList    = '';

for (const key of getAllTagKeys()) {
  tagList += `'${key}',`;
  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  tagColumns += `{title: "${cap}", field: "${key}", sorter: "string", headerFilter: "input", headerSortStartingDir: "desc"},\n`;
}

tagList += `''`;

/*}}}*/
/*{{{  create rating columns*/

let ratingColumns     = '';
let initialSortColumn = '';
let ratingList        = '';

for (const s of sites) {
  if (!s.enabled) continue;
  if (s.initialSortColumn) initialSortColumn = s.id;
  ratingList += `'${s.id}',`;
  ratingColumns += `{title: "<a href='${s.url}' target='_blank' style='color:inherit;text-decoration:none' onclick='event.stopPropagation()'>${s.head1}</a>${s.head2}", field: "${s.id}", sorter: "number", headerSortStartingDir: "desc"},\n`;
}

ratingList += `''`;

/*}}}*/
/*{{{  create html*/

let html = `
<!DOCTYPE html>
<html lang="en">
<head>
<title>elox</title>
<link href="https://unpkg.com/tabulator-tables/dist/css/tabulator_site_dark.min.css" rel="stylesheet">
<link href="./ui.css?nocache=${nocache}" rel="stylesheet">
</head>
<body>
<div id="elox"></div>
<script src="https://cdn.jsdelivr.net/npm/luxon/build/global/luxon.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
<script type="text/javascript" src="data.js?nocache=${nocache}"></script>
<script type="text/javascript">
const tagList=[${tagList}];
tagList.pop();
const ratList=[${ratingList}];
ratList.pop();
const tagSet=new Set([${tagList}]);
tagSet.delete('');
const ratSet=new Set([${ratingList}]);
ratSet.delete('');
Tabulator.extendModule("filter", "filters", {
  "notlike": function(headerValue, rowValue, rowData, filterParams) {
    if (!headerValue || !rowValue) return true;
    headerValue = headerValue.toLowerCase();
    rowValue = rowValue.toLowerCase();
    return rowValue.includes(headerValue) ? false : true;
  }
});
const table = new Tabulator("#elox", {
  data: tabledata,
  sortOrderReverse: true,
  movableColumns: true,
  layout: "fitData",
  initialSort: [{column:"${initialSortColumn}", dir:"desc"}],
  columns: [
    {title: "<a id='userdesc' href='https://github.com/op12no2/elox' target='_blank' style='color:inherit;text-decoration:none'>${updateStr}</a>", headerHozAlign: "center", columns: [
      ${tagColumns}
      {title: "Engine", field: "engine", sorter: "string", headerFilter: "input", headerSortStartingDir: "asc"},
      {title: "", formatter: "rownum", headerSort: false},
      ${ratingColumns}
    ]}
  ]
});
</script>
<script type="text/javascript" src="ui.js?nocache=${nocache}"></script>
</body>
</html>
`;

/*}}}*/
/*{{{  tidy html*/

html = html.replace(/\r\n?/g, '\n');
html = html.replace(/^[ \t]*\n/gm, '').replace(/^[ \t]+$/gm, '');

/*}}}*/

writeFileSync(__html, html, 'utf8');

/*}}}*/

