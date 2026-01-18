
/*{{{  ccrl*/

export function ccrlExtract($) {
  const rows   = $('table.rating_table tr').slice(2);
  const result = [];
  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 3) return;
    const a = $(tds[1]).find('a');
    if (!a.length) return;
    const engine = a.text().trim();
    const value = parseInt($(tds[2]).text().replace(/[^\d-]/g, ''), 10);
    if (!Number.isFinite(value)) return;
    if (!engine.includes("CPU")) result.push({engine, value});
  });
  return result;
}

export function ccrlExtract2($) {
  const rows   = $('table.rating_table tr').slice(2);
  const result = [];
  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 3) return;
    const a = $(tds[1]).find('a');
    if (!a.length) return;
    const engine = a.text().trim();
    const value = parseInt($(tds[2]).text().replace(/[^\d-]/g, ''), 10);
    if (!Number.isFinite(value)) return;
    if (engine.includes("CPU")) result.push({engine, value});
  });
  return result;
}

/*}}}*/
/*{{{  pohl*/

export function pohlExtractEas($) {
  // Get a clean, texty blob with line structure preserved
  let full = $.root().text()
    .replace(/\u00A0/g, " ")  // nbsp -> space
    .replace(/\r/g, "")       // CR -> nothing
    .replace(/[ \t]+/g, " ")  // collapse runs of spaces
    .replace(/[ \t]+\n/g, "\n") // trim right spaces
    .replace(/\n[ \t]+/g, "\n"); // trim left spaces
  // Find the first EAS table by its header
  const startIdx = full.search(/Rank\s+EAS-Score\s+sacs/i);
  if (startIdx === -1) return [];
  // Slice from header onward
  let tail = full.slice(startIdx);
  // Drop the header line and the immediate dashed separator line below it
  // (header line -> newline -> a row of dashes -> newline)
  tail = tail.replace(/^.*\n-+\n/, "");
  // Keep only up to the next dashed line (end of this table)
  const rowsPart = (tail.split(/\n-+\n/, 1)[0] || "").trim();
  if (!rowsPart) return [];
  // Each logical "row" should now be on its own line. Match:
  //  rank         : ^\s*\d+
  //  score        : (\d+)  (second column, plain integer)
  //  ...stuff...  : [^\n]*?
  //  moves        : (\d{2,3}) (avg.win moves; no %)
  //  engine       : ([^\n]+) (rest of line)
  //
  // We deliberately grab the *last* plain integer before the engine as "moves"
  // via a lazy [^\n]*? then a `\s(\d{2,3})\s+([^\n]+)$`.
  const rowRx = /^\s*\d+\s+(\d+)[^\n]*?\s(\d{2,3})\s+([^\n]+?)\s*$/gm;
  const out = [];
  let m;
  while ((m = rowRx.exec(rowsPart)) !== null) {
    const score = parseInt(m[1], 10);
    const engine = m[3].replace(/\s{2,}/g, " ").trim();
    if (Number.isFinite(score) && engine) {
      out.push({ engine, value: score });
    }
  }
  return out;
}


export function pohlExtract15($) {
  let full = $.root().text();
  // Normalise so regex is predictable
  full = String(full)
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Slice to the monospaced table: after the header, before the "Games :" footer
  const afterHeader = full.split(/Program\s+Celo/i)[1] || "";
  const block = (afterHeader.split(/Games\s*:/i)[0] || "").trim();
  if (!block) return [];
  // Match: rank (1–2 digits), engine (letters first, up to ':'), colon, 3–4 digit Celo
  // Requiring engine to start with a letter stops those “3 15000 …” shards being captured.
  const rx = /(?:^|\s)\d{1,2}\s+([A-Za-z][^:]*?)\s*:\s*(\d{3,4})\b/g;
  const out = [];
  for (const m of block.matchAll(rx)) {
    const engine = m[1].replace(/\s{2,}/g, " ").trim();
    const value  = parseInt(m[2], 10);
    if (engine && Number.isFinite(value)) out.push({ engine, value });
  }
  return out;
}

/*}}}*/
/*{{{  ipman*/

export function ipExtractElostat($) {
  // one big text blob
  let full = $.root().text()
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "");
  // slice Elostat block only
  const after = full.split(/Elostat:/i)[1] || "";
  const elostatBlock = (after.split(/Ordo:/i)[0] || "").trim();
  if (!elostatBlock) return [];
  // Scan for: rank (1–31) + engine (anything until the colon) + ":" + integer Elo
  // No anchors, no newlines needed.
  const rowRx = /\b\d{1,2}\s+([A-Za-z][^:]*?)\s*[::]\s*(\d{3,4})\b/g;
  const out = [];
  for (const m of elostatBlock.matchAll(rowRx)) {
    const engine = m[1].replace(/\s{2,}/g, " ").trim();
    const value  = parseInt(m[2], 10);
    if (Number.isFinite(value)) out.push({ engine, value });
  }
  return out;
}

export function ipExtractOrdo($) {
  // whole page as text
  let full = $.root().text()
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "");
  // slice just the Ordo block
  const after = full.split(/Ordo:/i)[1] || "";
  const ordoBlock = (after.split(/Gamepairs:|Standing on|STANDING/i)[0] || "").trim();
  if (!ordoBlock) return [];
  // Scan: rank + engine (until the colon) + ":" + Elo (allows decimals)
  const rowRx = /\b\d{1,2}\s+([A-Za-z][^:]*?)\s*:\s*([0-9]{3,4}(?:\.\d+)?)/g;
  const out = [];
  for (const m of ordoBlock.matchAll(rowRx)) {
    const engine = m[1].replace(/\s{2,}/g, " ").trim();
    const value  = parseFloat(m[2]);   // Ordo has decimals
    if (Number.isFinite(value)) out.push({ engine, value });
  }
  return out;
}

