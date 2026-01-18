function moveIsProbablyLegal(node, move) {

  if (move === 0)
    return 0;
  
  const pos = node.pos;
  const board = pos.board;
  const stm = pos.stm;

  const from = (move >> 8) & 0xff;
  const to = move & 0xff;

  // from and to must be on board
  if ((from | to) & 0x88) 
    return 0;

  // must have our piece on from square
  const piece = board[from];
  if (!piece) 
    return 0;
  if ((piece & BLACK) !== stm) 
    return 0;

  // to square must be empty or enemy piece
  const target = board[to];
  if (target && (target & BLACK) === stm) 
    return 0;

  return move;
}

function formatMove(move) {

  const from = (move >> 8) & 0xff;
  const to = move & 0xff;

  const fromFile = String.fromCharCode(97 + (from & 7));
  const fromRank = String.fromCharCode(49 + (from >> 4));
  const toFile = String.fromCharCode(97 + (to & 7));
  const toRank = String.fromCharCode(49 + (to >> 4));

  let moveStr = fromFile + fromRank + toFile + toRank;

  // Add promotion piece if applicable
  if (move & MOVE_PROMO_MASK) {
    const promoType = (move & MOVE_PROMO_MASK) >> MOVE_PROMO_SHIFT;
    const promoChars = ['', '', 'n', 'b', 'r', 'q'];
    moveStr += promoChars[promoType];
  }

  return moveStr;
}
