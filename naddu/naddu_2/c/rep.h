#ifndef REP_H
#define REP_H

#include "types.h"
#include "pos.h"

#define REP_MAX 1024

void rep_clear(void);
void rep_push(const Pos *pos);
void rep_record(const Pos *pos, int ply);
int is_repetition(const Pos *pos, int ply);
int is_fifty_moves(const Pos *pos);
int is_draw(const Pos *pos, int ply);

#endif