export function ipExtract101($) {
  // Pull all text & normalise whitespace
  let full = $.root().text();
  full = String(full)
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Slice to only the score-table block:
  // start after the header "Elo + - Games"
  const startMatch =
    full.match(/Elo\s*\+\s*-\s*Games/i) ||
    full.match(/Program\s+Elo\s*\+\s*-\s*Games/i);
  if (!startMatch) return [];
  let work = full.slice(startMatch.index + startMatch[0].length);
  // end before the summary line "Games : 382.500 ..." (note the colon)
  const endMatch = work.match(/Games\s*:\s*\d[\d.\s]*/i);
  if (endMatch) work = work.slice(0, endMatch.index);
  // Now match rows like:
  // "12 Alexandria 8.1.0 avx512 : 3568"
  // Important: require the engine to start with a letter to avoid grabbing the "+ column" numbers
  const rowRx = /\b\d{1,3}\s+([A-Za-z][^:]*?)\s*:\s*(\d{3,4})\b/g;
  const out = [];
  for (const m of work.matchAll(rowRx)) {
    const engine = m[1].replace(/\s{2,}/g, " ").trim();
    const value = parseInt(m[2], 10);
    if (engine && Number.isFinite(value)) out.push({ engine, value });
  }
  return out;
}

/*}}}*/
/*{{{  rbb*/

function rbbExtract324($) {
  const pre = $('.right-column pre');
  if (!pre.length) return [];

  const text = pre.text();
  const lines = text.split(/\r?\n/);
  const out = [];

  // Lines look like:
  // "   1 Stockfish 17.1       :    3859      8 ..."
  const rowRe = /^\s*\d+\s+(.+?)\s*:\s*([0-9][0-9.,']*)\b/;

  for (const line of lines) {
    const m = rowRe.exec(line);
    if (!m) continue;

    const engine = m[1].trim();
    const rating = parseInt(m[2].replace(/[^\d-]/g, ""), 10);

    if (engine && Number.isFinite(rating)) {
      out.push({ engine, value: rating });
    }
  }

  return out;
}

/*}}}*/

export const sites = [
  {
    id: 'ccrl40154',
    initialSortColumn: 1,
    head1: "CCRL",
    head2: "<br>40/15<br>4 Threads",
    enabled: 1,
    url: 'https://computerchess.org.uk/ccrl/4040/',
    extract: ccrlExtract2,
  },
  {
    id: 'ccrl4015',
    initialSortColumn: 0,
    head1: "CCRL",
    head2: "<br>40/15<br>1 Thread",
    enabled: 1,
    url: 'https://computerchess.org.uk/ccrl/4040/',
    extract: ccrlExtract,
  },
  {
    id: 'ccrlblitz8',
    initialSortColumn: 0,
    head1: "CCRL",
    head2: "<br>Blitz<br>8 Threads",
    enabled: 1,
    url: 'https://computerchess.org.uk/ccrl/404/',
    extract: ccrlExtract2,
  },
  {
    id: 'ccrlblitz',
    initialSortColumn: 0,
    head1: "CCRL",
    head2: "<br>Blitz<br>1 Thread",
    enabled: 1,
    url: 'https://computerchess.org.uk/ccrl/404/',
    extract: ccrlExtract,
  },
  {
    id: 'ccrlfrc',
    initialSortColumn: 0,
    head1: "CCRL",
    head2: "<br>FRC<br>1 Thread",
    enabled: 1,
    url: 'https://computerchess.org.uk/ccrl/404FRC/',
    extract: ccrlExtract,
  },
  {
    id: 'pohl15',
    initialSortColumn: 0,
    head1: "SPCC",
    head2: "<br>Top 15<br>1 Thread",
    enabled: 1,
    url: 'https://www.sp-cc.de/index.htm',
    extract: pohlExtract15,
  },
  {
    id: 'pohleas',
    initialSortColumn: 0,
    head1: "SPCC",
    head2: "<br>EAS<br>1 Thread",
    enabled: 1,
    url: 'https://www.sp-cc.de/eas-ratinglist.htm',
    extract: pohlExtractEas,
  },
  {
    id: 'ip101',
    initialSortColumn: 0,
    head1: "Ipman",
    head2: "<br>10+1<br>1 Thread",
    enabled: 1,
    url: 'https://ipmanchess.yolasite.com/r9-7945hx.php',
    extract: ipExtract101,
  },
  {
    id: 'rbb324',
    initialSortColumn: 0,
    head1: "Chess 324",
    head2: "<br>Top 15 RR<br>1 Thread",
    enabled: 1,
    url: 'https://e4e6.com/324/',
    extract: rbbExtract324,
  },
  {
    id: 'ipuho24e',
    initialSortColumn: 0,
    enabled: 0,
    url: 'https://ipmanchess.yolasite.com/r9-7945hx-uho2024.php',
    extract: ipExtractElostat,
  },
  {
    id: 'ipuho24o',
    initialSortColumn: 0,
    enabled: 0,
    url: 'https://ipmanchess.yolasite.com/r9-7945hx-uho2024.php',
    extract: ipExtractOrdo,
  },
];

