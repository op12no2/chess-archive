#include "zob.h"

uint64_t zob_black;
uint64_t zob_rights[16];
uint64_t zob_ep[128];
uint64_t zob_pieces[16][128];

static uint64_t rand_seed = 1234567890ULL;

static uint64_t rand64(void) {
  // xorshift64
  rand_seed ^= rand_seed << 13;
  rand_seed ^= rand_seed >> 7;
  rand_seed ^= rand_seed << 17;
  return rand_seed;
}

void zob_init(void) {
  zob_black = rand64();

  for (int i = 0; i < 16; i++) {
    zob_rights[i] = rand64();
  }

  for (int i = 0; i < 128; i++) {
    zob_ep[i] = rand64();
  }

  for (int piece = 0; piece < 16; piece++) {
    for (int sq = 0; sq < 128; sq++) {
      zob_pieces[piece][sq] = rand64();
    }
  }
}

void zob_rebuild(Pos *pos) {
  uint64_t h = 0;

  for (int rank = 0; rank < 8; rank++) {
    for (int file = 0; file < 8; file++) {
      int sq = rank * 16 + file;
      int piece = pos->board[sq];
      if (piece) {
        h ^= zob_pieces[piece][sq];
      }
    }
  }

  if (pos->stm == BLACK) {
    h ^= zob_black;
  }

  h ^= zob_rights[pos->rights];

  if (pos->ep) {
    h ^= zob_ep[pos->ep];
  }

  pos->hash = h;
}
