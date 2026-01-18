//
// Copy lozza.js above here.
// Adds an evaluation to an EPD file. Redirect to use.
//

RELEASE = 0;
SILENT = 1;

//{{{  lozza globals

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

//}}}

//{{{  get the epds
//
// quiet-labeled.epd
// rnb1kbnr/pp1pppp1/7p/2q5/5P2/N1P1P3/P2P2PP/R1BQKBNR w KQkq - c9 "1/2-1/2"
// 0                                                   1 2    3 4  5

var data  = fs.readFileSync('data/quiet-labeled.epd', 'utf8');
var lines = data.split('\n');
var epds  = [];

data = '';  //release.

for (var i=0; i < lines.length; i++) {

  var line = lines[i];

  line = line.replace(/(\r\n|\n|\r)/gm,'');
  line = line.trim();

  if (!line)
    continue;

  var parts = line.split(' ');

  epds.push({eval:   0,
             board:  parts[0],
             turn:   parts[1],
             rights: parts[2],
             ep:     parts[3],
             prob:   parts[5]});
}

lines = []; // release

//}}}
//{{{  evaluate

lozza.newGameInit();

for (var i=0; i < epds.length; i++) {

  var epd = epds[i];

  uci.spec.board    = epd.board;
  uci.spec.turn     = epd.turn;
  uci.spec.rights   = epd.rights;
  uci.spec.ep       = epd.ep;
  uci.spec.fmc      = '0';
  uci.spec.hmc      = '1';
  uci.spec.id       = 'id' + i;
  uci.spec.moves    = [];

  lozza.position();

  var e = board.evaluate(board.turn);
  if (board.turn == BLACK)
    e = -e;

  console.log(epd.board,epd.turn,epd.rights,epd.ep,epd.prob,e);
}

//}}}

process.exit();

