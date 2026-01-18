function isAttacked(pos, sq, byColor) {
  const board = pos.board;

  // pawns
  const pawnDir = byColor === WHITE ? -16 : 16;
  const pawn = PAWN | byColor;
  const p1 = sq + pawnDir - 1;
  if (p1 >= 0 && !(p1 & 0x88) && board[p1] === pawn) return 1;
  const p2 = sq + pawnDir + 1;
  if (p2 >= 0 && !(p2 & 0x88) && board[p2] === pawn) return 1;

  // knights
  const knight = KNIGHT | byColor;
  for (let i = 0; i < 8; i++) {
    const to = sq + KNIGHT_OFFSETS[i];
    if (!(to & 0x88) && board[to] === knight) return 1;
  }

  // king
  const king = KING | byColor;
  for (let i = 0; i < 8; i++) {
    const to = sq + KING_OFFSETS[i];
    if (!(to & 0x88) && board[to] === king) return 1;
  }

  // bishops/queens (diagonals)
  const bishop = BISHOP | byColor;
  const queen = QUEEN | byColor;
  for (let i = 0; i < 4; i++) {
    const off = BISHOP_OFFSETS[i];
    let to = sq + off;
    while (to >= 0 && !(to & 0x88)) {
      const piece = board[to];
      if (piece) {
        if (piece === bishop || piece === queen) return 1;
        break;
      }
      to += off;
    }
  }

  // rooks/queens (straights)
  const rook = ROOK | byColor;
  for (let i = 0; i < 4; i++) {
    const off = ROOK_OFFSETS[i];
    let to = sq + off;
    while (to >= 0 && !(to & 0x88)) {
      const piece = board[to];
      if (piece) {
        if (piece === rook || piece === queen) return 1;
        break;
      }
      to += off;
    }
  }

  return 0;
}
