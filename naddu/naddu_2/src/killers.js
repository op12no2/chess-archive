
function killersClear() {
  for (let i = 0; i < MAX_PLY; i++) {
    nodes[i].killer = 0;
  }
}

function killerSet(node, move) {
  if (move & MOVE_FLAG_CAPTURE)
    return;
  node.killer = move;
}

