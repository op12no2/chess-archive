#ifndef MAKE_H
#define MAKE_H

#include "types.h"
#include "pos.h"

void make_init(void);
void make_move(uint32_t move, Pos *pos);
void do_move(const char *uci_move);

#endif
