// Repetition detection using flat history array
// Stores [hashLo, hashHi] pairs for each position

const REP_MAX = 1024;
const repHistory = new Uint32Array(REP_MAX * 2);
let repGamePly = 0;  // end of game history (locked after UCI position command)

function repClear() {
  repGamePly = 0;
}

function repPush(pos) {
  const idx = repGamePly * 2;
  repHistory[idx] = pos.hashLo;
  repHistory[idx + 1] = pos.hashHi;
  repGamePly++;
}

function isRepetition(pos, ply) {
  const hashLo = pos.hashLo;
  const hashHi = pos.hashHi;
  const currentPly = repGamePly + ply;

  // Only need to look back as far as the halfmove clock allows
  // (positions before last pawn move/capture can't repeat)
  const lookback = Math.min(currentPly, pos.hmc);

  // Step back by 2 (same side to move)
  // Start at currentPly - 2 (the position 2 plies ago)
  for (let i = 2; i <= lookback; i += 2) {
    const idx = (currentPly - i) * 2;
    if (repHistory[idx] === hashLo && repHistory[idx + 1] === hashHi) {
      // Found once in game history = can force 3-fold (2-fold rule)
      // Found once in search = 2-fold in search tree
      return true;
    }
  }
  return false;
}

function isFiftyMoves(pos) {
  return pos.hmc >= 100;
}

function isDraw(pos, ply) {
  return isFiftyMoves(pos) || isRepetition(pos, ply);
}

// Record position at current search ply (called at start of search node)
function repRecord(pos, ply) {
  const idx = (repGamePly + ply) * 2;
  repHistory[idx] = pos.hashLo;
  repHistory[idx + 1] = pos.hashHi;
}
