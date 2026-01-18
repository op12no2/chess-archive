#ifndef ITERATE_H
#define ITERATE_H

#include "types.h"
#include "node.h"

#define STAGE_TT          0
#define STAGE_GEN_CAPTURE 1
#define STAGE_CAPTURE     2
#define STAGE_GEN_QUIET   3
#define STAGE_QUIET       4
#define STAGE_DONE        5

void init_next_move(Node *node, uint32_t tt_move);
void init_next_move_qs(Node *node, uint32_t tt_move);
uint32_t get_next_move(Node *node);
uint32_t get_next_move_qs(Node *node);

#endif
