
//{{{  constants

const MAX_PLY   = 100;
const MAX_MOVES = 250;

const EMPTY = 0;

const WHITE = 0x0;
const BLACK = 0x8;

const PIECE_MASK  = 0x7;
const COLOUR_MASK = 0x8;

const MOVE_TO_BITS      = 0;
const MOVE_FR_BITS      = 8;
const MOVE_TOOBJ_BITS   = 16;
const MOVE_FROBJ_BITS   = 20;
const MOVE_PROMAS_BITS  = 29;

const MOVE_TO_MASK       = 0x000000FF;
const MOVE_FR_MASK       = 0x0000FF00;
const MOVE_TOOBJ_MASK    = 0x000F0000;
const MOVE_FROBJ_MASK    = 0x00F00000;
const MOVE_KINGMOVE_MASK = 0x01000000;
const MOVE_EPTAKE_MASK   = 0x02000000;
const MOVE_EPMAKE_MASK   = 0x04000000;
const MOVE_CASTLE_MASK   = 0x08000000;
const MOVE_PROMOTE_MASK  = 0x10000000;
const MOVE_PROMAS_MASK   = 0x60000000;  // NBRQ.
const MOVE_SPARE2_MASK   = 0x80000000;

const MOVE_IKKY_MASK = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_EPMAKE_MASK;

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;
const EDGE   = 7;

const W_PAWN   = PAWN;
const W_KNIGHT = KNIGHT;
const W_BISHOP = BISHOP;
const W_ROOK   = ROOK;
const W_QUEEN  = QUEEN;
const W_KING   = KING;

const B_PAWN   = PAWN   | BLACK;
const B_KNIGHT = KNIGHT | BLACK;
const B_BISHOP = BISHOP | BLACK;
const B_ROOK   = ROOK   | BLACK;
const B_QUEEN  = QUEEN  | BLACK;
const B_KING   = KING   | BLACK;

//
// E == EMPTY, X = OFF BOARD, - == CANNOT HAPPEN
//
//                 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
//                 E  W  W  W  W  W  W  X  -  B  B  B  B  B  B  -
//                 E  P  N  B  R  Q  K  X  -  P  N  B  R  Q  K  -
//

const SQ_CHAR   = ['.','P','N','B','R','Q','K','x','y','p','n','b','r','q','k','z'];

const IS_O      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_E      = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_OE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];

const IS_P      = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const IS_N      = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IS_NBRQKE = [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0]
const IS_RQKE   = [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0]
const IS_QKE    = [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0]
const IS_K      = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];
const IS_KN     = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];

const IS_W      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WP     = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WN     = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WNBRQ  = [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const IS_WPNBRQ = [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const IS_WB     = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WBQ    = [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WRQ    = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WQ     = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const IS_B      = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_BE     = [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_BP     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const IS_BN     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IS_BNBRQ  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0]
const IS_BPNBRQ = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]
const IS_BB     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
const IS_BBQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
const IS_BRQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0];
const IS_BQ     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]

const WB_THEM   = [IS_BPNBRQ,IS_WPNBRQ];

const W_PROMOTE_SQ = [0,26, 27, 28, 29, 30, 31, 32, 33];
const B_PROMOTE_SQ = [0,110,111,112,113,114,115,116,117];

const A1 = 110, B1 = 111, C1 = 112, D1 = 113, E1 = 114, F1 = 115, G1 = 116, H1 = 117;
const A8 = 26,  B8 = 27,  C8 = 28,  D8 = 29,  E8 = 30,  F8 = 31,  G8 = 32,  H8 = 33;

const MOVE_E1G1 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | G1;
const MOVE_E1C1 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | C1;
const MOVE_E8G8 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | G8;
const MOVE_E8C8 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | C8;

