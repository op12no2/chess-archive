class TimeControl {

  constructor() {
    this.bestMove = 0;
    this.nodes = 0;
    this.maxNodes = 0;
    this.maxDepth = 0;
    this.startTime = 0;
    this.finishTime = 0;
    this.finished = 0;
  }
}

const timeControl = new TimeControl();

function tcClear() {
  const tc = timeControl;
  tc.bestMove = 0;
  tc.nodes = 0;
  tc.maxNodes = 0;
  tc.maxDepth = 0;
  tc.startTime = now() | 0;
  tc.finishTime = 0;
  tc.finished = 0;
}

function tcCheck() {
  const tc = timeControl;
  if (tc.finishTime && now() >= tc.finishTime)
    tc.finished = 1;
  else if (tc.maxNodes && tc.nodes >= tc.maxNodes)
    tc.finished = 1;
}

function tcInit(tokens) {

  tcClear();

  const tc = timeControl;

  // Parse go command parameters
  let wtime = 0;
  let btime = 0;
  let winc = 0;
  let binc = 0;
  let movestogo = 30; // Default to 30 moves if not specified
  let movetime = 0;
  let infinite = false;

  // Parse tokens
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token) {
      case 'wtime':
        wtime = parseInt(tokens[++i]) || 0;
        break;
      case 'btime':
        btime = parseInt(tokens[++i]) || 0;
        break;
      case 'winc':
        winc = parseInt(tokens[++i]) || 0;
        break;
      case 'binc':
        binc = parseInt(tokens[++i]) || 0;
        break;
      case 'movestogo':
        movestogo = Math.max(2,parseInt(tokens[++i]) || 30);
        break;
      case 'depth':
      case 'd':
        tc.maxDepth = parseInt(tokens[++i]) || 0;
        break;
      case 'nodes':
      case 'n':
        tc.maxNodes = parseInt(tokens[++i]) || 0;
        break;
      case 'movetime':
      case 'm':
        movetime = parseInt(tokens[++i]) || 0;
        break;
      case 'infinite':
      case 'i':
        infinite = true;
        break;
    }
  }

  // Calculate finish time based on time control
  if (movetime > 0) {
    // Fixed time per move
    tc.finishTime = tc.startTime + movetime;
  }
  else if (!infinite && (wtime > 0 || btime > 0)) {
    // Calculate time allocation based on side to move
    const pos = nodes[0].pos;
    const isWhite = pos.stm === WHITE;
    const timeLeft = isWhite ? wtime : btime;
    const increment = isWhite ? winc : binc;

    // Time allocation: timeLeft / movestogo + increment / 2
    const allocatedTime = (timeLeft / movestogo) + (increment / 2);
    tc.finishTime = tc.startTime + allocatedTime;
  }

  // Set default max depth if not specified
  if (tc.maxDepth <= 0)
    tc.maxDepth = MAX_PLY;
  else if (tc.maxDepth > MAX_PLY)
    tc.maxDepth = MAX_PLY;

}
