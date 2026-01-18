#ifndef POS_H
#define POS_H

#include "types.h"

typedef struct {
  uint8_t board[128];
  uint8_t kings[2];
  uint8_t ep;
  uint8_t rights;
  uint8_t stm;
  uint8_t hmc;
  uint64_t hash;
} Pos;

void pos_clear(Pos *pos);
void pos_copy(Pos *dst, const Pos *src);
void pos_set_fen(Pos *pos, const char *fen);
void pos_print(const Pos *pos);

#endif