const QPRO = (QUEEN-2)  << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const RPRO = (ROOK-2)   << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const BPRO = (BISHOP-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const NPRO = (KNIGHT-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;

const WHITE_RIGHTS_KING  = 0x00000001;
const WHITE_RIGHTS_QUEEN = 0x00000002;
const BLACK_RIGHTS_KING  = 0x00000004;
const BLACK_RIGHTS_QUEEN = 0x00000008;
const WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
const BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;

const MASK_RIGHTS = [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~8, 15, 15, 15, ~12,15, 15, ~4, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~2, 15, 15, 15, ~3, 15, 15, ~1, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];

const WP_OFFSET_ORTH  = -12;
const WP_OFFSET_DIAG1 = -13;
const WP_OFFSET_DIAG2 = -11;

const BP_OFFSET_ORTH  = 12;
const BP_OFFSET_DIAG1 = 13;
const BP_OFFSET_DIAG2 = 11;

const KNIGHT_OFFSETS  = [25,-25,23,-23,14,-14,10,-10];
const BISHOP_OFFSETS  = [11,-11,13,-13];
const ROOK_OFFSETS    =               [1,-1,12,-12];
const QUEEN_OFFSETS   = [11,-11,13,-13,1,-1,12,-12];
const KING_OFFSETS    = [11,-11,13,-13,1,-1,12,-12];

const OFFSETS = [0,0,KNIGHT_OFFSETS,BISHOP_OFFSETS,ROOK_OFFSETS,QUEEN_OFFSETS,KING_OFFSETS];
const LIMITS  = [0,1,1,             8,             8,           8,            1];

const B88 = [26, 27, 28, 29, 30, 31, 32, 33,
             38, 39, 40, 41, 42, 43, 44, 45,
             50, 51, 52, 53, 54, 55, 56, 57,
             62, 63, 64, 65, 66, 67, 68, 69,
             74, 75, 76, 77, 78, 79, 80, 81,
             86, 87, 88, 89, 90, 91, 92, 93,
             98, 99, 100,101,102,103,104,105,
             110,111,112,113,114,115,116,117];

const COORDS = ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', '??', '??',
                '??', '??', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', '??', '??',
                '??', '??', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', '??', '??',
                '??', '??', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', '??', '??',
                '??', '??', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', '??', '??',
                '??', '??', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', '??', '??',
                '??', '??', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', '??', '??',
                '??', '??', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

const RANK = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
              0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
              0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
              0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
              0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
              0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
              0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
              0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const FILE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//}}}

//{{{  DIST

var d = Array(144);

for (var i=0; i < 144; i++) {
  d[i] = Array(144).fill(0);
}

for (var i=0; i < 64; i++) {
  var r1 = RANK[B88[i]];
  var f1 = FILE[B88[i]];
  for (var j=0; j < 64; j++) {
    var r2 = RANK[B88[j]];
    var f2 = FILE[B88[j]];
    d[B88[i]][B88[j]] = Math.max(Math.abs(r1-r2),Math.abs(f1-f2));
  }
}

console.log('const DIST = [');
for (var i=0; i<144; i++) {
  s = '[' + d[i].toString() + '],';
  console.log(' ', s);
}
console.log('];');

//}}}
/*
//{{{  ADJACENT

var d = Array(144);

for (var i=0; i < 144; i++) {
  d[i] = Array(144).fill(0);
}

for (var i=0; i < 64; i++) {
  var r1 = RANK[B88[i]];
  var f1 = FILE[B88[i]];
  for (var j=0; j < 64; j++) {
    var r2 = RANK[B88[j]];
    var f2 = FILE[B88[j]];
    if (Math.max(Math.abs(r1-r2),Math.abs(f1-f2)) == 1)
      d[B88[i]][B88[j]] = 1;
    else
      d[B88[i]][B88[j]] = 0;
  }
}

console.log('const ADJACENT = [');
for (var i=0; i<144; i++) {
  s = '[' + d[i].toString() + '],';
  console.log(' ', s);
}
console.log('];');

//}}}
//{{{  DIRECTION

var d = Array(144);

for (var i=0; i < 144; i++) {
  d[i] = Array(144).fill(EDGE);
  for (var j=0; j < 64; j++) {
    d[i][B88[j]] = 0;
  }
}

for (var i=0; i < 64; i++) {

  var to = B88[i];
  var a = d[to];

  var dir = 1;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = -1;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = 12;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = -12;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = 13;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = -13;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = 11;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }

  var dir = -11;
  var from = to + dir;
  while (a[from] != EDGE) {
    a[from] = dir;
    from += dir;
  }
}

console.log('const DIRECTION = [');
for (var i=0; i<144; i++) {
  s = '[' + d[i].toString() + '],';
  console.log(' ', s);
}
console.log('];');

//}}}
//{{{  HOPPER

var d = Array(144);

for (var i=0; i < 144; i++) {
  d[i] = Array(144).fill(0);
}

for (var i=0; i < 64; i++) {
  for (var j=0; j < 64; j++) {
    var x = B88[i];
    var y = B88[j];
    if ((x+10) == y) d[x][y] = 1;
    if ((x-10) == y) d[x][y] = 1;
    if ((x+14) == y) d[x][y] = 1;
    if ((x-14) == y) d[x][y] = 1;
    if ((x+23) == y) d[x][y] = 1;
    if ((x-23) == y) d[x][y] = 1;
    if ((x+25) == y) d[x][y] = 1;
    if ((x-25) == y) d[x][y] = 1;
  }
}

console.log('const HOPPER = [');
for (var i=0; i<144; i++) {
  s = '[' + d[i].toString() + '],';
  console.log(' ', s);
}
console.log('];');

//}}}
*/

process.exit();

