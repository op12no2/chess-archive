const RIGHTS_MASK = new Uint8Array(128);
RIGHTS_MASK.fill(0xF);
RIGHTS_MASK[0x00] = 0xF ^ RIGHTS_Q;
RIGHTS_MASK[0x07] = 0xF ^ RIGHTS_K;
RIGHTS_MASK[0x70] = 0xF ^ RIGHTS_q;
RIGHTS_MASK[0x77] = 0xF ^ RIGHTS_k;
RIGHTS_MASK[0x04] = 0xF ^ RIGHTS_K ^ RIGHTS_Q;
RIGHTS_MASK[0x74] = 0xF ^ RIGHTS_k ^ RIGHTS_q;

function makeMove(move, pos) {

  const from = (move >> 8) & 0xff;
  const to = move & 0xff;
  const piece = pos.board[from];
  const captured = pos.board[to];
  const oldRights = pos.rights;
  const oldEp = pos.ep;

  // Update halfmove clock: reset on pawn move or capture, else increment
  if ((piece & 0x7) === PAWN || captured || (move & MOVE_FLAG_EPCAPTURE)) {
    pos.hmc = 0;
  }
  else {
    pos.hmc++;
  }

  const pieceZobLo = zobPiecesLo[piece];
  const pieceZobHi = zobPiecesHi[piece];

  var lo = pos.hashLo;
  var hi = pos.hashHi;

  // remove piece from 'from' square
  lo ^= pieceZobLo[from];
  hi ^= pieceZobHi[from];

  // remove captured piece (if any)
  if (captured) {
    lo ^= zobPiecesLo[captured][to];
    hi ^= zobPiecesHi[captured][to];
  }

  pos.board[to] = piece;
  pos.board[from] = 0;
  pos.ep = 0;

  if (move & MOVE_EXTRA_MASK) {
    if (move & MOVE_PROMO_MASK) {
      const promoPiece = pos.stm | (move & MOVE_PROMO_MASK) >> MOVE_PROMO_SHIFT;
      pos.board[to] = promoPiece;
      lo ^= zobPiecesLo[promoPiece][to];
      hi ^= zobPiecesHi[promoPiece][to];
    }

    else if (move & MOVE_FLAG_KING) {
      pos.kings[piece >> 3] = to;
      lo ^= pieceZobLo[to];
      hi ^= pieceZobHi[to];
    }

    else if (move & MOVE_FLAG_EPMAKE) {
      pos.ep = pos.stm === WHITE ? to - 16 : to + 16;
      lo ^= pieceZobLo[to];
      hi ^= pieceZobHi[to];
    }

    else if (move & MOVE_FLAG_EPCAPTURE) {
      const capSq = pos.stm === WHITE ? to - 16 : to + 16;
      const capPiece = pos.board[capSq];
      lo ^= zobPiecesLo[capPiece][capSq];
      hi ^= zobPiecesHi[capPiece][capSq];
      pos.board[capSq] = 0;
      lo ^= pieceZobLo[to];
      hi ^= pieceZobHi[to];
    }

    else if (move & MOVE_FLAG_KCASTLE) {
      pos.kings[piece >> 3] = to;
      const rook = pos.board[to + 1];
      const rookZobLo = zobPiecesLo[rook];
      const rookZobHi = zobPiecesHi[rook];
      lo ^= rookZobLo[to + 1] ^ rookZobLo[to - 1];
      hi ^= rookZobHi[to + 1] ^ rookZobHi[to - 1];
      pos.board[to - 1] = rook;
      pos.board[to + 1] = 0;
      lo ^= pieceZobLo[to];
      hi ^= pieceZobHi[to];
    }

    else if (move & MOVE_FLAG_QCASTLE) {
      pos.kings[piece >> 3] = to;
      const rook = pos.board[to - 2];
      const rookZobLo = zobPiecesLo[rook];
      const rookZobHi = zobPiecesHi[rook];
      lo ^= rookZobLo[to - 2] ^ rookZobLo[to + 1];
      hi ^= rookZobHi[to - 2] ^ rookZobHi[to + 1];
      pos.board[to + 1] = rook;
      pos.board[to - 2] = 0;
      lo ^= pieceZobLo[to];
      hi ^= pieceZobHi[to];
    }
  }
  else {
    lo ^= pieceZobLo[to];
    hi ^= pieceZobHi[to];
  }

  pos.rights &= RIGHTS_MASK[from] & RIGHTS_MASK[to];

  // update rights hash
  if (pos.rights !== oldRights) {
    lo ^= zobRightsLo[oldRights] ^ zobRightsLo[pos.rights];
    hi ^= zobRightsHi[oldRights] ^ zobRightsHi[pos.rights];
  }

  // update ep hash
  if (oldEp) {
    lo ^= zobEpLo[oldEp];
    hi ^= zobEpHi[oldEp];
  }
  if (pos.ep) {
    lo ^= zobEpLo[pos.ep];
    hi ^= zobEpHi[pos.ep];
  }

  // toggle stm
  lo ^= zobBlackLo;
  hi ^= zobBlackHi;

  pos.stm ^= BLACK;
  pos.hashLo = lo >>> 0;
  pos.hashHi = hi >>> 0;

}

function doMove(uciMove) {

  const node = nodes[0];
  const pos = node.pos;

  genMoves(node);

  for (let i = 0; i < node.numMoves; i++) {
    const move = node.moves[i];
    if (formatMove(move) === uciMove) {
      makeMove(move, pos);
      return;
    }
  }
}
