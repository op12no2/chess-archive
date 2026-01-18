#ifndef NODE_H
#define NODE_H

#include "types.h"
#include "pos.h"

typedef struct {
  Pos pos;
  uint32_t moves[MAX_MOVES];
  int32_t ranks[MAX_MOVES];
  int num_moves;
  int next_move;
  int stage;
  uint32_t tt_move;
  uint32_t killer;
  int draw;
} Node;

extern Node nodes[MAX_PLY];

void node_init(void);

#endif
