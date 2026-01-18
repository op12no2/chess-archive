
const MATE = 10000;

function search(depth, ply, alpha, beta) {

  if (ply === MAX_PLY - 1)
    return evaluate(nodes[ply]);

  const tc = timeControl;
  
  tcCheck();
  if (tc.finished)
    return 0;
  
  const node = nodes[ply];
  const pos = node.pos;
  const stmi = pos.stm >> 3;
  const nstm = pos.stm ^ BLACK;
  const inCheck = isAttacked(pos, pos.kings[stmi], nstm);

  if (!inCheck && depth <= 0)
    return qsearch(ply, alpha, beta);

  depth = Math.max(depth, 0);

  tc.nodes++;

  const nextNode = nodes[ply + 1];
  const nextPos = nextNode.pos;
  const oAlpha = alpha;
  const isRoot = ply === 0;
  const isPV = isRoot || (beta - alpha !== 1);
  
  // record position for repetition detection
  repRecord(pos, ply);

  // check tt
  const ttIndex = ttGet(pos);
  if (!isRoot && ttIndex >= 0 && ttGetDepth(ttIndex) >= depth) {
    const score = ttScoreFromTT(ttGetScore(ttIndex), ply);
    const type = ttGetType(ttIndex);
    if (type === TT_EXACT || (type === TT_BETA && score >= beta) || (type === TT_ALPHA && score <= alpha)) {
      return score;
    }
  }
  
  // check for draws
  const ev = evaluate(node); // sets node.draw
  if (!isRoot && (node.draw || isDraw(pos, ply)))
    return 0;

  // beta pruning
  if (!isPV && !inCheck && depth <=  8 && beta < TT_MATE_BOUND && (ev - depth * 100) >= beta)
    return ev;

  const ttMove = ttIndex >= 0 ? moveIsProbablyLegal(node, ttGetMove(ttIndex)) : 0;

  initNextMove(node, ttMove);

  let bestScore = -Infinity;
  let bestMove = 0;
  let numMoves = 0;
  let move;

  while ((move = getNextMove(node))) {

    posSet(nextPos, pos);
    makeMove(move, nextPos);

    if (isAttacked(nextPos, nextPos.kings[stmi], nstm))
      continue;

    numMoves++;

    let score;

    if (numMoves === 1) {
      score = -search(depth - 1, ply + 1, -beta, -alpha);
    }
    else {
      score = -search(depth - 1, ply + 1, -alpha - 1, -alpha);
      if (tc.finished === 0 && score > alpha && score < beta) {
        score = -search(depth - 1, ply + 1, -beta, -alpha);
      }
    }

    if (tc.finished)
      return 0;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    if (bestScore > alpha) {
      if (isRoot) {
        tc.bestMove = bestMove;
      }
      alpha = bestScore;
    }

    if (alpha >= beta) {
      addHistory(pos, bestMove, depth);
      killerSet(node, bestMove);
      ttPut(pos, TT_BETA, depth, ttScoreToTT(bestScore, ply), bestMove);
      return bestScore;
    }
  }

  if (numMoves === 0)
    return inCheck ? -MATE + ply : 0;

  ttPut(pos, bestScore > oAlpha ? TT_EXACT : TT_ALPHA, depth, ttScoreToTT(bestScore, ply), bestMove);

  return bestScore;

}
