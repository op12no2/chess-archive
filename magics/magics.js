"use strict";

const fs = require("fs");

/*{{{  constants*/

const MAX_PLY = 128;
const MAX_MOVES = 256;

const WHITE = 0;
const BLACK = 1;

const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

const WPAWN = 0;
const WKNIGHT = 1;
const WBISHOP = 2;
const WROOK = 3;
const WQUEEN = 4;
const WKING = 5;

const BPAWN = 6;
const BKNIGHT = 7;
const BBISHOP = 8;
const BROOK = 9;
const BQUEEN = 10;
const BKING = 11;

const EMPTY = 127;

const WHITE_RIGHTS_KING  = 1
const WHITE_RIGHTS_QUEEN = 2
const BLACK_RIGHTS_KING  = 4
const BLACK_RIGHTS_QUEEN = 8
const ALL_RIGHTS         = 15

/*}}}*/
/*{{{  bit twiddling*/

function bsf32(x){
  x>>>=0;
  return (Math.clz32(x & -x) ^ 31) >>> 0;
}

function bsf64(lo, hi) {
  lo >>>= 0; hi >>>= 0;
  if (lo !== 0)
    return (Math.clz32(lo & -lo) ^ 31) >>> 0;
  return 32 + (Math.clz32(hi & -hi) ^ 31);
}

function bbToBig(lo, hi) {
  return ((BigInt(hi>>>0)<<32n)|BigInt(lo>>>0)) & 0xffff_ffff_ffff_ffffn;
}

function hex64_from_lohi(lo, hi) {
  return "0x"+bbToBig(lo,hi).toString(16).padStart(16,"0");
}

function magicIndexBigInt(bLo, bHi, mLo, mHi, shift) {
  const blocker = ((BigInt(bHi >>> 0) << 32n) | BigInt(bLo >>> 0)) & 0xffff_ffff_ffff_ffffn;
  const magic   = ((BigInt(mHi >>> 0) << 32n) | BigInt(mLo >>> 0)) & 0xffff_ffff_ffff_ffffn;
  const prod    = (blocker * magic) & 0xffff_ffff_ffff_ffffn;
  return Number((prod >> BigInt(shift >>> 0)) & 0xffff_ffffn) >>> 0;
}

function mul64_lo_u32(bLo, bHi, mLo, mHi) {

  const b0 =  bLo & 0xffff, b1 = (bLo >>> 16) & 0xffff;
  const b2 =  bHi & 0xffff, b3 = (bHi >>> 16) & 0xffff;
  const m0 =  mLo & 0xffff, m1 = (mLo >>> 16) & 0xffff;
  const m2 =  mHi & 0xffff, m3 = (mHi >>> 16) & 0xffff;

  let c = 0;

  let s = Math.imul(b0, m0) + c;
  const r0 = s & 0xffff; c = s >>> 16;

  s = Math.imul(b0, m1) + Math.imul(b1, m0) + c;
  const r1 = s & 0xffff; c = s >>> 16;

  s = Math.imul(b0, m2) + Math.imul(b1, m1) + Math.imul(b2, m0) + c;
  const r2 = s & 0xffff; c = s >>> 16;

  s = Math.imul(b0, m3) + Math.imul(b1, m2) + Math.imul(b2, m1) + Math.imul(b3, m0) + c;
  const r3 = s & 0xffff;
  // any remaining carry would be the 65+ bits we discard (mod 2^64)

  const prodLo = (r0 | (r1 << 16)) >>> 0;
  const prodHi = (r2 | (r3 << 16)) >>> 0;
  return [prodLo, prodHi];
}

function magicIndexU32(bLo, bHi, mLo, mHi, shift) {
  const [pLo, pHi] = mul64_lo_u32(bLo >>> 0, bHi >>> 0, mLo >>> 0, mHi >>> 0);

  // Right shift a 64-bit value [pHi:pLo] by 'shift' (0..63), return low 32 bits.
  shift >>>= 0;
  if (shift === 0) return pLo >>> 0;
  if (shift < 32)  return (((pLo >>> shift) | (pHi << (32 - shift))) >>> 0);
  if (shift < 64)  return (pHi >>> (shift - 32)) >>> 0;
  return 0; // shift >= 64
}

/*}}}*/
/*{{{  rook and bishop attack struct*/

function makeAttack(bits, shift, loMagic, hiMagic, loMask, hiMask) {

  const count = 1<<bits;

  return {
    bits:bits>>>0, shift:shift>>>0,
    loMagic:loMagic>>>0, hiMagic:hiMagic>>>0,
    loMask:loMask>>>0, hiMask:hiMask>>>0,
    count,
    loAttacks:new Uint32Array(count),
    hiAttacks:new Uint32Array(count),
  };

}

/*}}}*/
/*{{{  node struct and primitives*/

function nodeStruct () {

  this.loAll = new Uint32Array(12);
  this.hiAll = new Uint32Array(12);

  this.loColour = new Uint32Array(2);
  this.hiColour = new Uint32Array(2);

  this.loOccupied = 0>>>0;
  this.hiOccupied = 0>>>0;

  this.board = new Int8Array(64);
  this.stm = 0;
  this.rights = 0;
  this.ep = 0;

  this.numMoves = 0;
  this.moves = new Uint32Array(MAX_MOVES);

}

/*{{{  copyNode*/

