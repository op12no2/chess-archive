// === Magic generator (2x32) for bishops & rooks ===
// Colin-style: 2 spaces; { on same line; else on next line.

const DIRS_ROOK = [ 8, -8, 1, -1 ];
const DIRS_BISH = [ 9, 7, -7, -9 ];

function fileOf(sq) { return sq & 7; }
function rankOf(sq) { return sq >>> 3; }

function setBit(lo, hi, sq) {
  if (sq < 32) lo |= (1 << sq) >>> 0;
  else hi |= (1 << (sq - 32)) >>> 0;
  return [lo >>> 0, hi >>> 0];
}
function testBit(lo, hi, sq) {
  if (sq < 32) return ((lo >>> sq) & 1) !== 0;
  else return ((hi >>> (sq - 32)) & 1) !== 0;
}

function rayMask(sq, dirs, edgeStop) {
  let lo = 0, hi = 0;
  for (const d of dirs) {
    let s = sq;
    while (true) {
      const r = rankOf(s), f = fileOf(s);
      const nr = r + Math.sign(d) * (d === 1 || d === -1 ? 0 : (d > 0 ? 1 : -1)); // not used; just clarity
      const ns = s + d;
      if (ns < 0 || ns > 63) break;
      const rf = Math.abs(fileOf(ns) - f);
      const rr = Math.abs(rankOf(ns) - r);
      const ok = (d === 1 || d === -1) ? (rr === 0 && rf === 1)
                : (d === 8 || d === -8) ? (rf === 0 && rr === 1)
                : (rf === 1 && rr === 1);
      if (!ok) break;
      if (edgeStop(ns, d)) break;   // stop before edge squares for mask
      [lo, hi] = setBit(lo, hi, ns);
      s = ns;
    }
  }
  return [lo, hi];
}

function rookMask(sq) {
  const edgeStop = (ns, d) => {
    const f = fileOf(ns), r = rankOf(ns);
    if (d === 1 || d === -1) return f === 0 || f === 7;
    else return r === 0 || r === 7;
  };
  return rayMask(sq, DIRS_ROOK, edgeStop);
}

function bishopMask(sq) {
  const edgeStop = (ns, _d) => {
    const f = fileOf(ns), r = rankOf(ns);
    return f === 0 || f === 7 || r === 0 || r === 7;
  };
  return rayMask(sq, DIRS_BISH, edgeStop);
}

// Convert mask -> list of squares (bit positions)
function bitListFromMask(lo, hi) {
  const out = [];
  for (let s = 0; s < 64; s++) if (testBit(lo, hi, s)) out.push(s);
  return out;
}

// Build a bitboard (lo,hi) from a subset index (0..(1<<n)-1) over a bit list
function bitboardFromSubset(bits, subset) {
  let lo = 0, hi = 0;
  for (let i = 0; i < bits.length; i++) {
    if ((subset >>> i) & 1) {
      const sq = bits[i];
      [lo, hi] = setBit(lo, hi, sq);
    }
  }
  return [lo, hi];
}

// Sliding attacks over OCC (lo,hi)
function slidingAttacksFrom(sq, occLo, occHi, dirs) {
  let alo = 0, ahi = 0;
  for (const d of dirs) {
    let s = sq;
    while (true) {
      const ns = s + d;
      if (ns < 0 || ns > 63) break;
      const rf = Math.abs(fileOf(ns) - fileOf(s));
      const rr = Math.abs(rankOf(ns) - rankOf(s));
      const ok = (d === 1 || d === -1) ? (rr === 0 && rf === 1)
                : (d === 8 || d === -8) ? (rf === 0 && rr === 1)
                : (rf === 1 && rr === 1);
      if (!ok) break;
      [alo, ahi] = setBit(alo, ahi, ns);
      if (testBit(occLo, occHi, ns)) break; // blocked
      s = ns;
    }
  }
  return [alo, ahi];
}

// Combine for the 2x32 scheme
function idx32(loMasked, hiMasked, magicLo, magicHi, shift, combine) {
  const p1 = Math.imul(loMasked >>> 0, magicLo >>> 0) >>> 0;
  const p2 = Math.imul(hiMasked >>> 0, magicHi >>> 0) >>> 0;
  const mixed = combine === 'add' ? (p1 + p2) >>> 0 : (p1 ^ p2) >>> 0;
  return (mixed >>> shift) >>> 0;
}

