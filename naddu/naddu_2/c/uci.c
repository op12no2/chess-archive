#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "uci.h"
#include "types.h"
#include "pos.h"
#include "node.h"
#include "gen.h"
#include "make.h"
#include "eval.h"
#include "tc.h"
#include "go.h"
#include "perft.h"
#include "bench.h"
#include "pt.h"
#include "rep.h"
#include "history.h"
#include "killers.h"
#include "zob.h"

#define STARTPOS "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
#define MAX_TOKENS 512

void position_fen(const char *fen, char **moves, int num_moves) {
  Node *node = &nodes[0];
  Pos *pos = &node->pos;

  pos_set_fen(pos, fen);
  rep_clear();
  rep_push(pos);

  if (moves && num_moves > 0) {
    for (int i = 0; i < num_moves; i++) {
      do_move(moves[i]);
      rep_push(pos);
    }
  }

  history_clear();
  killers_clear();
}

static void exec_tokens(int argc, char **tokens) {
  if (argc == 0)
    return;

  const char *cmd = tokens[0];

  if (strcmp(cmd, "ucinewgame") == 0 || strcmp(cmd, "u") == 0) {
    new_game();
  }
  else if (strcmp(cmd, "stop") == 0) {
    tc.stop = 1;
  }
  else if (strcmp(cmd, "uci") == 0) {
    printf("id name Naddu C\n");
    printf("id author Colin Jenkins\n");
    printf("uciok\n");
    fflush(stdout);
  }
  else if (strcmp(cmd, "go") == 0 || strcmp(cmd, "g") == 0) {
    tc_init(argc, tokens);
    go();
  }
  else if (strcmp(cmd, "bf") == 0) {
    bf();
  }
  else if (strcmp(cmd, "isready") == 0) {
    printf("readyok\n");
    fflush(stdout);
  }
  else if (strcmp(cmd, "position") == 0 || strcmp(cmd, "p") == 0) {
    const char *fen = NULL;
    int moves_index = -1;
    static char fen_buf[256];

    if (argc > 1 && (strcmp(tokens[1], "startpos") == 0 || strcmp(tokens[1], "s") == 0)) {
      fen = STARTPOS;
      moves_index = 2;
    }
    else if (argc > 1 && (strcmp(tokens[1], "fen") == 0 || strcmp(tokens[1], "f") == 0)) {
      // FEN takes next 6 tokens
      fen_buf[0] = '\0';
      for (int i = 2; i < 8 && i < argc; i++) {
        if (i > 2) strcat(fen_buf, " ");
        strcat(fen_buf, tokens[i]);
      }
      fen = fen_buf;
      moves_index = 8;
    }

    char **moves = NULL;
    int num_moves = 0;

    if (moves_index >= 0 && moves_index < argc && strcmp(tokens[moves_index], "moves") == 0) {
      moves = &tokens[moves_index + 1];
      num_moves = argc - moves_index - 1;
    }

    if (fen) {
      position_fen(fen, moves, num_moves);
    }
  }
  else if (strcmp(cmd, "board") == 0 || strcmp(cmd, "b") == 0) {
    pos_print(&nodes[0].pos);
  }
  else if (strcmp(cmd, "perft") == 0 || strcmp(cmd, "f") == 0) {
    if (argc > 1) {
      int depth = atoi(tokens[1]);
      uint64_t t1 = now_ms();
      uint64_t n = perft(depth, 0);
      uint64_t elapsed = now_ms() - t1;
      uint64_t nps = elapsed > 0 ? (n * 1000 / elapsed) : 0;
      printf("nodes %llu elapsed %llu nps %llu\n",
             (unsigned long long)n, (unsigned long long)elapsed, (unsigned long long)nps);
      fflush(stdout);
    }
  }
  else if (strcmp(cmd, "eval") == 0 || strcmp(cmd, "e") == 0) {
    printf("%d\n", evaluate(&nodes[0]));
    fflush(stdout);
  }
  else if (strcmp(cmd, "bench") == 0 || strcmp(cmd, "bn") == 0) {
    bench();
  }
  else if (strcmp(cmd, "perfttests") == 0 || strcmp(cmd, "pt") == 0) {
    perft_tests();
  }
  else if (strcmp(cmd, "evaltests") == 0 || strcmp(cmd, "et") == 0) {
    eval_tests();
  }
  else if (strcmp(cmd, "quit") == 0 || strcmp(cmd, "q") == 0) {
    exit(0);
  }
  else {
    printf("?\n");
    fflush(stdout);
  }
}

void exec_string(const char *cmd) {
  static char buf[4096];
  static char *tokens[MAX_TOKENS];

  strncpy(buf, cmd, sizeof(buf) - 1);
  buf[sizeof(buf) - 1] = '\0';

  int argc = 0;
  char *tok = strtok(buf, " \t\n\r");
  while (tok && argc < MAX_TOKENS) {
    tokens[argc++] = tok;
    tok = strtok(NULL, " \t\n\r");
  }

  exec_tokens(argc, tokens);
}

void uci_loop(void) {
  char line[4096];

  while (fgets(line, sizeof(line), stdin)) {
    // Remove trailing newline
    size_t len = strlen(line);
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';

    if (len == 0)
      continue;

    exec_string(line);
  }
}
