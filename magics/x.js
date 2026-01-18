// rook_magics.js — minimal rook magic finder + verifier (BigInt, Node.js)
// Usage:
//   node rook_magics.js
//   node rook_magics.js --quick
//   node rook_magics.js --seed 0x1234abcd
//
// Notes:
// - Uses xorshift64* with explicit 64-bit masking.
// - Verifier checks that, for every square, all blocker subsets hash to unique
//   indices and map to the correct rook attack set produced by sliding rays.

const MASK64 = (1n << 64n) - 1n;

// ---------------- PRNG: xorshift64* ----------------
let rand_seed = 0xDEADBEEFCAFEBABEn;
function setSeed(s) {
  if (typeof s === "string") {
    rand_seed = BigInt(s);
  } else if (typeof s === "number") {
    rand_seed = BigInt(s >>> 0);
  } else if (typeof s === "bigint") {
    rand_seed = s;
  }
  rand_seed &= MASK64;
  if (rand_seed === 0n) rand_seed = 1n;
}
function xorshift64star() {
  rand_seed ^= rand_seed >> 12n;
  rand_seed ^= (rand_seed << 25n) & MASK64;
  rand_seed ^= rand_seed >> 27n;
  rand_seed &= MASK64;
  return (rand_seed * 2685821657736338717n) & MASK64;
}

// ---------------- helpers ----------------
function popcount64(x) {
  let c = 0;
  while (x) {
    x &= x - 1n;
    c++;
  }
  return c;
}
function toHex64(n) {
  const s = (n & MASK64).toString(16);
  return "0x" + s.padStart(16, "0");
}
function bit(bb, sq) {
  return (bb >> BigInt(sq)) & 1n;
}

// ---------------- structures ----------------
class Attack {
  constructor() {
    this.bits = 0;         // number of relevant bits in mask
    this.count = 0;        // 1 << bits
    this.shift = 0;        // 64 - bits
    this.mask = 0n;        // relevant blockers mask (no edges)
    this.magic = 0n;       // found magic
    this.attacks = [];     // compacted table after magic found
  }
}

function magicIndex(blockers, magic, shift) {
  return Number(((blockers * magic) & MASK64) >> BigInt(shift));
}

// Enumerate all blocker subsets for a given mask, in index order
function getBlockers(a) {
  const bits = [];
  let m = a.mask;
  for (let s = 0; s < 64; s++) {
    if (m & (1n << BigInt(s))) bits.push(s);
  }
  const blockers = new Array(a.count);
  for (let i = 0; i < a.count; i++) {
    let bb = 0n;
    for (let j = 0; j < bits.length; j++) {
      if (i & (1 << j)) bb |= 1n << BigInt(bits[j]);
    }
    blockers[i] = bb;
  }
  return blockers;
}

// Compute rook attack rays from square `sq` given blocker bitboard `blockers`
function rookAttackFrom(sq, blockers) {
  const rank = Math.floor(sq / 8);
  const file = sq % 8;
  let attack = 0n;

  // up (increase rank)
  for (let r = rank + 1; r <= 7; r++) {
    const s = r * 8 + file;
    const bb = 1n << BigInt(s);
    attack |= bb;
    if (blockers & bb) break;
  }
  // down
  for (let r = rank - 1; r >= 0; r--) {
    const s = r * 8 + file;
    const bb = 1n << BigInt(s);
    attack |= bb;
    if (blockers & bb) break;
  }
  // right (increase file)
  for (let f = file + 1; f <= 7; f++) {
    const s = rank * 8 + f;
    const bb = 1n << BigInt(s);
    attack |= bb;
    if (blockers & bb) break;
  }
  // left
  for (let f = file - 1; f >= 0; f--) {
    const s = rank * 8 + f;
    const bb = 1n << BigInt(s);
    attack |= bb;
    if (blockers & bb) break;
  }

  return attack;
}

// Build rook masks and precompute true attacks per blocker subset (for building)
function init_rook_attacks() {
  const table = Array.from({ length: 64 }, () => new Attack());

  for (let sq = 0; sq < 64; sq++) {
    const a = table[sq];

    // Build mask excluding board edges
    const rank = Math.floor(sq / 8);
    const file = sq % 8;
    let mask = 0n;

    for (let f = file + 1; f <= 6; f++) mask |= 1n << BigInt(rank * 8 + f);
    for (let f = file - 1; f >= 1; f--)   mask |= 1n << BigInt(rank * 8 + f);
    for (let r = rank + 1; r <= 6; r++)   mask |= 1n << BigInt(r * 8 + file);
    for (let r = rank - 1; r >= 1; r--)   mask |= 1n << BigInt(r * 8 + file);

    a.mask = mask;
    a.bits = popcount64(mask);
    a.shift = 64 - a.bits;
    a.count = 1 << a.bits;

    // Precompute the ground-truth attacks for each blocker subset
    const blockers = getBlockers(a);
    a.attacks = new Array(a.count);
    for (let i = 0; i < a.count; i++) {
      a.attacks[i] = rookAttackFrom(sq, blockers[i]);
    }
  }
  return table;
}

