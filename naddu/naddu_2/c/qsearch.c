#include "qsearch.h"
#include "node.h"
#include "pos.h"
#include "eval.h"
#include "tt.h"
#include "tc.h"
#include "attack.h"
#include "make.h"
#include "move.h"
#include "iterate.h"

int qsearch(int ply, int alpha, int beta) {
  if (ply == MAX_PLY - 1)
    return evaluate(&nodes[ply]);

  tc_check();
  if (tc.finished)
    return 0;

  tc.nodes++;

  Node *node = &nodes[ply];
  Pos *pos = &node->pos;

  int tt_index = tt_get(pos);
  if (tt_index >= 0) {
    int score = tt_score_from_tt(tt_get_score(tt_index), ply);
    int type = tt_get_type(tt_index);
    if (type == TT_EXACT || (type == TT_BETA && score >= beta) || (type == TT_ALPHA && score <= alpha)) {
      return score;
    }
  }

  int stand_pat = evaluate(node);
  if (node->draw)
    return 0;
  if (stand_pat >= beta)
    return stand_pat;
  if (stand_pat > alpha)
    alpha = stand_pat;

  Node *next_node = &nodes[ply + 1];
  Pos *next_pos = &next_node->pos;
  int stmi = pos->stm >> 3;

  uint32_t tt_move = 0;
  if (tt_index >= 0) {
    uint32_t tm = tt_get_move(tt_index);
    if (tm & MOVE_FLAG_CAPTURE) {
      tt_move = move_is_probably_legal(node, tm);
    }
  }

  init_next_move_qs(node, tt_move);

  uint32_t move;

  while ((move = get_next_move_qs(node))) {
    pos_copy(next_pos, pos);
    make_move(move, next_pos);

    if (is_attacked(next_pos, next_pos->kings[stmi], next_pos->stm))
      continue;

    int score = -qsearch(ply + 1, -beta, -alpha);

    if (tc.finished)
      return 0;

    if (score >= beta)
      return score;

    if (score > alpha)
      alpha = score;
  }

  return alpha;
}
