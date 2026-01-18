#include "iterate.h"
#include "gen.h"
#include "history.h"

static void rank_captures(Node *node) {
  Pos *pos = &node->pos;
  uint8_t *board = pos->board;
  uint32_t *moves = node->moves;
  int32_t *ranks = node->ranks;

  for (int i = 0; i < node->num_moves; i++) {
    uint32_t move = moves[i];
    int to = MOVE_TO(move);
    int victim = (move & MOVE_FLAG_EPCAPTURE) ? PAWN : board[to] & 7;
    int attacker = board[MOVE_FROM(move)] & 7;
    ranks[i] = victim * 16 - attacker;
  }
}

static void rank_quiets(Node *node) {
  Pos *pos = &node->pos;
  uint8_t *board = pos->board;
  uint32_t *moves = node->moves;
  int32_t *ranks = node->ranks;

  for (int i = 0; i < node->num_moves; i++) {
    uint32_t move = moves[i];
    if (move == node->killer) {
      ranks[i] = HISTORY_MAX + 1;
    }
    else {
      int from = MOVE_FROM(move);
      int to = MOVE_TO(move);
      int piece = board[from];
      ranks[i] = piece_history[piece][to];
    }
  }
}

static uint32_t pick_best(Node *node) {
  uint32_t *moves = node->moves;
  int32_t *ranks = node->ranks;
  int best_idx = node->next_move;
  int32_t best_rank = ranks[best_idx];

  for (int i = node->next_move + 1; i < node->num_moves; i++) {
    if (ranks[i] > best_rank) {
      best_rank = ranks[i];
      best_idx = i;
    }
  }

  int idx = node->next_move;
  if (best_idx != idx) {
    uint32_t tmp_move = moves[idx];
    int32_t tmp_rank = ranks[idx];
    moves[idx] = moves[best_idx];
    ranks[idx] = ranks[best_idx];
    moves[best_idx] = tmp_move;
    ranks[best_idx] = tmp_rank;
  }

  node->next_move++;
  return moves[idx];
}

void init_next_move(Node *node, uint32_t tt_move) {
  node->tt_move = tt_move;
  node->stage = tt_move ? STAGE_TT : STAGE_GEN_CAPTURE;
  node->num_moves = 0;
  node->next_move = 0;
}

void init_next_move_qs(Node *node, uint32_t tt_move) {
  node->tt_move = tt_move;
  node->stage = tt_move ? STAGE_TT : STAGE_GEN_CAPTURE;
  node->num_moves = 0;
  node->next_move = 0;
}

uint32_t get_next_move(Node *node) {
  uint32_t tt_move = node->tt_move;

  while (1) {
    switch (node->stage) {
      case STAGE_TT:
        node->stage = STAGE_GEN_CAPTURE;
        return tt_move;

      case STAGE_GEN_CAPTURE:
        node->num_moves = 0;
        gen_captures(node);
        rank_captures(node);
        node->next_move = 0;
        node->stage = STAGE_CAPTURE;
        continue;

      case STAGE_CAPTURE:
        if (node->next_move >= node->num_moves) {
          node->stage = STAGE_GEN_QUIET;
          continue;
        }
        {
          uint32_t move = pick_best(node);
          if (move == tt_move)
            continue;
          return move;
        }

      case STAGE_GEN_QUIET:
        node->num_moves = 0;
        gen_quiets(node);
        rank_quiets(node);
        node->next_move = 0;
        node->stage = STAGE_QUIET;
        continue;

      case STAGE_QUIET:
        if (node->next_move >= node->num_moves) {
          node->stage = STAGE_DONE;
          return 0;
        }
        {
          uint32_t move = pick_best(node);
          if (move == tt_move)
            continue;
          return move;
        }

      case STAGE_DONE:
        return 0;
    }
  }
}

uint32_t get_next_move_qs(Node *node) {
  uint32_t tt_move = node->tt_move;

  while (1) {
    switch (node->stage) {
      case STAGE_TT:
        node->stage = STAGE_GEN_CAPTURE;
        return tt_move;

      case STAGE_GEN_CAPTURE:
        node->num_moves = 0;
        gen_captures(node);
        rank_captures(node);
        node->next_move = 0;
        node->stage = STAGE_CAPTURE;
        continue;

      case STAGE_CAPTURE:
        if (node->next_move >= node->num_moves) {
          node->stage = STAGE_DONE;
          return 0;
        }
        {
          uint32_t move = pick_best(node);
          if (move == tt_move)
            continue;
          return move;
        }

      case STAGE_DONE:
        return 0;
    }
  }
}
