#include "search.h"
#include "qsearch.h"
#include "node.h"
#include "pos.h"
#include "eval.h"
#include "tt.h"
#include "tc.h"
#include "rep.h"
#include "attack.h"
#include "make.h"
#include "move.h"
#include "iterate.h"
#include "history.h"
#include "killers.h"

int search(int depth, int ply, int alpha, int beta) {
  if (ply == MAX_PLY - 1)
    return evaluate(&nodes[ply]);

  tc_check();
  if (tc.finished)
    return 0;

  Node *node = &nodes[ply];
  Pos *pos = &node->pos;
  int stmi = pos->stm >> 3;
  int nstm = pos->stm ^ BLACK;
  int in_check = is_attacked(pos, pos->kings[stmi], nstm);

  if (!in_check && depth <= 0)
    return qsearch(ply, alpha, beta);

  if (depth < 0) depth = 0;

  tc.nodes++;

  Node *next_node = &nodes[ply + 1];
  Pos *next_pos = &next_node->pos;
  int o_alpha = alpha;
  int is_root = (ply == 0);
  int is_pv = is_root || (beta - alpha != 1);

  rep_record(pos, ply);

  int tt_index = tt_get(pos);
  if (!is_root && tt_index >= 0 && tt_get_depth(tt_index) >= depth) {
    int score = tt_score_from_tt(tt_get_score(tt_index), ply);
    int type = tt_get_type(tt_index);
    if (type == TT_EXACT || (type == TT_BETA && score >= beta) || (type == TT_ALPHA && score <= alpha)) {
      return score;
    }
  }

  int ev = evaluate(node);
  if (!is_root && (node->draw || is_draw(pos, ply)))
    return 0;

  // Beta pruning
  if (!is_pv && !in_check && depth <= 8 && beta < TT_MATE_BOUND && (ev - depth * 100) >= beta)
    return ev;

  uint32_t tt_move = tt_index >= 0 ? move_is_probably_legal(node, tt_get_move(tt_index)) : 0;

  init_next_move(node, tt_move);

  int best_score = -32767;
  uint32_t best_move = 0;
  int num_moves = 0;
  uint32_t move;

  while ((move = get_next_move(node))) {
    pos_copy(next_pos, pos);
    make_move(move, next_pos);

    if (is_attacked(next_pos, next_pos->kings[stmi], nstm))
      continue;

    num_moves++;

    int score;

    if (num_moves == 1) {
      score = -search(depth - 1, ply + 1, -beta, -alpha);
    }
    else {
      score = -search(depth - 1, ply + 1, -alpha - 1, -alpha);
      if (!tc.finished && score > alpha && score < beta) {
        score = -search(depth - 1, ply + 1, -beta, -alpha);
      }
    }

    if (tc.finished)
      return 0;

    if (score > best_score) {
      best_score = score;
      best_move = move;
    }

    if (best_score > alpha) {
      if (is_root) {
        tc.best_move = best_move;
      }
      alpha = best_score;
    }

    if (alpha >= beta) {
      add_history(pos, best_move, depth);
      killer_set(node, best_move);
      tt_put(pos, TT_BETA, depth, tt_score_to_tt(best_score, ply), best_move);
      return best_score;
    }
  }

  if (num_moves == 0)
    return in_check ? -MATE + ply : 0;

  tt_put(pos, best_score > o_alpha ? TT_EXACT : TT_ALPHA, depth, tt_score_to_tt(best_score, ply), best_move);

  return best_score;
}
