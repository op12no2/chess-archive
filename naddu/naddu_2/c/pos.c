#include <stdio.h>
#include <string.h>
#include "pos.h"
#include "zob.h"

void pos_clear(Pos *pos) {
  memset(pos->board, 0, 128);
  pos->kings[0] = 0;
  pos->kings[1] = 0;
  pos->ep = 0;
  pos->rights = 0;
  pos->stm = WHITE;
  pos->hmc = 0;
  pos->hash = 0;
}

void pos_copy(Pos *dst, const Pos *src) {
  memcpy(dst, src, sizeof(Pos));
}

static int piece_from_char(char c) {
  switch (c) {
    case 'P': return PAWN;
    case 'N': return KNIGHT;
    case 'B': return BISHOP;
    case 'R': return ROOK;
    case 'Q': return QUEEN;
    case 'K': return KING;
    case 'p': return PAWN | BLACK;
    case 'n': return KNIGHT | BLACK;
    case 'b': return BISHOP | BLACK;
    case 'r': return ROOK | BLACK;
    case 'q': return QUEEN | BLACK;
    case 'k': return KING | BLACK;
    default: return 0;
  }
}

void pos_set_fen(Pos *pos, const char *fen) {
  pos_clear(pos);

  int rank = 7;
  int file = 0;
  int i = 0;

  // Parse piece placement
  while (fen[i] && fen[i] != ' ') {
    char c = fen[i++];
    if (c == '/') {
      rank--;
      file = 0;
    }
    else if (c >= '1' && c <= '8') {
      file += c - '0';
    }
    else {
      int sq = rank * 16 + file;
      int piece = piece_from_char(c);
      pos->board[sq] = piece;
      if (c == 'K') pos->kings[0] = sq;
      if (c == 'k') pos->kings[1] = sq;
      file++;
    }
  }

  // Skip space
  while (fen[i] == ' ') i++;

  // Side to move
  if (fen[i] == 'b') pos->stm = BLACK;
  i++;

  // Skip space
  while (fen[i] == ' ') i++;

  // Castling rights
  while (fen[i] && fen[i] != ' ') {
    switch (fen[i]) {
      case 'K': pos->rights |= RIGHTS_K; break;
      case 'Q': pos->rights |= RIGHTS_Q; break;
      case 'k': pos->rights |= RIGHTS_k; break;
      case 'q': pos->rights |= RIGHTS_q; break;
    }
    i++;
  }

  // Skip space
  while (fen[i] == ' ') i++;

  // En passant
  if (fen[i] && fen[i] != '-') {
    int ep_file = fen[i] - 'a';
    i++;
    int ep_rank = fen[i] - '1';
    pos->ep = ep_rank * 16 + ep_file;
    i++;
  }
  else if (fen[i] == '-') {
    i++;
  }

  // Skip space
  while (fen[i] == ' ') i++;

  // Halfmove clock
  if (fen[i] && fen[i] >= '0' && fen[i] <= '9') {
    pos->hmc = 0;
    while (fen[i] >= '0' && fen[i] <= '9') {
      pos->hmc = pos->hmc * 10 + (fen[i] - '0');
      i++;
    }
  }

  zob_rebuild(pos);
}

void pos_print(const Pos *pos) {
  const char *pieces = ".PNBRQK..pnbrqk";

  printf("\n");
  for (int rank = 7; rank >= 0; rank--) {
    printf("%d  ", rank + 1);
    for (int file = 0; file < 8; file++) {
      int sq = rank * 16 + file;
      int piece = pos->board[sq];
      printf("%c ", pieces[piece]);
    }
    printf("\n");
  }
  printf("\n   a b c d e f g h\n\n");

  const char *files = "abcdefgh";
  int wk = pos->kings[0];
  int bk = pos->kings[1];
  printf("kings: white=%c%d black=%c%d\n", files[wk & 7], (wk >> 4) + 1, files[bk & 7], (bk >> 4) + 1);

  printf("rights: ");
  if (pos->rights & RIGHTS_K) printf("K");
  if (pos->rights & RIGHTS_Q) printf("Q");
  if (pos->rights & RIGHTS_k) printf("k");
  if (pos->rights & RIGHTS_q) printf("q");
  if (!pos->rights) printf("-");
  printf("\n");

  printf("stm: %s\n", pos->stm == WHITE ? "white" : "black");
  printf("hash: %016llx\n\n", (unsigned long long)pos->hash);
}
