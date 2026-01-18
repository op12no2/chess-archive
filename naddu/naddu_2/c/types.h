#ifndef TYPES_H
#define TYPES_H

#include <stdint.h>
#include <stdbool.h>

// Colors
#define WHITE 0
#define BLACK 8

// Piece types
#define PAWN   1
#define KNIGHT 2
#define BISHOP 3
#define ROOK   4
#define QUEEN  5
#define KING   6

// Castling rights
#define RIGHTS_K 1
#define RIGHTS_Q 2
#define RIGHTS_k 4
#define RIGHTS_q 8

// Move flags
#define MOVE_FLAG_CAPTURE   0x10000
#define MOVE_FLAG_EPMAKE    0x20000
#define MOVE_FLAG_EPCAPTURE 0x40000
#define MOVE_FLAG_KCASTLE   0x80000
#define MOVE_FLAG_QCASTLE   0x100000
#define MOVE_FLAG_KING      0x200000

#define MOVE_PROMO_SHIFT 22
#define MOVE_PROMO_MASK  (0x7 << MOVE_PROMO_SHIFT)
#define MOVE_PROMO_Q     (5 << MOVE_PROMO_SHIFT)
#define MOVE_PROMO_R     (4 << MOVE_PROMO_SHIFT)
#define MOVE_PROMO_B     (3 << MOVE_PROMO_SHIFT)
#define MOVE_PROMO_N     (2 << MOVE_PROMO_SHIFT)

#define MOVE_EXTRA_MASK (MOVE_FLAG_QCASTLE | MOVE_FLAG_KCASTLE | MOVE_FLAG_EPCAPTURE | MOVE_FLAG_EPMAKE | MOVE_FLAG_KING | MOVE_PROMO_MASK)

// Search constants
#define MAX_PLY   64
#define MAX_MOVES 256
#define MATE      10000

// TT constants
#define TT_EXACT 1
#define TT_ALPHA 2
#define TT_BETA  3
#define TT_MATE_BOUND 9900
#define TT_SIZE  (1 << 20)
#define TT_MASK  (TT_SIZE - 1)

// Move encoding/decoding
#define MOVE_TO(m)   ((m) & 0xFF)
#define MOVE_FROM(m) (((m) >> 8) & 0xFF)
#define MOVE_ENCODE(from, to, flags) (((from) << 8) | (to) | (flags))

// Piece helpers
#define PIECE_TYPE(p)  ((p) & 0x7)
#define PIECE_COLOR(p) ((p) & BLACK)
#define COLOR_INDEX(c) ((c) >> 3)
#define COLOR_FLIP(c)  ((c) ^ BLACK)

// Utility macros
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define MIN(a, b) ((a) < (b) ? (a) : (b))

#endif
