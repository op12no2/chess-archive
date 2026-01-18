#ifndef TT_H
#define TT_H

#include "types.h"
#include "pos.h"

void tt_init(void);
void tt_clear(void);
void tt_put(const Pos *pos, int type, int depth, int score, uint32_t move);
int tt_get(const Pos *pos);
uint32_t tt_get_move(int index);
int tt_get_type(int index);
int tt_get_score(int index);
int tt_get_depth(int index);
int tt_score_to_tt(int score, int ply);
int tt_score_from_tt(int score, int ply);

#endif
