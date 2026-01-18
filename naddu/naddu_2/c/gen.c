#include "gen.h"
#include "attack.h"

static const int KNIGHT_OFFSETS[8] = {-33, -31, -18, -14, 14, 18, 31, 33};
static const int BISHOP_OFFSETS[4] = {-17, -15, 15, 17};
static const int ROOK_OFFSETS[4] = {-16, -1, 1, 16};
static const int QUEEN_OFFSETS[8] = {-17, -16, -15, -1, 1, 15, 16, 17};
static const int KING_OFFSETS[8] = {-17, -16, -15, -1, 1, 15, 16, 17};
static const int PAWN_CAP_WHITE[2] = {15, 17};
static const int PAWN_CAP_BLACK[2] = {-15, -17};

void gen_moves(Node *node) {
  node->num_moves = 0;
  gen_captures(node);
  gen_quiets(node);
}

void gen_captures(Node *node) {
  uint32_t *moves = node->moves;
  Pos *pos = &node->pos;
  uint8_t *board = pos->board;
  int stm = pos->stm;
  int nstm = stm ^ BLACK;
  int num_moves = node->num_moves;

  for (int sq = 0; sq < 128; sq++) {
    if (sq & 0x88) continue;

    int piece = board[sq];
    if (!piece) continue;
    if ((piece & BLACK) != stm) continue;

    int type = piece & 7;

    switch (type) {
      case PAWN: {
        int promo_rank = (stm == WHITE) ? 6 : 1;
        int rank = sq >> 4;
        int is_promo = (rank == promo_rank);
        const int *cap_offsets = (stm == WHITE) ? PAWN_CAP_WHITE : PAWN_CAP_BLACK;

        for (int i = 0; i < 2; i++) {
          int to = sq + cap_offsets[i];
          if (to & 0x88) continue;
          int target = board[to];
          if (target && (target & BLACK) == nstm) {
            if (is_promo) {
              moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE | MOVE_PROMO_Q);
              moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE | MOVE_PROMO_R);
              moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE | MOVE_PROMO_B);
              moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE | MOVE_PROMO_N);
            }
            else {
              moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE);
            }
          }
          else if (pos->ep && to == pos->ep) {
            moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_EPCAPTURE | MOVE_FLAG_CAPTURE);
          }
        }
        break;
      }

      case KNIGHT: {
        for (int i = 0; i < 8; i++) {
          int to = sq + KNIGHT_OFFSETS[i];
          if (to & 0x88) continue;
          int target = board[to];
          if (target && (target & BLACK) == nstm) {
            moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE);
          }
        }
        break;
      }

      case BISHOP: {
        for (int i = 0; i < 4; i++) {
          int off = BISHOP_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            int target = board[to];
            if (target) {
              if ((target & BLACK) == nstm) {
                moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE);
              }
              break;
            }
            to += off;
          }
        }
        break;
      }

      case ROOK: {
        for (int i = 0; i < 4; i++) {
          int off = ROOK_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            int target = board[to];
            if (target) {
              if ((target & BLACK) == nstm) {
                moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE);
              }
              break;
            }
            to += off;
          }
        }
        break;
      }

      case QUEEN: {
        for (int i = 0; i < 8; i++) {
          int off = QUEEN_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            int target = board[to];
            if (target) {
              if ((target & BLACK) == nstm) {
                moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE);
              }
              break;
            }
            to += off;
          }
        }
        break;
      }

      case KING: {
        for (int i = 0; i < 8; i++) {
          int to = sq + KING_OFFSETS[i];
          if (to & 0x88) continue;
          int target = board[to];
          if (target && (target & BLACK) == nstm && (target & 7) != KING) {
            moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_CAPTURE | MOVE_FLAG_KING);
          }
        }
        break;
      }
    }
  }

  node->num_moves = num_moves;
}