// Simple random 32-bit with a few high bits likely set
function rand32() {
  // Two 16-bit chunks; ensure not too sparse in upper bits
  const a = (Math.random() * 0x10000) >>> 0;
  const b = (Math.random() * 0x10000) >>> 0;
  return ((a << 16) ^ b) >>> 0;
}

// Core search for one square
function findMagicForSquare(sq, piece, combine = 'xor', maxTries = 1e6) {
  const dirs = piece === 'rook' ? DIRS_ROOK : DIRS_BISH;
  const [maskLo, maskHi] = piece === 'rook' ? rookMask(sq) : bishopMask(sq);
  const bits = bitListFromMask(maskLo, maskHi);
  const n = bits.length;                    // relevant bits
  const shift = 32 - n;                     // can tweak (bigger shift => smaller table)
  const subsetCount = 1 << n;

  // Ground truth attacks for all blocker subsets
  const occLoArr = new Uint32Array(subsetCount);
  const occHiArr = new Uint32Array(subsetCount);
  const attLoArr = new Uint32Array(subsetCount);
  const attHiArr = new Uint32Array(subsetCount);
  for (let k = 0; k < subsetCount; k++) {
    const [oLo, oHi] = bitboardFromSubset(bits, k);
    occLoArr[k] = oLo; occHiArr[k] = oHi;
    const [aLo, aHi] = slidingAttacksFrom(sq, oLo, oHi, dirs);
    attLoArr[k] = aLo; attHiArr[k] = aHi;
  }

  // Search loop
  for (let tries = 0; tries < maxTries; tries++) {
    // Random magic halves; classic trick: force some bits to help distribution
    const magicLo = (rand32() & rand32() & rand32()) | 1;
    const magicHi = (rand32() & rand32() & rand32()) | 1;

    // Optional quick filter: require enough dispersion by masking*magic top bits
    // You can add heuristics here if needed.

    const tableSize = 1 << (32 - shift);
    const usedLo = new Uint32Array(tableSize);
    const usedHi = new Uint32Array(tableSize);
    const used = new Int32Array(tableSize); // -1 unused, else subset index
    for (let i = 0; i < tableSize; i++) used[i] = -1;

    let ok = true;
    for (let k = 0; k < subsetCount; k++) {
      const loM = (occLoArr[k] & maskLo) >>> 0;
      const hiM = (occHiArr[k] & maskHi) >>> 0;
      const idx = idx32(loM, hiM, magicLo, magicHi, shift, combine);
      const u = used[idx];
      if (u === -1) {
        used[idx] = k;
        usedLo[idx] = attLoArr[k];
        usedHi[idx] = attHiArr[k];
      } else {
        // Collision iff different attack
        if (usedLo[idx] !== attLoArr[k] || usedHi[idx] !== attHiArr[k]) {
          ok = false;
          break;
        }
      }
    }

    if (ok) {
      // Build dense attacks table in idx order
      const attacks = new Array(tableSize);
      for (let i = 0; i < tableSize; i++) {
        attacks[i] = [usedLo[i] >>> 0, usedHi[i] >>> 0];
      }
      return {
        maskLo: maskLo >>> 0, maskHi: maskHi >>> 0,
        magicLo: magicLo >>> 0, magicHi: magicHi >>> 0,
        shift,
        attacks
      };
    }
  }

  return null; // failed to find within budget
}

// Generate full sets
function generateMagics(combine = 'xor') {
  const rooks = new Array(64);
  const bishops = new Array(64);

  for (let sq = 0; sq < 64; sq++) {
    const r = findMagicForSquare(sq, 'rook', combine);
    if (!r) throw new Error('Failed to find rook magic at sq ' + sq);
    rooks[sq] = r;

    const b = findMagicForSquare(sq, 'bishop', combine);
    if (!b) throw new Error('Failed to find bishop magic at sq ' + sq);
    bishops[sq] = b;
    // You can log progress if desired:
    if ((sq & 7) === 7) console.log('Row done up to sq', sq);
  }

  return { combine, rooks, bishops };
}

// Example use:
const { combine, rooks, bishops } = generateMagics('xor');
// Then at runtime, your index is:
//   let lo = (occLo & m.maskLo)>>>0;
//   let hi = (occHi & m.maskHi)>>>0;
//   let idx = ((Math.imul(lo, m.magicLo) ^ Math.imul(hi, m.magicHi)) >>> m.shift)>>>0;
//   let [attLo, attHi] = m.attacks[idx];

