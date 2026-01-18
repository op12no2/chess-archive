// rook_magics_u32.js — Find rook magics using 2×uint32 bitboards (no BigInt)
// Usage:
//   node rook_magics_u32.js
//   node rook_magics_u32.js --quick
//   node rook_magics_u32.js --seed 0xDEADBEEFCAFEBABE

// ---------------- low-level helpers (uint32/uint64) ----------------
function u32(x) { return x >>> 0; }

function toHex64(u) {
  const h = (u.hi >>> 0).toString(16).padStart(8, "0");
  const l = (u.lo >>> 0).toString(16).padStart(8, "0");
  return "0x" + h + l;
}

function parseHex64(str) {
  let s = String(str).toLowerCase().replace(/^0x/, "");
  if (s.length > 16) s = s.slice(-16);
  s = s.padStart(16, "0");
  const hi = u32(parseInt(s.slice(0, 8), 16));
  const lo = u32(parseInt(s.slice(8), 16));
  return { lo, hi };
}

function eq64(a, b) { return a.lo === b.lo && a.hi === b.hi; }
function isZero64(a) { return ((a.lo | a.hi) >>> 0) === 0; }

function and64(a, b) { return { lo: u32(a.lo & b.lo), hi: u32(a.hi & b.hi) }; }
function or64(a, b)  { return { lo: u32(a.lo | b.lo), hi: u32(a.hi | b.hi) }; }
function xor64(a, b) { return { lo: u32(a.lo ^ b.lo), hi: u32(a.hi ^ b.hi) }; }

function shl64(a, s) {
  s |= 0;
  if (s === 0) return { lo: u32(a.lo), hi: u32(a.hi) };
  if (s >= 64) return { lo: 0, hi: 0 };
  if (s >= 32) return { lo: 0, hi: u32(a.lo << (s - 32)) };
  // 0 < s < 32
  return {
    lo: u32(a.lo << s),
    hi: u32((a.hi << s) | (a.lo >>> (32 - s))),
  };
}

function shr64(a, s) {
  s |= 0;
  if (s === 0) return { lo: u32(a.lo), hi: u32(a.hi) };
  if (s >= 64) return { lo: 0, hi: 0 };
  if (s >= 32) return { lo: u32(a.hi >>> (s - 32)), hi: 0 };
  // 0 < s < 32
  return {
    lo: u32((a.lo >>> s) | (a.hi << (32 - s))),
    hi: u32(a.hi >>> s),
  };
}

// 64-bit low-half multiply: (a * b) mod 2^64 using 16-bit limbs.
function mul64Low(a, b) {
  const a0 = a.lo & 0xFFFF, a1 = a.lo >>> 16, a2 = a.hi & 0xFFFF, a3 = a.hi >>> 16;
  const b0 = b.lo & 0xFFFF, b1 = b.lo >>> 16, b2 = b.hi & 0xFFFF, b3 = b.hi >>> 16;

  let p0 = Math.imul(a0, b0);                                   // word0 partial
  let p1 = Math.imul(a0, b1) + Math.imul(a1, b0);               // word1 partial
  let p2 = Math.imul(a0, b2) + Math.imul(a1, b1) + Math.imul(a2, b0);
  let p3 = Math.imul(a0, b3) + Math.imul(a1, b2) + Math.imul(a2, b1) + Math.imul(a3, b0);

  // carry across 16-bit words
  let w0 = p0 & 0xFFFF; p0 >>>= 16;
  p1 += p0; let w1 = p1 & 0xFFFF; p1 >>>= 16;
  p2 += p1; let w2 = p2 & 0xFFFF; p2 >>>= 16;
  p3 += p2; let w3 = p3 & 0xFFFF;

  return { lo: u32((w1 << 16) | w0), hi: u32((w3 << 16) | w2) };
}

function popcnt32(x) {
  x = x >>> 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  x = x + (x >>> 8);
  x = x + (x >>> 16);
  return x & 0x3f;
}
function popcnt64(u) { return popcnt32(u.lo) + popcnt32(u.hi); }

// Critically: keep masks unsigned when shifting 1 << b
function bitIsSet(u, sq) {
  if (sq < 32) return !!(u.lo & ((1 << sq) >>> 0));
  const b = sq - 32;
  return !!(u.hi & ((1 << b) >>> 0));
}
function setBit(u, sq) {
  if (sq < 32) return { lo: u32(u.lo | ((1 << sq) >>> 0)), hi: u32(u.hi) };
  const b = sq - 32;
  return { lo: u32(u.lo), hi: u32(u.hi | ((1 << b) >>> 0)) };
}

