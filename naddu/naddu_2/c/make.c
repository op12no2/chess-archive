#include <string.h>
#include "make.h"
#include "zob.h"
#include "node.h"
#include "gen.h"
#include "move.h"

static uint8_t rights_mask[128];

void make_init(void) {
  memset(rights_mask, 0x0F, 128);
  rights_mask[0x00] = 0x0F ^ RIGHTS_Q;
  rights_mask[0x07] = 0x0F ^ RIGHTS_K;
  rights_mask[0x70] = 0x0F ^ RIGHTS_q;
  rights_mask[0x77] = 0x0F ^ RIGHTS_k;
  rights_mask[0x04] = 0x0F ^ RIGHTS_K ^ RIGHTS_Q;
  rights_mask[0x74] = 0x0F ^ RIGHTS_k ^ RIGHTS_q;
}

void make_move(uint32_t move, Pos *pos) {
  int from = MOVE_FROM(move);
  int to = MOVE_TO(move);
  int piece = pos->board[from];
  int captured = pos->board[to];
  int old_rights = pos->rights;
  int old_ep = pos->ep;

  // Update halfmove clock
  if ((piece & 0x7) == PAWN || captured || (move & MOVE_FLAG_EPCAPTURE)) {
    pos->hmc = 0;
  }
  else {
    pos->hmc++;
  }

  uint64_t *piece_zob = zob_pieces[piece];
  uint64_t h = pos->hash;

  // Remove piece from 'from' square
  h ^= piece_zob[from];

  // Remove captured piece (if any)
  if (captured) {
    h ^= zob_pieces[captured][to];
  }

  pos->board[to] = piece;
  pos->board[from] = 0;
  pos->ep = 0;

  if (move & MOVE_EXTRA_MASK) {
    if (move & MOVE_PROMO_MASK) {
      int promo_piece = pos->stm | ((move & MOVE_PROMO_MASK) >> MOVE_PROMO_SHIFT);
      pos->board[to] = promo_piece;
      h ^= zob_pieces[promo_piece][to];
    }
    else if (move & MOVE_FLAG_KING) {
      pos->kings[piece >> 3] = to;
      h ^= piece_zob[to];
    }
    else if (move & MOVE_FLAG_EPMAKE) {
      pos->ep = (pos->stm == WHITE) ? to - 16 : to + 16;
      h ^= piece_zob[to];
    }
    else if (move & MOVE_FLAG_EPCAPTURE) {
      int cap_sq = (pos->stm == WHITE) ? to - 16 : to + 16;
      int cap_piece = pos->board[cap_sq];
      h ^= zob_pieces[cap_piece][cap_sq];
      pos->board[cap_sq] = 0;
      h ^= piece_zob[to];
    }
    else if (move & MOVE_FLAG_KCASTLE) {
      pos->kings[piece >> 3] = to;
      int rook = pos->board[to + 1];
      uint64_t *rook_zob = zob_pieces[rook];
      h ^= rook_zob[to + 1] ^ rook_zob[to - 1];
      pos->board[to - 1] = rook;
      pos->board[to + 1] = 0;
      h ^= piece_zob[to];
    }
    else if (move & MOVE_FLAG_QCASTLE) {
      pos->kings[piece >> 3] = to;
      int rook = pos->board[to - 2];
      uint64_t *rook_zob = zob_pieces[rook];
      h ^= rook_zob[to - 2] ^ rook_zob[to + 1];
      pos->board[to + 1] = rook;
      pos->board[to - 2] = 0;
      h ^= piece_zob[to];
    }
  }
  else {
    h ^= piece_zob[to];
  }

  pos->rights &= rights_mask[from] & rights_mask[to];

  // Update rights hash
  if (pos->rights != old_rights) {
    h ^= zob_rights[old_rights] ^ zob_rights[pos->rights];
  }

  // Update ep hash
  if (old_ep) {
    h ^= zob_ep[old_ep];
  }
  if (pos->ep) {
    h ^= zob_ep[pos->ep];
  }

  // Toggle stm
  h ^= zob_black;

  pos->stm ^= BLACK;
  pos->hash = h;
}

void do_move(const char *uci_move) {
  Node *node = &nodes[0];
  Pos *pos = &node->pos;

  gen_moves(node);

  char buf[8];
  for (int i = 0; i < node->num_moves; i++) {
    uint32_t move = node->moves[i];
    format_move(move, buf);
    if (strcmp(buf, uci_move) == 0) {
      make_move(move, pos);
      return;
    }
  }
}