// Magic finder (classic triple-AND + popcount screen)
function find_magics(attacks, label = "R") {
  let totalTries = 0;
  console.log(`T  Sq        Tries Bits Magic               Fill`);
  console.log(`-------------------------------------------------`);

  for (let sq = 0; sq < 64; sq++) {
    const a = attacks[sq];
    const blockers = getBlockers(a); // enumerate subset blockers for this square
    let tries = 0;

    for (;;) {
      tries++;

      const magic =
        xorshift64star() & xorshift64star() & xorshift64star();

      // popcount screen: ((mask * magic) >> (64 - bits)) should be "dense enough"
      const screen = ((a.mask * magic) & MASK64) >> BigInt(64 - a.bits);
      if (popcount64(screen) < a.bits - 2) continue;

      const table = new Array(a.count).fill(0n);
      let fail = false, filled = 0;

      for (let i = 0; i < a.count; i++) {
        const idx = magicIndex(blockers[i], magic, a.shift);
        if (table[idx] === 0n) {
          table[idx] = a.attacks[i];
          filled++;
        } else if (table[idx] !== a.attacks[i]) {
          fail = true;
          break;
        }
      }

      if (!fail) {
        a.magic = magic;
        a.attacks = table; // swap in the compacted table
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

function verifySquare(a, sq, quick = false) {
  // Regenerate blockers list (index order) OR sample randomly in quick mode
  const bits = [];
  for (let s = 0; s < 64; s++) if (a.mask & (1n << BigInt(s))) bits.push(s);

  const n = bits.length;
  const trials = quick ? Math.min(4096, 1 << Math.min(n, 16)) : (1 << n); // cap quick mode

  // In full mode, iterate all subsets in index order to match magic addressing
  if (!quick) {
    for (let i = 0; i < trials; i++) {
      let blockers = 0n;
      for (let j = 0; j < n; j++) if (i & (1 << j)) blockers |= 1n << BigInt(bits[j]);
      const idx = magicIndex(blockers, a.magic, a.shift);
      const want = rookAttackFrom(sq, blockers);
      const got = a.attacks[idx];
      if (got !== want) {
        return { ok: false, i, idx, want, got };
      }
    }
    return { ok: true };
  }

  // Quick mode: random samples
  for (let t = 0; t < trials; t++) {
    let bm = 0n;
    for (let j = 0; j < n; j++) {
      // coin flip from PRNG's low bit
      bm |= ((xorshift64star() & 1n) << BigInt(bits[j]));
    }
    const idx = magicIndex(bm, a.magic, a.shift);
    const want = rookAttackFrom(sq, bm);
    const got = a.attacks[idx];
    if (got !== want) {
      return { ok: false, i: -1, idx, want, got };
    }
  }
  return { ok: true };
}

function verifyAll(attacks, quick = false) {
  let allOk = true;
  for (let sq = 0; sq < 64; sq++) {
    const res = verifySquare(attacks[sq], sq, quick);
    if (!res.ok) {
      allOk = false;
      console.error(
        `Verify FAIL @ sq ${sq} (subset=${res.i}, idx=${res.idx})\n` +
        `want=${toHex64(res.want)} got=${toHex64(res.got)}`
      );
      break;
    }
  }
  if (allOk) {
    console.log(
      quick
        ? "Quick verify: OK (random samples)"
        : "Exhaustive verify: OK (all blocker subsets on all 64 squares)"
    );
  }
  return allOk;
}

// ---------------- main ----------------
(function main() {
  // Args: --quick, --seed 0x...
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  const seedIdx = args.indexOf("--seed");
  if (seedIdx !== -1 && args[seedIdx + 1]) {
    setSeed(args[seedIdx + 1]);
  }

  const rookAttacks = init_rook_attacks();
  find_magics(rookAttacks, "R");
  const ok = verifyAll(rookAttacks, quick);

  if (!ok) process.exit(1);
})();

