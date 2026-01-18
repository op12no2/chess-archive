function qsearch(ply, alpha, beta) {

  if (ply === MAX_PLY - 1)
    return evaluate(nodes[ply]);

  const tc = timeControl;

  tcCheck();
  if (tc.finished)
    return 0;

  tc.nodes++;

  const node = nodes[ply];
  const pos = node.pos;
  
  // check tt
  const ttIndex = ttGet(pos);
  if (ttIndex >= 0) {
    const score = ttScoreFromTT(ttGetScore(ttIndex), ply);
    const type = ttGetType(ttIndex);
    if (type === TT_EXACT || (type === TT_BETA && score >= beta) || (type === TT_ALPHA && score <= alpha)) {
      return score;
    }
  }

  // stand pat ?
  const standPat = evaluate(node);
  if (node.draw)
    return 0;
  if (standPat >= beta)
    return standPat;
  if (standPat > alpha)
    alpha = standPat;

  const nextNode = nodes[ply + 1];
  const nextPos = nextNode.pos;
  const stmi = pos.stm >> 3;

  const ttMove = ttIndex >= 0 && (ttGetMove(ttIndex) & MOVE_FLAG_CAPTURE) ? moveIsProbablyLegal(node, ttGetMove(ttIndex)) : 0;

  initNextMoveQS(node, ttMove);

  let move;

  while ((move = getNextMoveQS(node))) {

    posSet(nextPos, pos);
    makeMove(move, nextPos);

    if (isAttacked(nextPos, nextPos.kings[stmi], nextPos.stm))
      continue;

    const score = -qsearch(ply + 1, -beta, -alpha);

    if (tc.finished)
      return 0;

    if (score >= beta)
      return score;

    if (score > alpha)
      alpha = score;
  }

  return alpha;

}
