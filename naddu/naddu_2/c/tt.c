#include <string.h>
#include "tt.h"

static uint64_t tt_hash[TT_SIZE];
static uint32_t tt_move[TT_SIZE];
static uint8_t tt_type[TT_SIZE];
static int16_t tt_score[TT_SIZE];
static uint8_t tt_depth[TT_SIZE];

void tt_init(void) {
  tt_clear();
}

void tt_clear(void) {
  memset(tt_type, 0, TT_SIZE);
}

void tt_put(const Pos *pos, int type, int depth, int score, uint32_t move) {
  int index = pos->hash & TT_MASK;

  tt_hash[index] = pos->hash;
  tt_move[index] = move;
  tt_type[index] = type;
  tt_score[index] = score;
  tt_depth[index] = depth;
}

int tt_get(const Pos *pos) {
  uint64_t hash = pos->hash;
  int index = hash & TT_MASK;

  if (tt_hash[index] == hash && tt_type[index]) {
    return index;
  }

  return -1;
}

uint32_t tt_get_move(int index) {
  return tt_move[index];
}

int tt_get_type(int index) {
  return tt_type[index];
}

int tt_get_score(int index) {
  return tt_score[index];
}

int tt_get_depth(int index) {
  return tt_depth[index];
}

int tt_score_to_tt(int score, int ply) {
  if (score > TT_MATE_BOUND)
    return score + ply;
  if (score < -TT_MATE_BOUND)
    return score - ply;
  return score;
}

int tt_score_from_tt(int score, int ply) {
  if (score > TT_MATE_BOUND)
    return score - ply;
  if (score < -TT_MATE_BOUND)
    return score + ply;
  return score;
}
