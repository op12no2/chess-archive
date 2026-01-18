// uses the move iterator and tt to exercise them.
// it also compares the incremental hash to a rebuilt hash

const TT_PERFT = 4;

function perft (depth, ply) {

  if (ply === 0)
    ttClear();

  if (depth === 0)
    return 1;

  const node = nodes[ply];
  const nextNode = nodes[ply+1];
  const pos = node.pos;
  const nextPos = nextNode.pos;
  const stmi = pos.stm >> 3;

  // check incremental hash matches rebuilt hash
  const hashLo = pos.hashLo;
  const hashHi = pos.hashHi;
  zobRebuild(pos)
  if (hashLo != pos.hashLo)
    console.log('*********** lo', hashLo, pos.hashLo);
  if (hashHi != pos.hashHi)
    console.log('************hi', hashHi, pos.hashHi);

  // probe tt
  const ttIndex = ttGet(pos);
  if (ttIndex >= 0 && ttGetType(ttIndex) === TT_PERFT && ttGetDepth(ttIndex) === depth) {
    return ttGetMove(ttIndex); // node count stored in move field
  }

  let tot = 0;

  initNextMove(node, 0);

  let move;

  while ((move = getNextMove(node))) {
    posSet(nextPos, pos);
    makeMove(move, nextPos);
    if (isAttacked(nextPos, nextPos.kings[stmi], nextPos.stm))
      continue;
    tot += perft(depth-1, ply+1);
  }

  if (depth > 2) // false positives otherwise
    ttPut(pos, TT_PERFT, depth, 0, tot);

  return tot;

}
