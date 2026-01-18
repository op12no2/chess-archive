function newGame() {
  ttClear();
  repClear();
}

function go() {
  
  const tc = timeControl;
  
  for (let d = 1; d <= tc.maxDepth; d++) {
    const bm = tc.bestMove;
    const score = search(d, 0, -Infinity, Infinity);
    if (tc.finished) {
      if (bm)
        tc.bestMove = bm;  
      break;
    }
    const nps = (1000 * tc.nodes / (now() - tc.startTime)) | 0;
    uciWrite(`info depth ${d} score cp ${score} nodes ${tc.nodes} nps ${nps} pv ${formatMove(tc.bestMove)}`);
  }
  
  uciWrite(`bestmove ${formatMove(tc.bestMove)}`);
}

const searchNodes = Array(MAX_PLY);

function bf() {

  newGame();
  position(STARTPOS);
  
  const depth = 9;
  let totalBf = 0;
  
  for (let d = 1; d <= depth; d++) {
    tcClear();
    const score = search(d, 0, -Infinity, Infinity);
    const nodes = timeControl.nodes;
    searchNodes[d] = nodes;
    if (d > 1) {
      const thisBf = searchNodes[d] / searchNodes[d-1];
      totalBf += thisBf;
      const meanBf = totalBf / (d - 1);
      uciWrite(`depth ${d} nodes ${searchNodes[d]} bf ${thisBf.toFixed(1)} mean ${meanBf.toFixed(1)}`);
    }  
    else
      uciWrite(`depth ${d} nodes ${searchNodes[d]}`);
  }

}

