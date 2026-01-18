#ifndef ZOB_H
#define ZOB_H

#include "types.h"
#include "pos.h"

extern uint64_t zob_black;
extern uint64_t zob_rights[16];
extern uint64_t zob_ep[128];
extern uint64_t zob_pieces[16][128];

void zob_init(void);
void zob_rebuild(Pos *pos);

#endif
