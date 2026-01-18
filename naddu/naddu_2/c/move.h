#ifndef MOVE_H
#define MOVE_H

#include "types.h"
#include "node.h"

uint32_t move_is_probably_legal(Node *node, uint32_t move);
void format_move(uint32_t move, char *buf);

#endif
