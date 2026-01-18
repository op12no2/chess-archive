//
// Copy dev lozza.js above here.
//

RELEASE = 0;

var DOSEARCH    = 0;
var SEARCHDEPTH = 3;

//{{{  lozza globals

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

//}}}

//{{{  get the epds

var data  = fs.readFileSync('data/quiet-labeled.epd', 'utf8');
var lines = data.split('\n');
var epds  = [];

data = '';  //release.

var num = lines.length;

for (var i=0; i < num; i++) {

  if (i % 10000 == 0)
    process.stdout.write(i+'\r');

  var line = lines[i];

  line = line.replace(/(\r\n|\n|\r)/gm,'');
  line = line.replace(/;/g,'');
  line = line.replace(/=/g,' ');
  line = line.trim();

  if (!line)
    continue;

  var parts = line.split(' ');

  epds.push({board:  parts[0],
             turn:   parts[1],
             rights: parts[2],
             ep:     parts[3]});
}

lines = []; // release

console.log('positions =',epds.length);

//}}}

lozza.newGameInit();

for (var i=0; i < epds.length; i++) {

  if (i % 100 == 0)
    process.stdout.write(i+'\r');

  var epd = epds[i];

  //console.log(i,epd.board,epd.turn)

  epd.ep = '-';

  //{{{  get eval and score
  
  if (DOSEARCH) {
    lozza.newGameInit();
  }
  
  uci.spec.board    = epd.board;
  uci.spec.turn     = epd.turn;
  uci.spec.rights   = epd.rights;
  uci.spec.ep       = epd.ep;
  uci.spec.fmc      = '0';
  uci.spec.hmc      = '0';
  uci.spec.id       = 'id' + i;
  uci.spec.moves    = [];
  
  lozza.position();
  
  var e = board.evaluate(board.turn);
  
  if (DOSEARCH) {
    var s = lozza.search(lozza.rootNode,SEARCHDEPTH,board.turn,-INFINITY,INFINITY);
  }
  
  //}}}
  //{{{  flip
  
  for (var j=0; j<epd.board.length; j++) {
  
    if (epd.board[j] == 'p') epd.board[j] = 'P';
    if (epd.board[j] == 'n') epd.board[j] = 'N';
    if (epd.board[j] == 'b') epd.board[j] = 'B';
    if (epd.board[j] == 'r') epd.board[j] = 'R';
    if (epd.board[j] == 'q') epd.board[j] = 'Q';
    if (epd.board[j] == 'k') epd.board[j] = 'K';
  
    if (epd.board[j] == 'P') epd.board[j] = 'p';
    if (epd.board[j] == 'N') epd.board[j] = 'n';
    if (epd.board[j] == 'B') epd.board[j] = 'b';
    if (epd.board[j] == 'R') epd.board[j] = 'r';
    if (epd.board[j] == 'Q') epd.board[j] = 'q';
    if (epd.board[j] == 'K') epd.board[j] = 'k';
  
    if (epd.board.turn == 'w') board.turn = 'b';
    if (epd.board.turn == 'b') board.turn = 'w';
  }
  
  //}}}
  //{{{  get flipped eval and score
  
  if (DOSEARCH) {
    lozza.newGameInit();
  }
  
  uci.spec.board    = epd.board;
  uci.spec.turn     = epd.turn;
  uci.spec.rights   = epd.rights;
  uci.spec.ep       = epd.ep;
  uci.spec.fmc      = '0';
  uci.spec.hmc      = '0';
  uci.spec.id       = 'id' + i;
  uci.spec.moves    = [];
  
  lozza.position();
  
  var ef = board.evaluate(board.turn);
  
  if (DOSEARCH) {
    var sf = lozza.search(lozza.rootNode,SEARCHDEPTH,board.turn,-INFINITY,INFINITY);
  }
  
  //}}}
  //{{{  check
  
  //console.log(e,ef,'                   ');
  
  if (e != ef) {
    console.log('eval mismatch');
    console.log(e, ef, epd.board, epd.turn, epd.rights, epd.ep);
    process.exit();
  }
  
  if (DOSEARCH && s != sf) {
    console.log('search mismatch');
    console.log(s, sf, epd.board, epd.turn, epd.rights, epd.ep);
    process.exit();
  }
  
  //}}}
}

console.log('yay, no differences');

process.exit();

