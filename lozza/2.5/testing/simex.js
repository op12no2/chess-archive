//
// Copy lozza.js above here.
//

var fs       = lozza.uci.nodefs;
var uci      = lozza.uci;
var board    = lozza.board;
var epdfile  = "c:/projects/chessdata/simex.epd";
var moves    = '';

const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream(epdfile),
    output: process.stdout,
    crlfDelay: Infinity,
    terminal: false
});

rl.on('line', function (line) {

  line = line.replace(/(\r\n|\n|\r)/gm,'');

  var parts = line.split(' ');

  uci.spec.board    = parts[0];
  uci.spec.turn     = parts[1];
  uci.spec.rights   = parts[2];
  uci.spec.ep       = parts[3];
  uci.spec.fmc      = 0;
  uci.spec.hmc      = 0;
  uci.spec.id       = 'id';
  uci.spec.moves    = [];

  lozza.position();

  lozza.stats.init();

  uci.spec.depth     = 1;
  uci.spec.moveTime  = 0;
  uci.spec.maxNodes  = 0;
  uci.spec.wTime     = 0;
  uci.spec.bTime     = 0;
  uci.spec.wInc      = 0;
  uci.spec.bInc      = 0;
  uci.spec.movesToGo = 0;

  lozza.go();

  moves += ' ' + board.formatMove(lozza.stats.bestMove,UCI_FMT);
});

rl.on('close', function(){
  fs.writeFileSync('lozza2dot0simex.txt',moves.trim());
  console.log(moves);
  process.exit();
});

