#include "move.h"

uint32_t move_is_probably_legal(Node *node, uint32_t move) {
  if (move == 0)
    return 0;

  Pos *pos = &node->pos;
  uint8_t *board = pos->board;
  int stm = pos->stm;

  int from = MOVE_FROM(move);
  int to = MOVE_TO(move);

  // from and to must be on board
  if ((from | to) & 0x88)
    return 0;

  // must have our piece on from square
  int piece = board[from];
  if (!piece)
    return 0;
  if ((piece & BLACK) != stm)
    return 0;

  // to square must be empty or enemy piece
  int target = board[to];
  if (target && (target & BLACK) == stm)
    return 0;

  return move;
}

void format_move(uint32_t move, char *buf) {
  int from = MOVE_FROM(move);
  int to = MOVE_TO(move);

  buf[0] = 'a' + (from & 7);
  buf[1] = '1' + (from >> 4);
  buf[2] = 'a' + (to & 7);
  buf[3] = '1' + (to >> 4);

  if (move & MOVE_PROMO_MASK) {
    int promo_type = (move & MOVE_PROMO_MASK) >> MOVE_PROMO_SHIFT;
    const char promo_chars[] = {0, 0, 'n', 'b', 'r', 'q'};
    buf[4] = promo_chars[promo_type];
    buf[5] = '\0';
  }
  else {
    buf[4] = '\0';
  }
}
