#include "rep.h"

static uint64_t rep_history[REP_MAX];
static int rep_game_ply = 0;

void rep_clear(void) {
  rep_game_ply = 0;
}

void rep_push(const Pos *pos) {
  rep_history[rep_game_ply++] = pos->hash;
}

void rep_record(const Pos *pos, int ply) {
  rep_history[rep_game_ply + ply] = pos->hash;
}

int is_repetition(const Pos *pos, int ply) {
  uint64_t hash = pos->hash;
  int current_ply = rep_game_ply + ply;

  int lookback = current_ply < pos->hmc ? current_ply : pos->hmc;

  for (int i = 2; i <= lookback; i += 2) {
    if (rep_history[current_ply - i] == hash) {
      return 1;
    }
  }
  return 0;
}

int is_fifty_moves(const Pos *pos) {
  return pos->hmc >= 100;
}

int is_draw(const Pos *pos, int ply) {
  return is_fifty_moves(pos) || is_repetition(pos, ply);
}
