#include <string.h>
#include "history.h"

int16_t piece_history[16][128];

void history_init(void) {
  history_clear();
}

void history_clear(void) {
  memset(piece_history, 0, sizeof(piece_history));
}

void history_halve(void) {
  for (int i = 0; i < 16; i++) {
    for (int j = 0; j < 128; j++) {
      piece_history[i][j] >>= 1;
    }
  }
}

void add_history(const Pos *pos, uint32_t move, int depth) {
  if (move & MOVE_FLAG_CAPTURE)
    return;

  int from = MOVE_FROM(move);
  int to = MOVE_TO(move);
  int piece = pos->board[from];
  int bonus = depth * depth;
  int current = piece_history[piece][to];
  int update = bonus - (current * bonus) / HISTORY_MAX;
  int new_val = current + update;

  if (new_val >= HISTORY_MAX) {
    history_halve();
    piece_history[piece][to] += update / 2;
  }
  else {
    piece_history[piece][to] = new_val;
  }
}
