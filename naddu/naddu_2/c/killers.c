#include "killers.h"

void killers_clear(void) {
  for (int i = 0; i < MAX_PLY; i++) {
    nodes[i].killer = 0;
  }
}

void killer_set(Node *node, uint32_t move) {
  if (move & MOVE_FLAG_CAPTURE)
    return;
  node->killer = move;
}
