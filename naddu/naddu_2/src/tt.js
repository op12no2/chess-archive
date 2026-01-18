const TT_EXACT = 1;
const TT_ALPHA = 2;
const TT_BETA = 3;
const TT_MATE_BOUND = 9900;
const TT_SIZE = 1 << 20;
const TT_MASK = TT_SIZE - 1;

const ttHashLo = new Uint32Array(TT_SIZE);
const ttHashHi = new Uint32Array(TT_SIZE);
const ttMove = new Uint32Array(TT_SIZE);
const ttType = new Uint8Array(TT_SIZE);
const ttScore = new Int16Array(TT_SIZE);
const ttDepth = new Uint8Array(TT_SIZE);

const ttStats = {hits: 0};

function ttInitOnce() {
}

function ttClear() {
  ttType.fill(0);
}

function ttPut(pos, type, depth, score, move) {

  const index = pos.hashLo & TT_MASK;

  ttHashLo[index] = pos.hashLo;
  ttHashHi[index] = pos.hashHi;
  ttMove[index] = move;
  ttType[index] = type;
  ttScore[index] = score;
  ttDepth[index] = depth;

}

function ttGet(pos) {

  const hashLo = pos.hashLo;
  const hashHi = pos.hashHi;
  const index = hashLo & TT_MASK;

  if (ttHashLo[index] === hashLo && ttHashHi[index] === hashHi && ttType[index]) {
    return index;
  }

  return -1;
}

function ttGetMove(index) {
  return ttMove[index];
}

function ttGetType(index) {
  return ttType[index];
}

function ttGetScore(index) {
  return ttScore[index];
}

function ttGetDepth(index) {
  return ttDepth[index];
}

function ttScoreToTT(score, ply) {
  if (score > TT_MATE_BOUND)
    return score + ply;
  if (score < -TT_MATE_BOUND)
    return score - ply;
  return score;
}

function ttScoreFromTT(score, ply) {
  if (score > TT_MATE_BOUND)
    return score - ply;
  if (score < -TT_MATE_BOUND)
    return score + ply;
  return score;
}