function copyNode (fr, to) {

  to.loAll.set(fr.loAll);
  to.hiAll.set(fr.hiAll);

  to.loColour.set(fr.loColour);
  to.hiColour.set(fr.hiColour);

  to.loOccupied = fr.loOccupied >>> 0;
  to.hiOccupied = fr.hiOccupied >>> 0;

  to.board.set(fr.board);

  to.stm = fr.stm;
  to.rights = fr.rights;
  to.ep = fr.ep;

}

/*}}}*/

/*}}}*/
/*{{{  globals*/

let rookAttacks   = null;
let bishopAttacks = null;
let knightAttacks = null;
let kingAttacks   = null;
let pawnAttacksW  = null;
let pawnAttacksB  = null;

const nodes = Array(MAX_PLY)

const LO_BIT = new Uint32Array(64);
const HI_BIT = new Uint32Array(64);

const loKnightAttacks = new Uint32Array(64);
const hiKnightAttacks = new Uint32Array(64);

const loKingAttacks = new Uint32Array(64);
const hiKingAttacks = new Uint32Array(64);

/*}}}*/
/*{{{  magics loader*/

// load the magics.bin created by magics.c

function readU32le(buf, off) {
  return [buf.readUInt32LE(off), off+4];
}

function readOneTable(buf, off) {
  const table = new Array(64);
  for(let sq=0;sq<64;sq++){
    let bits,shift,mLo,mHi,maskLo,maskHi;
    [bits,off]=readU32le(buf,off);
    [shift,off]=readU32le(buf,off);
    [mLo,off]=readU32le(buf,off);
    [mHi,off]=readU32le(buf,off);
    [maskLo,off]=readU32le(buf,off);
    [maskHi,off]=readU32le(buf,off);
    const a=makeAttack(bits,shift,mLo,mHi,maskLo,maskHi);
    for(let i=0;i<a.count;i++){ let lo,hi; [lo,off]=readU32le(buf,off); [hi,off]=readU32le(buf,off); a.loAttacks[i]=lo>>>0; a.hiAttacks[i]=hi>>>0; }
    table[sq]=a;
  }
  return [table, off];
}

function readBitboards(buf, off, n) {
  const lo=new Uint32Array(n), hi=new Uint32Array(n);
  for(let i=0;i<n;i++){ let l,h; [l,off]=readU32le(buf,off); [h,off]=readU32le(buf,off); lo[i]=l>>>0; hi[i]=h>>>0; }
  return [{lo,hi}, off];
}

function loadMagics(path){
  const buf=fs.readFileSync(path);
  let off=0;
  const [rookAttacks, o1]=readOneTable(buf, off);
  const [bishopAttacks, o2]=readOneTable(buf, o1);
  let knightAttacks, kingAttacks, pawnAttacksW, pawnAttacksB;
  [knightAttacks, off] = readBitboards(buf, o2, 64);
  [kingAttacks,   off] = readBitboards(buf, off, 64);
  let p0, p1;
  [p0, off] = readBitboards(buf, off, 64);
  [p1, off] = readBitboards(buf, off, 64);
  pawnAttacksW=p0; pawnAttacksB=p1;
  if(off !== buf.length) throw new Error(`Trailing bytes: consumed ${off}, file size ${buf.length}`);
  return {rookAttacks,bishopAttacks,knightAttacks,kingAttacks,pawnAttacksW,pawnAttacksB,bytes:off};
}

function fnv1a64Init(){ return 0xcbf29ce484222325n; }
function fnv1a64Push(h,u32){ h^=BigInt(u32>>>0); return (h*0x100000001b3n)&0xffff_ffff_ffff_ffffn; }
function hex64b(n){ return "0x"+n.toString(16).padStart(16,"0"); }

function hashSliderTable(table) {
  let H=fnv1a64Init();
  for(let sq=0;sq<64;sq++){
    const a=table[sq];
    H=fnv1a64Push(H,a.bits); H=fnv1a64Push(H,a.shift);
    H=fnv1a64Push(H,a.loMagic); H=fnv1a64Push(H,a.hiMagic);
    for(let i=0;i<a.count;i++){ H=fnv1a64Push(H,a.loAttacks[i]); H=fnv1a64Push(H,a.hiAttacks[i]); }
  }
  return H;
}

function hashBB(lo,hi){
  let H=fnv1a64Init();
  for(let i=0;i<lo.length;i++){ H=fnv1a64Push(H, lo[i]); H=fnv1a64Push(H, hi[i]); }
  return H;
}

function hashPawns(pW,pB){
  let H=fnv1a64Init();
  for(let c=0;c<2;c++){
    const p = c===0 ? pW : pB;
    for(let i=0;i<p.lo.length;i++){ H=fnv1a64Push(H,p.lo[i]); H=fnv1a64Push(H,p.hi[i]); }
  }
  return H;
}

/*}}}*/
/*{{{  move gen*/

/*{{{  pieceIndex*/

function pieceIndex(piece, stm) {
  return (stm * 6) + piece;
}

/*}}}*/
/*{{{  colourIndex*/

function colourIndex(colour) {
  return colour * 6;
}

/*}}}*/
/*{{{  isKingAttacked*/

