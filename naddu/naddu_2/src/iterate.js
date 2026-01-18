
const STAGE_TT          = 0;
const STAGE_GEN_CAPTURE = 1;
const STAGE_CAPTURE     = 2;
const STAGE_GEN_QUIET   = 3;
const STAGE_QUIET       = 4;
const STAGE_DONE        = 5;

function rankCaptures(node) {
  const pos = node.pos;
  const board = pos.board;
  const moves = node.moves;
  const ranks = node.ranks;
  for (let i = 0; i < node.numMoves; i++) {
    const move = moves[i];
    const to = move & 0xff;
    const victim = (move & MOVE_FLAG_EPCAPTURE) ? PAWN : board[to] & 7;
    const attacker = board[(move >> 8) & 0xff] & 7;
    ranks[i] = victim * 16 - attacker;
  }
}

function rankQuiets(node) {
  const pos = node.pos;
  const board = pos.board;
  const moves = node.moves;
  const ranks = node.ranks;
  for (let i = 0; i < node.numMoves; i++) {
    const move = moves[i];
    if (move === node.killer) {
      ranks[i] = HISTORY_MAX + 1;
    }
    else {
      const from = (move >> 8) & 0xff;
      const to = move & 0xff;
      const piece = board[from];
      ranks[i] = pieceHistory[piece][to];
    }   
  }
}

function initNextMove(node, ttMove) {
  node.ttMove = ttMove;
  node.stage = ttMove ? STAGE_TT : STAGE_GEN_CAPTURE;
  node.numMoves = 0;
  node.nextMove = 0;
}

function initNextMoveQS(node, ttMove) {
  node.ttMove = ttMove;
  node.stage = ttMove ? STAGE_TT : STAGE_GEN_CAPTURE;
  node.numMoves = 0;
  node.nextMove = 0;
}

function pickBest(node) {
  const moves = node.moves;
  const ranks = node.ranks;
  let bestIdx = node.nextMove;
  let bestRank = ranks[bestIdx];
  for (let i = node.nextMove + 1; i < node.numMoves; i++) {
    if (ranks[i] > bestRank) {
      bestRank = ranks[i];
      bestIdx = i;
    }
  }
  const idx = node.nextMove;
  if (bestIdx !== idx) {
    const tmpMove = moves[idx];
    const tmpRank = ranks[idx];
    moves[idx] = moves[bestIdx];
    ranks[idx] = ranks[bestIdx];
    moves[bestIdx] = tmpMove;
    ranks[bestIdx] = tmpRank;
  }
  node.nextMove++;
  return moves[idx];
}

function getNextMove(node) {
  const ttMove = node.ttMove;
  while (true) {
    switch (node.stage) {
      case STAGE_TT:
        node.stage = STAGE_GEN_CAPTURE;
        return ttMove;

      case STAGE_GEN_CAPTURE:
        node.numMoves = 0;
        genCaptures(node);
        rankCaptures(node);
        node.nextMove = 0;
        node.stage = STAGE_CAPTURE;
        continue;

      case STAGE_CAPTURE:
        if (node.nextMove >= node.numMoves) {
          node.stage = STAGE_GEN_QUIET;
          continue;
        }
        {
          const move = pickBest(node);
          if (move === ttMove)
            continue;
          return move;
        }

      case STAGE_GEN_QUIET:
        node.numMoves = 0;
        genQuiets(node);
        rankQuiets(node);
        node.nextMove = 0;
        node.stage = STAGE_QUIET;
        continue;

      case STAGE_QUIET:
        if (node.nextMove >= node.numMoves) {
          node.stage = STAGE_DONE;
          return 0;
        }
        {
          const move = pickBest(node);
          if (move === ttMove)
            continue;
          return move;
        }

      case STAGE_DONE:
        return 0;
    }
  }
}

function getNextMoveQS(node) {
  const ttMove = node.ttMove;
  while (true) {
    switch (node.stage) {
      case STAGE_TT:
        node.stage = STAGE_GEN_CAPTURE;
        return ttMove;

      case STAGE_GEN_CAPTURE:
        node.numMoves = 0;
        genCaptures(node);
        rankCaptures(node);
        node.nextMove = 0;
        node.stage = STAGE_CAPTURE;
        continue;

      case STAGE_CAPTURE:
        if (node.nextMove >= node.numMoves) {
          node.stage = STAGE_DONE;
          return 0;
        }
        {
          const move = pickBest(node);
          if (move === ttMove)
            continue;
          return move;
        }

      case STAGE_DONE:
        return 0;
    }
  }
}
