#include <string.h>
#include "node.h"

Node nodes[MAX_PLY];

void node_init(void) {
  memset(nodes, 0, sizeof(nodes));
}
