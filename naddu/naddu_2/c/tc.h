#ifndef TC_H
#define TC_H

#include "types.h"

typedef struct {
  uint32_t best_move;
  uint64_t nodes;
  uint64_t max_nodes;
  int max_depth;
  uint64_t start_time;
  uint64_t finish_time;
  int finished;
  volatile int stop;  // For threaded stop command
} TimeControl;

extern TimeControl tc;

uint64_t now_ms(void);
void tc_clear(void);
void tc_check(void);
void tc_init(int argc, char **tokens);

#endif
