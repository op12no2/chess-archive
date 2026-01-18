
const pieceHistory = [];
const HISTORY_MAX = 32767 - MAX_PLY * MAX_PLY;

function historyInitOnce() {
  for (let i = 0; i < 16; i++) {
    pieceHistory[i] = new Int16Array(128);
  }
}

function historyClear() {
  for (let i = 0; i < 16; i++) {
    pieceHistory[i].fill(0);
  }
}

function historyHalve() {
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 128; j++) {
      pieceHistory[i][j] = pieceHistory[i][j] >> 1;
    }
  }
}

function addHistory(pos, move, depth) {
  if (move & MOVE_FLAG_CAPTURE)
    return;
  const from = (move >> 8) & 0xff;
  const to = move & 0xff;
  const piece = pos.board[from];
  const bonus = depth * depth;
  const current = pieceHistory[piece][to];
  const update = bonus - ((current * bonus) / HISTORY_MAX) | 0;
  const newVal = current + update;
  if (newVal >= HISTORY_MAX) {
    historyHalve();
    pieceHistory[piece][to] += (update / 2) | 0;
  }
  else {
    pieceHistory[piece][to] = newVal;
  }
}