// ---------------- PRNG: xorshift64* (2×u32) ----------------
// State is 64-bit {lo,hi}. Multiplier is 0x2545F4914F6CDD1D.
let RNG = { lo: 0xCAFEBABE >>> 0, hi: 0xDEADBEEF >>> 0 };
const MUL = { lo: 0x4F6CDD1D >>> 0, hi: 0x2545F491 >>> 0 };

function setSeed64(x) {
  if (typeof x === "string") RNG = parseHex64(x);
  else if (typeof x === "number") RNG = { lo: u32(x), hi: 0 };
  else if (x && typeof x === "object" && "lo" in x && "hi" in x) RNG = { lo: u32(x.lo), hi: u32(x.hi) };
  if (!RNG.lo && !RNG.hi) RNG.lo = 1; // avoid zero state
}

function xorshift64star() {
  // s ^= s >> 12; s ^= s << 25; s ^= s >> 27; s *= MUL;
  let s = RNG;
  s = xor64(s, shr64(s, 12));
  s = xor64(s, shl64(s, 25));
  s = xor64(s, shr64(s, 27));
  s = mul64Low(s, MUL);
  RNG = s;
  return s;
}

// ---------------- core model ----------------
class Attack {
  constructor() {
    this.mask = { lo: 0, hi: 0 };
    this.bits = 0;
    this.shift = 0;
    this.count = 0;
    // truth tables for each subset (built once per square)
    this.truthLo = [];
    this.truthHi = [];
    // found magic + compacted table
    this.magic = { lo: 0, hi: 0 };
    this.tabLo = [];
    this.tabHi = [];
  }
}

function magicIndex(blockers, magic, shift) {
  // ((blockers * magic) >> shift) & ((1<<bits)-1)
  const prod = mul64Low(blockers, magic);
  const idx64 = shr64(prod, shift);
  return idx64.lo >>> 0; // rook bits <= 14 fits in 32
}

// enumerate subset blocker bitboards from mask, in index order
function enumerateBlockers(mask) {
  const bitpos = [];
  for (let s = 0; s < 64; s++) if (bitIsSet(mask, s)) bitpos.push(s);

  const count = 1 << bitpos.length;
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    let bb = { lo: 0, hi: 0 };
    for (let j = 0; j < bitpos.length; j++) if (i & (1 << j)) bb = setBit(bb, bitpos[j]);
    out[i] = bb;
  }
  return out;
}

function rookAttackFrom(sq, blockers) {
  const rank = (sq / 8) | 0;
  const file = (sq % 8) | 0;
  let att = { lo: 0, hi: 0 };

  // up
  for (let r = rank + 1; r <= 7; r++) {
    const s = r * 8 + file;
    att = setBit(att, s);
    if (bitIsSet(blockers, s)) break;
  }
  // down
  for (let r = rank - 1; r >= 0; r--) {
    const s = r * 8 + file;
    att = setBit(att, s);
    if (bitIsSet(blockers, s)) break;
  }
  // right
  for (let f = file + 1; f <= 7; f++) {
    const s = rank * 8 + f;
    att = setBit(att, s);
    if (bitIsSet(blockers, s)) break;
  }
  // left
  for (let f = file - 1; f >= 0; f--) {
    const s = rank * 8 + f;
    att = setBit(att, s);
    if (bitIsSet(blockers, s)) break;
  }
  return { lo: u32(att.lo), hi: u32(att.hi) };
}

function init_rook_attacks() {
  const A = Array.from({ length: 64 }, () => new Attack());

  for (let sq = 0; sq < 64; sq++) {
    const a = A[sq];
    const rank = (sq / 8) | 0;
    const file = sq % 8;

    // relevant mask (exclude edges)
    let mask = { lo: 0, hi: 0 };
    for (let f = file + 1; f <= 6; f++) mask = setBit(mask, rank * 8 + f);
    for (let f = file - 1; f >= 1; f--)   mask = setBit(mask, rank * 8 + f);
    for (let r = rank + 1; r <= 6; r++)   mask = setBit(mask, r * 8 + file);
    for (let r = rank - 1; r >= 1; r--)   mask = setBit(mask, r * 8 + file);

    a.mask  = { lo: u32(mask.lo), hi: u32(mask.hi) };
    a.bits  = popcnt64(a.mask);
    a.shift = 64 - a.bits;
    a.count = 1 << a.bits;

    const blockers = enumerateBlockers(a.mask);
    a.truthLo = new Uint32Array(a.count);
    a.truthHi = new Uint32Array(a.count);
    for (let i = 0; i < a.count; i++) {
      const att = rookAttackFrom(sq, blockers[i]);
      a.truthLo[i] = att.lo;
      a.truthHi[i] = att.hi;
    }
  }
  return A;
}

