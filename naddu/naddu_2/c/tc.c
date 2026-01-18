#include <string.h>
#include <stdlib.h>
#include "tc.h"
#include "node.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/time.h>
#endif

TimeControl tc;

uint64_t now_ms(void) {
#ifdef _WIN32
  return GetTickCount64();
#else
  struct timeval tv;
  gettimeofday(&tv, NULL);
  return (uint64_t)tv.tv_sec * 1000 + tv.tv_usec / 1000;
#endif
}

void tc_clear(void) {
  tc.best_move = 0;
  tc.nodes = 0;
  tc.max_nodes = 0;
  tc.max_depth = MAX_PLY;
  tc.start_time = now_ms();
  tc.finish_time = 0;
  tc.finished = 0;
  tc.stop = 0;
}

void tc_check(void) {
  if (tc.stop) {
    tc.finished = 1;
  }
  else if (tc.finish_time && now_ms() >= tc.finish_time) {
    tc.finished = 1;
  }
  else if (tc.max_nodes && tc.nodes >= tc.max_nodes) {
    tc.finished = 1;
  }
}

void tc_init(int argc, char **tokens) {
  tc_clear();

  int wtime = 0;
  int btime = 0;
  int winc = 0;
  int binc = 0;
  int movestogo = 30;
  int movetime = 0;
  int infinite = 0;

  for (int i = 1; i < argc; i++) {
    const char *token = tokens[i];

    if (strcmp(token, "wtime") == 0 && i + 1 < argc) {
      wtime = atoi(tokens[++i]);
    }
    else if (strcmp(token, "btime") == 0 && i + 1 < argc) {
      btime = atoi(tokens[++i]);
    }
    else if (strcmp(token, "winc") == 0 && i + 1 < argc) {
      winc = atoi(tokens[++i]);
    }
    else if (strcmp(token, "binc") == 0 && i + 1 < argc) {
      binc = atoi(tokens[++i]);
    }
    else if (strcmp(token, "movestogo") == 0 && i + 1 < argc) {
      movestogo = atoi(tokens[++i]);
      if (movestogo < 2) movestogo = 2;
    }
    else if ((strcmp(token, "depth") == 0 || strcmp(token, "d") == 0) && i + 1 < argc) {
      tc.max_depth = atoi(tokens[++i]);
    }
    else if ((strcmp(token, "nodes") == 0 || strcmp(token, "n") == 0) && i + 1 < argc) {
      tc.max_nodes = atoi(tokens[++i]);
    }
    else if ((strcmp(token, "movetime") == 0 || strcmp(token, "m") == 0) && i + 1 < argc) {
      movetime = atoi(tokens[++i]);
    }
    else if (strcmp(token, "infinite") == 0 || strcmp(token, "i") == 0) {
      infinite = 1;
    }
  }

  if (movetime > 0) {
    tc.finish_time = tc.start_time + movetime;
  }
  else if (!infinite && (wtime > 0 || btime > 0)) {
    Pos *pos = &nodes[0].pos;
    int is_white = (pos->stm == WHITE);
    int time_left = is_white ? wtime : btime;
    int increment = is_white ? winc : binc;

    int allocated_time = (time_left / movestogo) + (increment / 2);
    tc.finish_time = tc.start_time + allocated_time;
  }

  if (tc.max_depth <= 0)
    tc.max_depth = MAX_PLY;
  else if (tc.max_depth > MAX_PLY)
    tc.max_depth = MAX_PLY;
}
