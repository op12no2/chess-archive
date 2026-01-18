var rand32Seed = 1234567890;

function rand32() {
  rand32Seed ^= rand32Seed << 13;
  rand32Seed ^= rand32Seed >>> 17;
  rand32Seed ^= rand32Seed << 5;
  return rand32Seed >>> 0;
}

const zobBlackLo = rand32();
const zobBlackHi = rand32();

const zobRightsLo = new Uint32Array(16);
const zobRightsHi = new Uint32Array(16);
const zobEpLo = new Uint32Array(128);
const zobEpHi = new Uint32Array(128);
const zobPiecesLo = new Array(16);
const zobPiecesHi = new Array(16);

function zobInitOnce() {

  for (var i = 0; i < 16; i++) {
    zobRightsLo[i] = rand32();
    zobRightsHi[i] = rand32();
  }

  for (var i = 0; i < 128; i++) {
    zobEpLo[i] = rand32();
    zobEpHi[i] = rand32();
  }

  for (var i = 0; i < 16; i++) {
    zobPiecesLo[i] = new Uint32Array(128);
    zobPiecesHi[i] = new Uint32Array(128);
    for (var j = 0; j < 128; j++) {
      zobPiecesLo[i][j] = rand32();
      zobPiecesHi[i][j] = rand32();
    }
  }

}

function zobRebuild(pos) {

  var lo = 0;
  var hi = 0;

  for (var rank = 0; rank < 8; rank++) {
    for (var file = 0; file < 8; file++) {
      var sq = rank * 16 + file;
      var piece = pos.board[sq];
      if (piece) {
        lo ^= zobPiecesLo[piece][sq];
        hi ^= zobPiecesHi[piece][sq];
      }
    }
  }

  if (pos.stm === BLACK) {
    lo ^= zobBlackLo;
    hi ^= zobBlackHi;
  }

  lo ^= zobRightsLo[pos.rights];
  hi ^= zobRightsHi[pos.rights];

  if (pos.ep) {
    lo ^= zobEpLo[pos.ep];
    hi ^= zobEpHi[pos.ep];
  }

  pos.hashLo = lo >>> 0;
  pos.hashHi = hi >>> 0;

}
