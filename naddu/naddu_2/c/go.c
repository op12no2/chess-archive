#include <stdio.h>
#include "go.h"
#include "tt.h"
#include "rep.h"
#include "tc.h"
#include "search.h"
#include "move.h"
#include "node.h"
#include "uci.h"

#define STARTPOS "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

void new_game(void) {
  tt_clear();
  rep_clear();
}

void go(void) {
  char move_str[8];

  for (int d = 1; d <= tc.max_depth; d++) {
    uint32_t bm = tc.best_move;
    int score = search(d, 0, -32767, 32767);

    if (tc.finished) {
      if (bm)
        tc.best_move = bm;
      break;
    }

    uint64_t elapsed = now_ms() - tc.start_time;
    uint64_t nps = elapsed > 0 ? (1000 * tc.nodes / elapsed) : 0;

    format_move(tc.best_move, move_str);
    printf("info depth %d score cp %d nodes %llu nps %llu pv %s\n",
           d, score, (unsigned long long)tc.nodes, (unsigned long long)nps, move_str);
    fflush(stdout);
  }

  format_move(tc.best_move, move_str);
  printf("bestmove %s\n", move_str);
  fflush(stdout);
}

void bf(void) {
  new_game();
  position_fen(STARTPOS, NULL, 0);

  int depth = 9;
  uint64_t search_nodes[MAX_PLY];
  double total_bf = 0;

  for (int d = 1; d <= depth; d++) {
    tc_clear();
    search(d, 0, -32767, 32767);
    search_nodes[d] = tc.nodes;

    if (d > 1) {
      double this_bf = (double)search_nodes[d] / search_nodes[d - 1];
      total_bf += this_bf;
      double mean_bf = total_bf / (d - 1);
      printf("depth %d nodes %llu bf %.1f mean %.1f\n",
             d, (unsigned long long)search_nodes[d], this_bf, mean_bf);
    }
    else {
      printf("depth %d nodes %llu\n", d, (unsigned long long)search_nodes[d]);
    }
    fflush(stdout);
  }
}
