#ifndef HISTORY_H
#define HISTORY_H

#include "types.h"
#include "pos.h"

#define HISTORY_MAX (32767 - MAX_PLY * MAX_PLY)

extern int16_t piece_history[16][128];

void history_init(void);
void history_clear(void);
void history_halve(void);
void add_history(const Pos *pos, uint32_t move, int depth);

#endif