function isKingAttacked(node, loKing, hiKing, opp){

  const sq = (loKing !== 0 ? bsf32(loKing) : 32 + bsf32(hiKing));  // only 1 bit

  const baseOpp = colourIndex(opp);

  const loOcc = node.loOccupied >>> 0;
  const hiOcc = node.hiOccupied >>> 0;

  const loP = node.loAll[baseOpp + PAWN]   >>> 0, hiP = node.hiAll[baseOpp + PAWN]   >>> 0;
  const loN = node.loAll[baseOpp + KNIGHT] >>> 0, hiN = node.hiAll[baseOpp + KNIGHT] >>> 0;
  const loB = node.loAll[baseOpp + BISHOP] >>> 0, hiB = node.hiAll[baseOpp + BISHOP] >>> 0;
  const loR = node.loAll[baseOpp + ROOK]   >>> 0, hiR = node.hiAll[baseOpp + ROOK]   >>> 0;
  const loQ = node.loAll[baseOpp + QUEEN]  >>> 0, hiQ = node.hiAll[baseOpp + QUEEN]  >>> 0;
  const loK = node.loAll[baseOpp + KING]   >>> 0, hiK = node.hiAll[baseOpp + KING]   >>> 0;

  if (((loKnightAttacks[sq] & loN) | (hiKnightAttacks[sq] & hiN)) !== 0) return 1;

  if (opp === WHITE) {
    if (((pawnAttacksW.lo[sq] & loP) | (pawnAttacksW.hi[sq] & hiP)) !== 0) return 1;
  }
  else {
    if (((pawnAttacksB.lo[sq] & loP) | (pawnAttacksB.hi[sq] & hiP)) !== 0) return 1;
  }

  if (((loKingAttacks[sq] & loK) | (hiKingAttacks[sq] & hiK)) !== 0) return 1;

  if ((loB | loQ | hiB | hiQ) !== 0) {
    const a = bishopAttacks[sq];
    const bLo = (loOcc & a.loMask) >>> 0;
    const bHi = (hiOcc & a.hiMask) >>> 0;
    const ix  = magicIndexU32(bLo, bHi, a.loMagic, a.hiMagic, a.shift);
    const attLo = a.loAttacks[ix] >>> 0;
    const attHi = a.hiAttacks[ix] >>> 0;
    if (((attLo & (loB|loQ)) | (attHi & (hiB|hiQ))) !== 0) return 1;
  }

  if ((loR | loQ | hiR | hiQ) !== 0) {
    const a = rookAttacks[sq];
    const bLo = (loOcc & a.loMask) >>> 0;
    const bHi = (hiOcc & a.hiMask) >>> 0;
    const ix  = magicIndexU32(bLo, bHi, a.loMagic, a.hiMagic, a.shift);
    const attLo = a.loAttacks[ix] >>> 0;
    const attHi = a.hiAttacks[ix] >>> 0;
    if (((attLo & (loR|loQ)) | (attHi & (hiR|hiQ))) !== 0) return 1;
  }

  return 0;

}

/*}}}*/
/*{{{  encodeMove*/

function encodeMove(from, to, flags) {
  return ((from << 6) | to | flags) >>> 0;
}

/*}}}*/
/*{{{  genJumpers*/

function genJumpers(node, loAttTable, hiAttTable, piece, loTargets, hiTargets) {

  const stm = node.stm >>> 0;
  const idx = pieceIndex(piece, stm)
  const moves = node.moves;

  let n = node.numMoves | 0;

  let loPiece = node.loAll[idx] >>> 0;
  let hiPiece = node.hiAll[idx] >>> 0;

  loTargets >>>= 0;
  hiTargets >>>= 0;

  while ((loPiece | hiPiece) !== 0) {

    const from = bsf64(loPiece, hiPiece);

    if (loPiece !== 0)
      loPiece = (loPiece & (loPiece - 1)) >>> 0;
    else
      hiPiece = (hiPiece & (hiPiece - 1)) >>> 0;

    let loAttacks = (loAttTable[from] & loTargets) >>> 0;
    let hiAttacks = (hiAttTable[from] & hiTargets) >>> 0;

    while ((loAttacks | hiAttacks) !== 0) {

      const to = bsf64(loAttacks, hiAttacks);

      if (loAttacks !== 0)
        loAttacks = (loAttacks & (loAttacks - 1)) >>> 0;
      else
        hiAttacks = (hiAttacks & (hiAttacks - 1)) >>> 0;

      moves[n++] = encodeMove(from, to, 0);

    }
  }

  node.numMoves = n;

}

/*}}}*/
/*{{{  genSliders*/

function genSliders(node, attTable, piece, loTargets, hiTargets) {

  const stm   = node.stm >>> 0;
  const idx   = pieceIndex(piece, stm)
  const moves = node.moves;

  let n       = node.numMoves | 0;
  let loPiece = node.loAll[idx] >>> 0;
  let hiPiece = node.hiAll[idx] >>> 0;

  const loOcc = node.loOccupied >>> 0;
  const hiOcc = node.hiOccupied >>> 0;

  loTargets >>>= 0;
  hiTargets >>>= 0;

  while ((loPiece | hiPiece) !== 0) {

    const from = bsf64(loPiece, hiPiece);

    // clear LSB in the correct word
    if (loPiece !== 0) loPiece = (loPiece & (loPiece - 1)) >>> 0;
    else               hiPiece = (hiPiece & (hiPiece - 1)) >>> 0;

    const a    = attTable[from];
    const bLo  = (loOcc & a.loMask) >>> 0;   // blockers (low 32)
    const bHi  = (hiOcc & a.hiMask) >>> 0;   // blockers (high 32)
    const idxM = magicIndexU32(bLo, bHi, a.loMagic, a.hiMagic, a.shift);

    // table hits, then apply target filter
    let loAtt = (a.loAttacks[idxM] & loTargets) >>> 0;
    let hiAtt = (a.hiAttacks[idxM] & hiTargets) >>> 0;

    while ((loAtt | hiAtt) !== 0) {

      const to = bsf64(loAtt, hiAtt);

      if (loAtt !== 0) loAtt = (loAtt & (loAtt - 1)) >>> 0;
      else             hiAtt = (hiAtt & (hiAtt - 1)) >>> 0;

      moves[n++] = encodeMove(from, to, 0);
    }
  }

  node.numMoves = n;
}

