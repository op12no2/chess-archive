function execString (cmd) {
  const tokens = cmd.trim().split(/\s+/).filter(t => t.length > 0);
  if (tokens.length > 0) {
    execTokens(tokens);
  }
}

function execTokens(tokens) {
  switch (tokens[0]) {

    case 'ucinewgame':
    case 'u':
      newGame();
      break;

    case 'stop':
      break;
        
    case 'uci':
      uciWrite('id name Naddu betaprune');
      uciWrite('id author Colin Jenkins');

      uciWrite('uciok');
      break;

    case 'go':
    case 'g':
      tcInit(tokens);
      go();
      break;  

    case 'bf':
      bf();
      break;  

    case 'isready':
      uciWrite('readyok');  
      break;

    case 'position':
    case 'p': {
      let fen;
      let movesIndex = -1;

      if (tokens[1] === 'startpos' || tokens[1] === 's') {
        fen = STARTPOS;
        movesIndex = 2;
      }
      else if (tokens[1] === 'fen' || tokens[1] === 'f') {
        // FEN takes next 6 tokens, then check for 'moves'
        const fenParts = tokens.slice(2, 8);
        fen = fenParts.join(' ');
        movesIndex = 8;
      }

      // Look for 'moves' keyword and extract moves
      let moves = [];
      if (movesIndex >= 0 && tokens[movesIndex] === 'moves') {
        moves = tokens.slice(movesIndex + 1);
      }

      position(fen, moves);
      break;
    }
    
    case 'board':
    case 'b':
      printBoard();
      break;
   
    case 'perft':
    case 'f': {
        const depth = parseInt(tokens[1]);
        const t1 = now();
        const n = perft(depth, 0);
        let elapsed = now() - t1;
        const nps = (n/elapsed * 1000) | 0;
        elapsed |= elapsed;
        uciWrite(`nodes ${n} elapsed ${elapsed} nps ${nps}`);
        break;
      }

    case 'eval':
    case 'e':
      uciWrite(evaluate(nodes[0]));
      break;

    case 'perfttests':
    case 'pt':
      perftTests();
      break;

    case 'bench':
    case 'bn':
      bench();
      break;

    case 'evaltests':
    case 'et':
      evalTests();
      break;

    case 'quit':
    case 'q':
      uciQuit();
      break;

    default:
      uciWrite('?');  

  }
}