// find magics with triple-AND + popcount screen
function find_magics(A, label = "R") {
  let totalTries = 0;
  console.log(`T  Sq        Tries Bits Magic               Fill`);
  console.log(`-------------------------------------------------`);

  for (let sq = 0; sq < 64; sq++) {
    const a = A[sq];
    const subsets = enumerateBlockers(a.mask);

    let tries = 0;
    for (;;) {
      tries++;

      // magic candidate = rand & rand & rand
      const magic = and64(and64(xorshift64star(), xorshift64star()), xorshift64star());

      // popcount screen: popcnt(((mask * magic) >> (64-bits))) >= (bits - 2)
      const scr = shr64(mul64Low(a.mask, magic), 64 - a.bits);
      if (popcnt64(scr) < a.bits - 2) continue;

      const used = new Uint8Array(a.count);
      const tabLo = new Uint32Array(a.count);
      const tabHi = new Uint32Array(a.count);

      let fail = false, filled = 0;

      for (let i = 0; i < a.count; i++) {
        const idx = magicIndex(subsets[i], a.magic = magic, a.shift); // a.magic set for index calc
        if (!used[idx]) {
          used[idx] = 1;
          tabLo[idx] = a.truthLo[i];
          tabHi[idx] = a.truthHi[i];
          filled++;
        } else if (tabLo[idx] !== a.truthLo[i] || tabHi[idx] !== a.truthHi[i]) {
          fail = true;
          break;
        }
      }

      if (!fail) {
        a.magic = magic;
        a.tabLo = tabLo;
        a.tabHi = tabHi;
        const pct = Math.floor((100 * filled) / a.count);
        console.log(
          `${label}  ${String(sq).padStart(2)} ${String(tries).padStart(10)} ${String(a.bits).padStart(4)} ${toHex64(magic)} ${String(pct).padStart(4)}%`
        );
        totalTries += tries;
        break;
      }
    }
  }

  console.log(`-------------------------------------------------`);
  console.log(`Total tries for ${label}: ${totalTries}`);
}

// ---------------- verification ----------------
function rookAttackFromTable(a, sq, blockers) {
  const idx = magicIndex(blockers, a.magic, a.shift);
  return { lo: a.tabLo[idx] >>> 0, hi: a.tabHi[idx] >>> 0 };
}

function verifySquare(a, sq, quick = false) {
  const positions = [];
  for (let s = 0; s < 64; s++) if (bitIsSet(a.mask, s)) positions.push(s);
  const n = positions.length;

  if (!quick) {
    const total = 1 << n;
    for (let i = 0; i < total; i++) {
      let bb = { lo: 0, hi: 0 };
      for (let j = 0; j < n; j++) if (i & (1 << j)) bb = setBit(bb, positions[j]);
      const want = rookAttackFrom(sq, bb);
      const got  = rookAttackFromTable(a, sq, bb);
      if (want.lo !== got.lo || want.hi !== got.hi) {
        return { ok: false, i, idx: magicIndex(bb, a.magic, a.shift), want, got };
      }
    }
    return { ok: true };
  }

  // quick mode: random samples
  const samples = Math.min(4096, 1 << Math.min(n, 16));
  for (let t = 0; t < samples; t++) {
    let bb = { lo: 0, hi: 0 };
    for (let j = 0; j < n; j++) {
      const coin = xorshift64star().lo & 1;
      if (coin) bb = setBit(bb, positions[j]);
    }
    const want = rookAttackFrom(sq, bb);
    const got  = rookAttackFromTable(a, sq, bb);
    if (want.lo !== got.lo || want.hi !== got.hi) {
      return { ok: false, i: -1, idx: magicIndex(bb, a.magic, a.shift), want, got };
    }
  }
  return { ok: true };
}

function verifyAll(A, quick = false) {
  for (let sq = 0; sq < 64; sq++) {
    const res = verifySquare(A[sq], sq, quick);
    if (!res.ok) {
      console.error(
        `Verify FAIL @ sq ${sq} (subset=${res.i}, idx=${res.idx})\n` +
        `want=${toHex64(res.want)} got=${toHex64(res.got)}`
      );
      return false;
    }
  }
  console.log(quick ? "Quick verify: OK" : "Exhaustive verify: OK");
  return true;
}

// ---------------- main ----------------
(function main() {
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  const si = args.indexOf("--seed");
  if (si !== -1 && args[si + 1]) setSeed64(args[si + 1]);

  const A = init_rook_attacks();
  const t0=performance.now();
  find_magics(A, "R");
  console.log('time',performance.now()-t0,'ms');
  const ok = verifyAll(A, quick);
  if (!ok) process.exit(1);
})();

