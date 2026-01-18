#include <stdio.h>
#include "perft.h"
#include "types.h"
#include "node.h"
#include "pos.h"
#include "tt.h"
#include "zob.h"
#include "iterate.h"
#include "make.h"
#include "attack.h"

#define TT_PERFT 4

uint64_t perft(int depth, int ply) {
  if (ply == 0)
    tt_clear();

  if (depth == 0)
    return 1;

  Node *node = &nodes[ply];
  Node *next_node = &nodes[ply + 1];
  Pos *pos = &node->pos;
  Pos *next_pos = &next_node->pos;
  int stmi = pos->stm >> 3;

  // Check incremental hash matches rebuilt hash
  uint64_t hash = pos->hash;
  zob_rebuild(pos);
  if (hash != pos->hash) {
    printf("*********** hash mismatch %016llx %016llx\n",
           (unsigned long long)hash, (unsigned long long)pos->hash);
  }

  // Probe TT
  int tt_index = tt_get(pos);
  if (tt_index >= 0 && tt_get_type(tt_index) == TT_PERFT && tt_get_depth(tt_index) == depth) {
    // Node count stored in move field (and score for high bits if needed)
    return tt_get_move(tt_index);
  }

  uint64_t tot = 0;

  init_next_move(node, 0);

  uint32_t move;
  while ((move = get_next_move(node))) {
    pos_copy(next_pos, pos);
    make_move(move, next_pos);

    if (is_attacked(next_pos, next_pos->kings[stmi], next_pos->stm))
      continue;

    tot += perft(depth - 1, ply + 1);
  }

  if (depth > 2)
    tt_put(pos, TT_PERFT, depth, 0, (uint32_t)tot);

  return tot;
}
