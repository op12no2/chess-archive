
// rules to reformat engines using developers' conventions

const rules = [
  { find: /\b(32|64)[ -]?bit\b/i,       replace: "" },
  { find: /\b(4|8)[ ]?cpu\b/i,          replace: "" },
  { find: /-pext/i,                     replace: "" },
  { find: / pext-avx2/i,                replace: "" },
  { find: / avx2/i,                     replace: "" },
  { find: / avx512-pext/i,              replace: "" },
  { find: / avx512/i,                   replace: "" },
  { find: / ja-avx512/i,                replace: "" },
  { find: / zen5/i,                     replace: "" },
  { find: / a512/i,                     replace: "" },
  { find: / TI$/i,                      replace: "" },
  { find: / elo$/i,                     replace: "" },
  { find: / bmi2$/i,                    replace: "" },
  { find: / eas$/i,                     replace: "" },
  { find: /6a30/i,                      replace: "6 a30" },
  { find: /\bv(?=\d)/gi,                replace: "" },
  { find: / by komodo/i,                replace: "" },
  { find: /komododragon/i,              replace: "Dragon" },
  { find: /-consort/i,                  replace: " Consort" },
  { find: /\(consort\)/i,               replace: "Consort" },
  { find: /chess-system-tal/i,          replace: "Chess System Tal" },
  { find: /^sjeng 36/i,                 replace: "Sjeng 3.6" },
  { find: /^illumina (\d+)\.0\b/i,      replace: (_, num) => `Illumina ${num}` },
  { find: /^lozza (\d+)\.0\b/i,         replace: (_, num) => `Lozza ${num}` },
  { find: /^obsidian (\d+)\.0\b/i,      replace: (_, num) => `Obsidian ${num}` },
  { find: /^stormphrax (\d+)\.0$/i,     replace: (_, n) => `Stormphrax ${n}.0.0` },
  { find: /^viridithas (\d+)\.0$/i,     replace: (_, n) => `Viridithas ${n}.0.0` },
  { find: /^tantabus (\d+)\.0$/i,       replace: (_, n) => `Tantabus ${n}.0.0` },
  { find: /^integral (\d+)$/i,          replace: (_, n) => `Integral ${n}.0.0` },
  { find: /^halogen (\d+)$/i,           replace: (_, n) => `Halogen ${n}.0.0` },
  { find: /^alexandria (\d+)\.(\d+)$/i, replace: (_, major, minor) => `Alexandria ${major}.${minor}.0` },
  { find: /^lynx (\d+)\.(\d+)$/i,       replace: (_, major, minor) => `Lynx ${major}.${minor}.0` },
];

export function applyRules(str) {
  str = str.replace(/\s{2,}/g, " ").trim();
  for (const r of rules) {
    str = str.replace(r.find, r.replace);
    str = str.replace(/\s{2,}/g, " ").trim();
  }
  return str.replace(/\s{2,}/g, " ").trim();
}