void gen_quiets(Node *node) {
  uint32_t *moves = node->moves;
  Pos *pos = &node->pos;
  uint8_t *board = pos->board;
  int stm = pos->stm;
  int num_moves = node->num_moves;

  for (int sq = 0; sq < 128; sq++) {
    if (sq & 0x88) continue;

    int piece = board[sq];
    if (!piece) continue;
    if ((piece & BLACK) != stm) continue;

    int type = piece & 7;

    switch (type) {
      case PAWN: {
        int dir = (stm == WHITE) ? 16 : -16;
        int promo_rank = (stm == WHITE) ? 6 : 1;
        int start_rank = (stm == WHITE) ? 1 : 6;
        int rank = sq >> 4;
        int is_promo = (rank == promo_rank);
        int to1 = sq + dir;

        if (!(to1 & 0x88) && !board[to1]) {
          if (is_promo) {
            moves[num_moves++] = MOVE_ENCODE(sq, to1, MOVE_PROMO_Q);
            moves[num_moves++] = MOVE_ENCODE(sq, to1, MOVE_PROMO_R);
            moves[num_moves++] = MOVE_ENCODE(sq, to1, MOVE_PROMO_B);
            moves[num_moves++] = MOVE_ENCODE(sq, to1, MOVE_PROMO_N);
          }
          else {
            moves[num_moves++] = MOVE_ENCODE(sq, to1, 0);
            if (rank == start_rank) {
              int to2 = sq + dir + dir;
              if (!(to2 & 0x88) && !board[to2]) {
                moves[num_moves++] = MOVE_ENCODE(sq, to2, MOVE_FLAG_EPMAKE);
              }
            }
          }
        }
        break;
      }

      case KNIGHT: {
        for (int i = 0; i < 8; i++) {
          int to = sq + KNIGHT_OFFSETS[i];
          if (to & 0x88) continue;
          if (!board[to]) {
            moves[num_moves++] = MOVE_ENCODE(sq, to, 0);
          }
        }
        break;
      }

      case BISHOP: {
        for (int i = 0; i < 4; i++) {
          int off = BISHOP_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            if (board[to]) break;
            moves[num_moves++] = MOVE_ENCODE(sq, to, 0);
            to += off;
          }
        }
        break;
      }

      case ROOK: {
        for (int i = 0; i < 4; i++) {
          int off = ROOK_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            if (board[to]) break;
            moves[num_moves++] = MOVE_ENCODE(sq, to, 0);
            to += off;
          }
        }
        break;
      }

      case QUEEN: {
        for (int i = 0; i < 8; i++) {
          int off = QUEEN_OFFSETS[i];
          int to = sq + off;
          while (!(to & 0x88)) {
            if (board[to]) break;
            moves[num_moves++] = MOVE_ENCODE(sq, to, 0);
            to += off;
          }
        }
        break;
      }

      case KING: {
        for (int i = 0; i < 8; i++) {
          int to = sq + KING_OFFSETS[i];
          if (to & 0x88) continue;
          if (!board[to]) {
            moves[num_moves++] = MOVE_ENCODE(sq, to, MOVE_FLAG_KING);
          }
        }
        break;
      }
    }
  }

  // Castling
  if (pos->rights) {
    if (stm == WHITE) {
      if ((pos->rights & RIGHTS_K) && !board[0x05] && !board[0x06] &&
          !is_attacked(pos, 0x04, BLACK) && !is_attacked(pos, 0x05, BLACK) && !is_attacked(pos, 0x06, BLACK)) {
        moves[num_moves++] = MOVE_ENCODE(0x04, 0x06, MOVE_FLAG_KCASTLE);
      }
      if ((pos->rights & RIGHTS_Q) && !board[0x03] && !board[0x02] && !board[0x01] &&
          !is_attacked(pos, 0x04, BLACK) && !is_attacked(pos, 0x03, BLACK) && !is_attacked(pos, 0x02, BLACK)) {
        moves[num_moves++] = MOVE_ENCODE(0x04, 0x02, MOVE_FLAG_QCASTLE);
      }
    }
    else {
      if ((pos->rights & RIGHTS_k) && !board[0x75] && !board[0x76] &&
          !is_attacked(pos, 0x74, WHITE) && !is_attacked(pos, 0x75, WHITE) && !is_attacked(pos, 0x76, WHITE)) {
        moves[num_moves++] = MOVE_ENCODE(0x74, 0x76, MOVE_FLAG_KCASTLE);
      }
      if ((pos->rights & RIGHTS_q) && !board[0x73] && !board[0x72] && !board[0x71] &&
          !is_attacked(pos, 0x74, WHITE) && !is_attacked(pos, 0x73, WHITE) && !is_attacked(pos, 0x72, WHITE)) {
        moves[num_moves++] = MOVE_ENCODE(0x74, 0x72, MOVE_FLAG_QCASTLE);
      }
    }
  }

  node->num_moves = num_moves;
}