/*}}}*/
/*{{{  genWhite/BlackPawns*/

/*{{{  genWhitePawns*/

function genWhitePawns(node){

  const moves = node.moves; let n = node.numMoves|0;

  const loOcc = node.loOccupied>>>0, hiOcc = node.hiOccupied>>>0;
  const loEn  = node.loColour[BLACK]>>>0, hiEn  = node.hiColour[BLACK]>>>0;

  // exclude capturing the black king
  const kIdxB = pieceIndex(KING, BLACK);
  const loBK  = node.loAll[kIdxB]>>>0, hiBK = node.hiAll[kIdxB]>>>0;
  const loCapT= (loEn & ~loBK)>>>0,     hiCapT= (hiEn & ~hiBK)>>>0;

  // -------- low 32 pawns (0..31)
  let loP = node.loAll[PAWN]>>>0;
  while (loP){
    const f = bsf32(loP); loP = (loP & (loP-1))>>>0;

    // push 1: to = f + 8
    const t1 = f + 8;
    const t1Empty = (t1 < 32) ? (((loOcc>>>t1)&1)===0)
                              : (((hiOcc>>>(t1-32))&1)===0);
    if (t1 < 64 && t1Empty){
      moves[n++] = encodeMove(f, t1, 0);

      // push 2 from rank 2 (rank index 1): to = f + 16
      if ((f>>3) === 1){
        const t2 = f + 16;
        const t2Empty = (t2 < 32) ? (((loOcc>>>t2)&1)===0)
                                  : (((hiOcc>>>(t2-32))&1)===0);
        if (t2 < 64 && t2Empty) moves[n++] = encodeMove(f, t2, 0);
      }
    }

    // captures from f to f+7 (not A-file) and f+9 (not H-file)
    const file = f & 7;

    if (file !== 0){
      const t = f + 7;
      const ok = (t < 32) ? ((loCapT>>>t)&1) : (t < 64 && ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }

    if (file !== 7){
      const t = f + 9;
      const ok = (t < 32) ? ((loCapT>>>t)&1) : (t < 64 && ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }
  }

  // -------- high 32 pawns (32..63)
  let hiP = node.hiAll[PAWN]>>>0;
  while (hiP){
    const f32 = bsf32(hiP); hiP = (hiP & (hiP-1))>>>0;
    const f = 32 + f32;

    // push 1: to = f + 8 (guard on-board; choose lo/hi word)
    const t1 = f + 8;
    if (t1 < 64){
      const t1Empty = (t1 < 32) ? (((loOcc>>>t1)&1)===0)
                                : (((hiOcc>>>(t1-32))&1)===0);
      if (t1Empty) moves[n++] = encodeMove(f, t1, 0);
    }

    // (no push-2 from hi half for white: f>=32 ? (f>>3)>=4, so never rank 2)

    // captures
    const file = f & 7;

    if (file !== 0){
      const t = f + 7;
      const ok = (t < 32) ? ((loCapT>>>t)&1) : (t < 64 && ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }

    if (file !== 7){
      const t = f + 9;
      const ok = (t < 32) ? ((loCapT>>>t)&1) : (t < 64 && ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }
  }

  node.numMoves = n;
}

/*}}}*/
/*{{{  genBlackPawns*/

function genBlackPawns(node){

  const moves = node.moves; let n = node.numMoves|0;

  const loOcc = node.loOccupied>>>0, hiOcc = node.hiOccupied>>>0;
  const loEn  = node.loColour[WHITE]>>>0, hiEn  = node.hiColour[WHITE]>>>0;

  // exclude capturing the white king
  const kIdxW = pieceIndex(KING, WHITE);
  const loWK  = node.loAll[kIdxW]>>>0, hiWK = node.hiAll[kIdxW]>>>0;
  const loCapT= (loEn & ~loWK)>>>0,     hiCapT= (hiEn & ~hiWK)>>>0;

  const base = 6;

  // -------- low 32 pawns (0..31)
  let loP = node.loAll[base + PAWN]>>>0;
  while (loP){
    const f = bsf32(loP); loP = (loP & (loP-1))>>>0;

    // push 1: to = f - 8
    const t1 = f - 8;
    const t1Empty = (t1 >= 0) && ((t1 < 32) ? (((loOcc>>>t1)&1)===0)
                                            : (((hiOcc>>>(t1-32))&1)===0));
    if (t1Empty){
      moves[n++] = encodeMove(f, t1, 0);

      // push 2 from rank 7 (rank index 6): to = f - 16
      if ((f>>3) === 6){
        const t2 = f - 16;
        const t2Empty = (t2 >= 0) && ((t2 < 32) ? (((loOcc>>>t2)&1)===0)
                                               : (((hiOcc>>>(t2-32))&1)===0));
        if (t2Empty) moves[n++] = encodeMove(f, t2, 0);
      }
    }

    // captures to f-7 (not H-file) and f-9 (not A-file)
    const file = f & 7;

    if (file !== 7){
      const t = f - 7;
      const ok = (t >= 0) && ((t < 32) ? ((loCapT>>>t)&1)
                                       : ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }

    if (file !== 0){
      const t = f - 9;
      const ok = (t >= 0) && ((t < 32) ? ((loCapT>>>t)&1)
                                       : ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }
  }

  // -------- high 32 pawns (32..63)
  let hiP = node.hiAll[base + PAWN]>>>0;
  while (hiP){
    const f32 = bsf32(hiP); hiP = (hiP & (hiP-1))>>>0;
    const f = 32 + f32;

    // push 1: to = f - 8  (may cross into lo half)
    const t1 = f - 8;
    if (t1 >= 0){
      const t1Empty = (t1 < 32) ? (((loOcc>>>t1)&1)===0)
                                : (((hiOcc>>>(t1-32))&1)===0);
      if (t1Empty){
        moves[n++] = encodeMove(f, t1, 0);

        // push 2 from rank 7 only (f in 48..55)
        if ((f>>3) === 6){
          const t2 = f - 16;
          const t2Empty = (t2 >= 0) && ((t2 < 32) ? (((loOcc>>>t2)&1)===0)
                                                 : (((hiOcc>>>(t2-32))&1)===0));
          if (t2Empty) moves[n++] = encodeMove(f, t2, 0);
        }
      }
    }

    // captures (may land in lo half)
    const file = f & 7;

    if (file !== 7){
      const t = f - 7;
      const ok = (t >= 0) && ((t < 32) ? ((loCapT>>>t)&1)
                                       : ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }

    if (file !== 0){
      const t = f - 9;
      const ok = (t >= 0) && ((t < 32) ? ((loCapT>>>t)&1)
                                       : ((hiCapT>>>(t-32))&1));
      if (ok) moves[n++] = encodeMove(f, t, 0);
    }
  }

  node.numMoves = n;
}

/*}}}*/

/*}}}*/
/*{{{  genMoves*/

function genMoves(node) {

  node.numMoves = 0;

  const stm = node.stm >>> 0;
  const opp = stm ^ 1;

  const loOcc = node.loOccupied >>> 0;
  const hiOcc = node.hiOccupied >>> 0;

  const loOppKing = node.loAll[pieceIndex(KING, opp)] >>> 0;
  const hiOppKing = node.hiAll[pieceIndex(KING, opp)] >>> 0;

  const loEnemy = node.loColour[opp] >>> 0;
  const hiEnemy = node.hiColour[opp] >>> 0;

  const loTargets = (~loOcc | (loEnemy & ~loOppKing)) >>> 0;
  const hiTargets = (~hiOcc | (hiEnemy & ~hiOppKing)) >>> 0;

  (stm == WHITE ? genWhitePawns(node) : genBlackPawns(node));
  genJumpers(node, loKnightAttacks, hiKnightAttacks, KNIGHT, loTargets, hiTargets);
  genSliders(node, bishopAttacks, BISHOP, loTargets, hiTargets);
  genSliders(node, rookAttacks,   ROOK,   loTargets, hiTargets);
  genSliders(node, bishopAttacks, QUEEN,  loTargets, hiTargets);
  genSliders(node, rookAttacks,   QUEEN,  loTargets, hiTargets);
  genJumpers(node, loKingAttacks, hiKingAttacks,  KING,   loTargets, hiTargets);
  // gen_castling(node);

}

/*}}}*/

/*}}}*/
/*{{{  makeMove*/

function makeMove(node, move) {

  const from = (move >>> 6) & 0x3f;
  const to   = (move      ) & 0x3f;

  const fromLo = LO_BIT[from], fromHi = HI_BIT[from];
  const toLo   = LO_BIT[to],   toHi   = HI_BIT[to];

  const stm = node.stm >>> 0;       // 0=white, 1=black
  const opp = stm ^ 1;

  const fromPiece = node.board[from] | 0;   // 0..11
  const toPiece   = node.board[to]   | 0;   // 0..11 or EMPTY

  //console.log('from',from,'to',to,'from piece',fromPiece,'to piece',toPiece);

  // --- remove 'from' piece from its piece BB and colour BB
  node.loAll[fromPiece]   = (node.loAll[fromPiece]   & ~fromLo) >>> 0;
  node.hiAll[fromPiece]   = (node.hiAll[fromPiece]   & ~fromHi) >>> 0;
  node.loColour[stm]      = (node.loColour[stm]      & ~fromLo) >>> 0;
  node.hiColour[stm]      = (node.hiColour[stm]      & ~fromHi) >>> 0;

  node.board[from] = EMPTY;

  // --- if capture, remove captured piece from its BB and opp colour BB
  if (toPiece !== EMPTY) {
    node.loAll[toPiece]   = (node.loAll[toPiece]   & ~toLo) >>> 0;
    node.hiAll[toPiece]   = (node.hiAll[toPiece]   & ~toHi) >>> 0;
    node.loColour[opp]    = (node.loColour[opp]    & ~toLo) >>> 0;
    node.hiColour[opp]    = (node.hiColour[opp]    & ~toHi) >>> 0;
  }

  // --- add 'from' piece on the destination
  node.loAll[fromPiece]   = (node.loAll[fromPiece]   | toLo) >>> 0;
  node.hiAll[fromPiece]   = (node.hiAll[fromPiece]   | toHi) >>> 0;
  node.loColour[stm]      = (node.loColour[stm]      | toLo) >>> 0;
  node.hiColour[stm]      = (node.hiColour[stm]      | toHi) >>> 0;

  node.board[to] = fromPiece;

  // --- recompute occupancy (cheap & clear)
  node.loOccupied = (node.loColour[WHITE] | node.loColour[BLACK]) >>> 0;
  node.hiOccupied = (node.hiColour[WHITE] | node.hiColour[BLACK]) >>> 0;

  // --- side to move
  node.stm = opp;
}

/*}}}*/

/*{{{  perft*/

function perft(ply, depth) {

  if (depth == 0)
    return 1;

  const thisNode = nodes[ply];
  const nextNode = nodes[ply+1];

  const stm = thisNode.stm | 0;
  const opp = stm ^ 1;

  let totNodes = 0 | 0;

  genMoves(thisNode);

  for (let m=0; m < thisNode.numMoves; m++) {

    const move = thisNode.moves[m] >>> 0;

    copyNode(thisNode, nextNode)
    makeMove(nextNode, move);

    const loK = nextNode.loAll[stm*6 + KING] >>> 0;
    const hiK = nextNode.hiAll[stm*6 + KING] >>> 0;

    if (isKingAttacked(nextNode, loK, hiK, opp))
     continue;

    totNodes += perft(ply+1, depth-1);

  }

  return totNodes;

}

/*}}}*/

/*{{{  init once*/

function init_once() {

  /*{{{  knight attacks;*/
  {
    const lo = loKnightAttacks;
    const hi = hiKnightAttacks;
  
    lo[0] = 132096; hi[0] = 0;
    lo[1] = 329728; hi[1] = 0;
    lo[2] = 659712; hi[2] = 0;
    lo[3] = 1319424; hi[3] = 0;
    lo[4] = 2638848; hi[4] = 0;
    lo[5] = 5277696; hi[5] = 0;
    lo[6] = 10489856; hi[6] = 0;
    lo[7] = 4202496; hi[7] = 0;
    lo[8] = 33816580; hi[8] = 0;
    lo[9] = 84410376; hi[9] = 0;
    lo[10] = 168886289; hi[10] = 0;
    lo[11] = 337772578; hi[11] = 0;
    lo[12] = 675545156; hi[12] = 0;
    lo[13] = 1351090312; hi[13] = 0;
    lo[14] = 2685403152; hi[14] = 0;
    lo[15] = 1075839008; hi[15] = 0;
    lo[16] = 67109890; hi[16] = 2;
    lo[17] = 134219781; hi[17] = 5;
    lo[18] = 285217034; hi[18] = 10;
    lo[19] = 570434068; hi[19] = 20;
    lo[20] = 1140868136; hi[20] = 40;
    lo[21] = 2281736272; hi[21] = 80;
    lo[22] = 268439712; hi[22] = 160;
    lo[23] = 536879168; hi[23] = 64;
    lo[24] = 262656; hi[24] = 516;
    lo[25] = 525568; hi[25] = 1288;
    lo[26] = 1116672; hi[26] = 2577;
    lo[27] = 2233344; hi[27] = 5154;
    lo[28] = 4466688; hi[28] = 10308;
    lo[29] = 8933376; hi[29] = 20616;
    lo[30] = 1089536; hi[30] = 40976;
    lo[31] = 2113536; hi[31] = 16416;
    lo[32] = 67239936; hi[32] = 132096;
    lo[33] = 134545408; hi[33] = 329728;
    lo[34] = 285868032; hi[34] = 659712;
    lo[35] = 571736064; hi[35] = 1319424;
    lo[36] = 1143472128; hi[36] = 2638848;
    lo[37] = 2286944256; hi[37] = 5277696;
    lo[38] = 278921216; hi[38] = 10489856;
    lo[39] = 541065216; hi[39] = 4202496;
    lo[40] = 33554432; hi[40] = 33816580;
    lo[41] = 83886080; hi[41] = 84410376;
    lo[42] = 167772160; hi[42] = 168886289;
    lo[43] = 335544320; hi[43] = 337772578;
    lo[44] = 671088640; hi[44] = 675545156;
    lo[45] = 1342177280; hi[45] = 1351090312;
    lo[46] = 2684354560; hi[46] = 2685403152;
    lo[47] = 1073741824; hi[47] = 1075839008;
    lo[48] = 0; hi[48] = 67109890;
    lo[49] = 0; hi[49] = 134219781;
    lo[50] = 0; hi[50] = 285217034;
    lo[51] = 0; hi[51] = 570434068;
    lo[52] = 0; hi[52] = 1140868136;
    lo[53] = 0; hi[53] = 2281736272;
    lo[54] = 0; hi[54] = 268439712;
    lo[55] = 0; hi[55] = 536879168;
    lo[56] = 0; hi[56] = 262656;
    lo[57] = 0; hi[57] = 525568;
    lo[58] = 0; hi[58] = 1116672;
    lo[59] = 0; hi[59] = 2233344;
    lo[60] = 0; hi[60] = 4466688;
    lo[61] = 0; hi[61] = 8933376;
    lo[62] = 0; hi[62] = 1089536;
    lo[63] = 0; hi[63] = 2113536;
  }
  
  /*}}}*/
  /*{{{  king attacks*/
  {
    const lo = loKingAttacks;
    const hi = hiKingAttacks;
  
    lo[0] = 770; hi[0] = 0;
    lo[1] = 1797; hi[1] = 0;
    lo[2] = 3594; hi[2] = 0;
    lo[3] = 7188; hi[3] = 0;
    lo[4] = 14376; hi[4] = 0;
    lo[5] = 28752; hi[5] = 0;
    lo[6] = 57504; hi[6] = 0;
    lo[7] = 49216; hi[7] = 0;
    lo[8] = 197123; hi[8] = 0;
    lo[9] = 460039; hi[9] = 0;
    lo[10] = 920078; hi[10] = 0;
    lo[11] = 1840156; hi[11] = 0;
    lo[12] = 3680312; hi[12] = 0;
    lo[13] = 7360624; hi[13] = 0;
    lo[14] = 14721248; hi[14] = 0;
    lo[15] = 12599488; hi[15] = 0;
    lo[16] = 50463488; hi[16] = 0;
    lo[17] = 117769984; hi[17] = 0;
    lo[18] = 235539968; hi[18] = 0;
    lo[19] = 471079936; hi[19] = 0;
    lo[20] = 942159872; hi[20] = 0;
    lo[21] = 1884319744; hi[21] = 0;
    lo[22] = 3768639488; hi[22] = 0;
    lo[23] = 3225468928; hi[23] = 0;
    lo[24] = 33751040; hi[24] = 3;
    lo[25] = 84344832; hi[25] = 7;
    lo[26] = 168689664; hi[26] = 14;
    lo[27] = 337379328; hi[27] = 28;
    lo[28] = 674758656; hi[28] = 56;
    lo[29] = 1349517312; hi[29] = 112;
    lo[30] = 2699034624; hi[30] = 224;
    lo[31] = 1086324736; hi[31] = 192;
    lo[32] = 50331648; hi[32] = 770;
    lo[33] = 117440512; hi[33] = 1797;
    lo[34] = 234881024; hi[34] = 3594;
    lo[35] = 469762048; hi[35] = 7188;
    lo[36] = 939524096; hi[36] = 14376;
    lo[37] = 1879048192; hi[37] = 28752;
    lo[38] = 3758096384; hi[38] = 57504;
    lo[39] = 3221225472; hi[39] = 49216;
    lo[40] = 0; hi[40] = 197123;
    lo[41] = 0; hi[41] = 460039;
    lo[42] = 0; hi[42] = 920078;
    lo[43] = 0; hi[43] = 1840156;
    lo[44] = 0; hi[44] = 3680312;
    lo[45] = 0; hi[45] = 7360624;
    lo[46] = 0; hi[46] = 14721248;
    lo[47] = 0; hi[47] = 12599488;
    lo[48] = 0; hi[48] = 50463488;
    lo[49] = 0; hi[49] = 117769984;
    lo[50] = 0; hi[50] = 235539968;
    lo[51] = 0; hi[51] = 471079936;
    lo[52] = 0; hi[52] = 942159872;
    lo[53] = 0; hi[53] = 1884319744;
    lo[54] = 0; hi[54] = 3768639488;
    lo[55] = 0; hi[55] = 3225468928;
    lo[56] = 0; hi[56] = 33751040;
    lo[57] = 0; hi[57] = 84344832;
    lo[58] = 0; hi[58] = 168689664;
    lo[59] = 0; hi[59] = 337379328;
    lo[60] = 0; hi[60] = 674758656;
    lo[61] = 0; hi[61] = 1349517312;
    lo[62] = 0; hi[62] = 2699034624;
    lo[63] = 0; hi[63] = 1086324736;
  }
  
  /*}}}*/
  /*{{{  expected hashes*/
  
  const EXPECT_HASH = {
    rook:   0x7959b2a057ceaaf5n,
    bishop: 0xa4642f7c69da8589n,
    knight: 0x8c2b15adce39de5fn,
    king:   0xb7a20560342cf30dn,
    pawns:  0xa9b9bb9688de8e6cn,
  };
  
  /*}}}*/
  /*{{{  load the magics*/
  
  const loaded = loadMagics("magics.bin");
  
  rookAttacks   = loaded.rookAttacks;
  bishopAttacks = loaded.bishopAttacks;
  knightAttacks = loaded.knightAttacks;
  kingAttacks   = loaded.kingAttacks;
  pawnAttacksW  = loaded.pawnAttacksW;
  pawnAttacksB  = loaded.pawnAttacksB;
  
  /*}}}*/
  /*{{{  verify*/
  
  if (1) {
  
    const hR = hashSliderTable(rookAttacks);
    const hB = hashSliderTable(bishopAttacks);
    const hN = hashBB(knightAttacks.lo, knightAttacks.hi);
    const hK = hashBB(kingAttacks.lo, kingAttacks.hi);
    const hP = hashPawns(pawnAttacksW, pawnAttacksB);
  
    const ok =
      hR === EXPECT_HASH.rook &&
      hB === EXPECT_HASH.bishop &&
      hN === EXPECT_HASH.knight &&
      hK === EXPECT_HASH.king &&
      hP === EXPECT_HASH.pawns;
  
    if (!ok) {
      console.log(
        `magics.bin mismatch\n` +
        `  R ${hR.toString(16)} vs ${EXPECT_HASH.rook.toString(16)}\n` +
        `  B ${hB.toString(16)} vs ${EXPECT_HASH.bishop.toString(16)}\n` +
        `  N ${hN.toString(16)} vs ${EXPECT_HASH.knight.toString(16)}\n` +
        `  K ${hK.toString(16)} vs ${EXPECT_HASH.king.toString(16)}\n` +
        `  P ${hP.toString(16)} vs ${EXPECT_HASH.pawns.toString(16)}`
      );
      process.exit();
    }
  
    else
      console.log("magic.bin loaded ok");
  
  }
  
  /*}}}*/
  /*{{{  create nodes*/
  
  for (let i=0; i< nodes.length; i++)
    nodes[i] = new nodeStruct();
  
  /*}}}*/
  /*{{{  init LO/HI_BIT*/
  
  for (let sq = 0; sq < 64; sq++) {
    if (sq < 32) { LO_BIT[sq] = (1 << sq) >>> 0; HI_BIT[sq] = 0 >>> 0; }
    else         { LO_BIT[sq] = 0 >>> 0;         HI_BIT[sq] = (1 << (sq - 32)) >>> 0; }
  }
  
  /*}}}*/
  /*{{{  init root node to startpos*/
  
  {
    const n = nodes[0];
  
    n.stm    = WHITE;
    n.rights = ALL_RIGHTS;
    n.ep     = 0;
  
    // clear everything
    n.loAll.fill(0);
    n.hiAll.fill(0);
    n.loColour.fill(0);
    n.hiColour.fill(0);
    n.loOccupied = 0 >>> 0;
    n.hiOccupied = 0 >>> 0;
  
    const b = n.board;
    b.fill(EMPTY);
  
    // Back ranks / pawns (A1=0 .. H1=7, A8=56 .. H8=63)
    b[56]=BROOK;  b[57]=BKNIGHT; b[58]=BBISHOP; b[59]=BQUEEN; b[60]=BKING;  b[61]=BBISHOP; b[62]=BKNIGHT; b[63]=BROOK;
    b[48]=BPAWN;  b[49]=BPAWN;   b[50]=BPAWN;   b[51]=BPAWN;  b[52]=BPAWN;  b[53]=BPAWN;   b[54]=BPAWN;   b[55]=BPAWN;
    b[8] =WPAWN;  b[9] =WPAWN;   b[10]=WPAWN;   b[11]=WPAWN;  b[12]=WPAWN;  b[13]=WPAWN;   b[14]=WPAWN;   b[15]=WPAWN;
    b[0] =WROOK;  b[1] =WKNIGHT; b[2] =WBISHOP; b[3] =WQUEEN; b[4] =WKING;  b[5] =WBISHOP; b[6] =WKNIGHT;  b[7] =WROOK;
  
    // Build bitboards from board[]
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq];
      if (p === EMPTY) continue;
  
      if (sq < 32) {
        const bit = (1 << sq) >>> 0;
        n.loAll[p]     = (n.loAll[p]     | bit) >>> 0;
        n.loOccupied   = (n.loOccupied   | bit) >>> 0;
        if (p < 6) n.loColour[WHITE] = (n.loColour[WHITE] | bit) >>> 0;
        else       n.loColour[BLACK] = (n.loColour[BLACK] | bit) >>> 0;
      } else {
        const bit = (1 << (sq - 32)) >>> 0;   // <<— fix: (sq - 32), not (32 - sq)
        n.hiAll[p]     = (n.hiAll[p]     | bit) >>> 0;
        n.hiOccupied   = (n.hiOccupied   | bit) >>> 0;
        if (p < 6) n.hiColour[WHITE] = (n.hiColour[WHITE] | bit) >>> 0;
        else       n.hiColour[BLACK] = (n.hiColour[BLACK] | bit) >>> 0;
      }
    }
  
  }
  
  /*}}}*/
  /*{{{  test perft*/
  
  perft(0,5); //warm up
  
  for (let p = 0; p < 7; p++) {
  
    const start = process.hrtime.bigint();
  
    const nn = perft(0, p);
  
    const finish = process.hrtime.bigint();
  
    const elapsedNs = finish - start;        // bigint in ns
    const elapsedSec = Number(elapsedNs) / 1e9; // convert to seconds
  
    const nps = Math.floor(nn / elapsedSec); // nodes per second
  
    console.log('nodes', nn, 'time', elapsedSec.toFixed(3), 's', 'nps', nps);
  }
  
  /*}}}*/

  //console.log("const lo = loKingAttacks;");
  //console.log("const hi = hiKingAttacks;");
  //for (let i=0; i < 64; i++) {
  //  console.log(`lo[${i}] = ${kingAttacks.lo[i]}; hi[${i}] = ${kingAttacks.hi[i]};`);
  //}
  //console.log("const lo = loKnightAttacks;");
  //console.log("const hi = hiKnightAttacks;");
  //for (let i=0; i < 64; i++) {
    //console.log(`lo[${i}] = ${knightAttacks.lo[i]}; hi[${i}] = ${knightAttacks.hi[i]};`);
  //}


}

/*}}}*/

init_once();


