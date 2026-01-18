#include "attack.h"

static const int KNIGHT_OFFSETS[8] = {-33, -31, -18, -14, 14, 18, 31, 33};
static const int BISHOP_OFFSETS[4] = {-17, -15, 15, 17};
static const int ROOK_OFFSETS[4] = {-16, -1, 1, 16};
static const int KING_OFFSETS[8] = {-17, -16, -15, -1, 1, 15, 16, 17};

int is_attacked(const Pos *pos, int sq, int by_color) {
  const uint8_t *board = pos->board;

  // Pawns
  int pawn_dir = (by_color == WHITE) ? -16 : 16;
  int pawn = PAWN | by_color;
  int p1 = sq + pawn_dir - 1;
  if (p1 >= 0 && !(p1 & 0x88) && board[p1] == pawn) return 1;
  int p2 = sq + pawn_dir + 1;
  if (p2 >= 0 && !(p2 & 0x88) && board[p2] == pawn) return 1;

  // Knights
  int knight = KNIGHT | by_color;
  for (int i = 0; i < 8; i++) {
    int to = sq + KNIGHT_OFFSETS[i];
    if (!(to & 0x88) && board[to] == knight) return 1;
  }

  // King
  int king = KING | by_color;
  for (int i = 0; i < 8; i++) {
    int to = sq + KING_OFFSETS[i];
    if (!(to & 0x88) && board[to] == king) return 1;
  }

  // Bishops/Queens (diagonals)
  int bishop = BISHOP | by_color;
  int queen = QUEEN | by_color;
  for (int i = 0; i < 4; i++) {
    int off = BISHOP_OFFSETS[i];
    int to = sq + off;
    while (to >= 0 && !(to & 0x88)) {
      int piece = board[to];
      if (piece) {
        if (piece == bishop || piece == queen) return 1;
        break;
      }
      to += off;
    }
  }

  // Rooks/Queens (straights)
  int rook = ROOK | by_color;
  for (int i = 0; i < 4; i++) {
    int off = ROOK_OFFSETS[i];
    int to = sq + off;
    while (to >= 0 && !(to & 0x88)) {
      int piece = board[to];
      if (piece) {
        if (piece == rook || piece == queen) return 1;
        break;
      }
      to += off;
    }
  }

  return 0;
}
