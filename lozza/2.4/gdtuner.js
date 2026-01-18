//
// Copy dev lozza.js above here.
//

lozza.newGameInit();

zeroparams();  // CHECK!

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

var epds   = [];
var params = [];

var gK             = 3.17;
var gPrefix        = 'data_min_';
var gSuffix        = '_sf';
var gNumFiles      = 1;              // first file is <gPrefix>0<gSuffix>.epd etc.
var gUseScore      = true;           // train against sigmoid(score) not sigmoid (wdl).
var gWDLIndex      = 4;              // or the score if gUseScore is set.
var gBatchSize     = 10000;
var gLearningRate  = 0.1;
var gResetAdagrad  = false;
var gOutFile       = 'gdtuner.txt';
var gErrStep       = 10;             // update results and get loss rate.
var gMaxEpochs     = 2000;

//{{{  functions

//{{{  getprob

function getprob (r) {
  if (r == '1/2-1/2')
    return 0.5;
  else if (r == '1-0')
    return 1.0;
  else if (r == '0-1')
    return 0.0;
  else if (r == '"1/2-1/2"')
    return 0.5;
  else if (r == '"1-0"')
    return 1.0;
  else if (r == '"0-1"')
    return 0.0;
  else
    console.log('unknown result',r);
}

//}}}
//{{{  is

function is (obj,sq) {
  return (board.b[sq] == obj) | 0;
}

//}}}
//{{{  findK

function findK () {

  console.log('computing k');

  var min  = INFINITY;
  var step = 1.0;
  var x    = 1.0;
  var err  = 0;
  var dp   = 4;

  while (dp) {
    gK = x;
    err = calcErr();
    if (err <  min) {
      min = err;
      x += step;
    }
    else {
      console.log(gK-step,err,step);
      dp--;
      step = -step / 10.0;
      x += step;
      min = INFINITY;
    }
  }
}

//}}}
//{{{  addp

function addp (s,a,i,coeff) {
  params.push({s: s, v: a[i], a: a, i: i, coeff: coeff, gr: 0, ag: 0});
}

//}}}
//{{{  myround

function myround(x) {
  return Math.sign(x) * Math.round(Math.abs(x));
}

//}}}
//{{{  wbmap

function wbmap (sq) {
  var m = (143-sq)/12|0;
  return 12*m + sq%12;
}

//}}}
//{{{  sigmoid

function sigmoid (x) {
  return 1.0 / (1.0 + Math.exp(-gK*x/400.0));
}

//}}}
//{{{  calcErr

function calcErr () {

  //console.log('calc err in');

  var err = 0;
  var num = Vtotal;

  for (var i=0; i < num; i++) {

    var vi  = Vindex(i);
    var epd = epds[vi];

    uci.spec.board    = epd.board;
    uci.spec.turn     = epd.turn;
    uci.spec.rights   = epd.rights;
    uci.spec.ep       = epd.ep;
    uci.spec.fmc      = 0;
    uci.spec.hmc      = 0;
    uci.spec.id       = '';
    uci.spec.moves    = [];

    lozza.position();

    var pr = epd.prob;
    var ev = board.evaluate(board.turn);

    if (board.turn == BLACK)
      ev = -ev;               // undo negamax.

    var sg = sigmoid(ev);

    if (isNaN(ev) || isNaN(pr) || isNaN(sg) || sg > 1.0 || pr > 1.0 || sg < 0.0 || pr < 0.0) {
      console.log('nan eek',pr,sg,ev);
      process.exit();
    }

    err += (pr-sg) * (pr-sg);
  }

  //console.log('calc err out');

  return err / num;
}

//}}}
//{{{  zeroa

function zeroa (a,s) {

  for (var i=0; i < a.length; i++)
    a[i] = 0;
}

//}}}
//{{{  loga

function loga (p,s) {

  var a = Array(p.length);

  for (var i=0; i < p.length; i++)
    a[i] = myround(p[i]) | 0;

  return 'const ' + s + ' = [' + a.toString() + '];\r\n';
}

//}}}
//{{{  logpst

function logpst (p,s) {

  //return loga(p,s);

  var a = Array(p.length);

  for (var i=0; i < p.length; i++)
    a[i] = myround(p[i]) | 0;

  var o = 'const ';

  o = o + s + ' = [';

  for (var i=0; i < 144; i++) {
    if ((i % 12) == 0)
      o = o + '\r\n  ';
    o = o + a[i].toString().padStart(4,' ');
    if (i < 143)
      o = o + ', ';
  }

  o = o + '\r\n];\r\n';

  return o;
}

//}}}
//{{{  saveparams

var lastOut = '';

function saveparams (err, epochs) {

  var d    = new Date();
  var out1 = '//{{{  ' + BUILD + ' tuned feature weights\r\n';

  out1 += '//';
  out1 += '\r\n';
  out1 += '// prefix = ' + gPrefix;
  out1 += '\r\n';
  out1 += '// suffix = ' + gSuffix;
  out1 += '\r\n';
  out1 += '// num files = ' + gNumFiles;
  out1 += '\r\n';
  out1 += '// use score = ' + gUseScore;
  out1 += '\r\n';
  out1 += '// wdl index = ' + gWDLIndex;
  out1 += '\r\n';
  out1 += '// num positions = ' + Vtotal;
  out1 += '\r\n';
  out1 += '// num features = ' + params.length;
  out1 += '\r\n';
  out1 += '// batch size = ' + gBatchSize;
  out1 += '\r\n';
  out1 += '// num batches = ' + (Vtotal/gBatchSize|0);
  out1 += '\r\n';
  out1 += '// learning rate = ' + gLearningRate;
  out1 += '\r\n';
  out1 += '// report rate = ' + gErrStep;
  out1 += '\r\n';
  out1 += '// k = ' + gK;
  out1 += '\r\n';
  out1 += '// reset adagrad = ' + gResetAdagrad;
  out1 += '\r\n';
  out1 += '// loss = ' + err;
  out1 += '\r\n';
  out1 += '// epochs = ' + epochs;
  out1 += '\r\n';
  out1 += '// last update = ' + d;
  out1 += '\r\n';
  out1 += '//';
  out1 += '\r\n\r\n';

  var out = '';

  out += loga(VALUE_VECTOR,     'VALUE_VECTOR   ');

  out += logpst(WPAWN_PSTS,     'WPAWN_PSTS     ');
  out += logpst(WPAWN_PSTE,     'WPAWN_PSTE     ');
  out += logpst(WKNIGHT_PSTS,   'WKNIGHT_PSTS   ');
  out += logpst(WKNIGHT_PSTE,   'WKNIGHT_PSTE   ');
  out += logpst(WBISHOP_PSTS,   'WBISHOP_PSTS   ');
  out += logpst(WBISHOP_PSTE,   'WBISHOP_PSTE   ');
  out += logpst(WROOK_PSTS,     'WROOK_PSTS     ');
  out += logpst(WROOK_PSTE,     'WROOK_PSTE     ');
  out += logpst(WQUEEN_PSTS,    'WQUEEN_PSTS    ');
  out += logpst(WQUEEN_PSTE,    'WQUEEN_PSTE    ');
  out += logpst(WKING_PSTS,     'WKING_PSTS     ');
  out += logpst(WKING_PSTE,     'WKING_PSTE     ');

  out += logpst(BPAWN_PSTS,     'BPAWN_PSTS     ');
  out += logpst(BPAWN_PSTE,     'BPAWN_PSTE     ');
  out += logpst(BKNIGHT_PSTS,   'BKNIGHT_PSTS   ');
  out += logpst(BKNIGHT_PSTE,   'BKNIGHT_PSTE   ');
  out += logpst(BBISHOP_PSTS,   'BBISHOP_PSTS   ');
  out += logpst(BBISHOP_PSTE,   'BBISHOP_PSTE   ');
  out += logpst(BROOK_PSTS,     'BROOK_PSTS     ');
  out += logpst(BROOK_PSTE,     'BROOK_PSTE     ');
  out += logpst(BQUEEN_PSTS,    'BQUEEN_PSTS    ');
  out += logpst(BQUEEN_PSTE,    'BQUEEN_PSTE    ');
  out += logpst(BKING_PSTS,     'BKING_PSTS     ');
  out += logpst(BKING_PSTE,     'BKING_PSTE     ');

  out += logpst(WOUTPOST,       'WOUTPOST       ');
  out += logpst(BOUTPOST,       'BOUTPOST       ');

  out += loga(WSHELTER,         'WSHELTER       ');
  out += loga(WSTORM,           'WSTORM         ');

  out += loga(EV,               'EV             ');

  out += loga(IMBALN_S,         'IMBALN_S       ');
  out += loga(IMBALN_E,         'IMBALN_E       ');
  out += loga(IMBALB_S,         'IMBALB_S       ');
  out += loga(IMBALB_E,         'IMBALB_E       ');
  out += loga(IMBALR_S,         'IMBALR_S       ');
  out += loga(IMBALR_E,         'IMBALR_E       ');
  out += loga(IMBALQ_S,         'IMBALQ_S       ');
  out += loga(IMBALQ_E,         'IMBALQ_E       ');

  out += loga(MOBN_S,           'MOBN_S         ');
  out += loga(MOBN_E,           'MOBN_E         ');
  out += loga(MOBB_S,           'MOBB_S         ');
  out += loga(MOBB_E,           'MOBB_E         ');
  out += loga(MOBR_S,           'MOBR_S         ');
  out += loga(MOBR_E,           'MOBR_E         ');
  out += loga(MOBQ_S,           'MOBQ_S         ');
  out += loga(MOBQ_E,           'MOBQ_E         ');

  if (out == lastOut)
    console.log(epochs,err,'POSSIBLE CONVERGENCE');

  lastOut = out;

  out = out + '\r\n//}}}\r\n\r\n';

  if (epochs == 0)
    fs.writeFileSync('0'+gOutFile, out1+out);
  else
    fs.writeFileSync(gOutFile, out1+out);
}

//}}}
//{{{  zeroparams

function zeroparams () {

  //zeroa(VALUE_VECTOR,   'VALUE_VECTOR   ');

  //VALUE_VECTOR[PAWN]   = 100;
  //VALUE_VECTOR[KNIGHT] = 299;
  //VALUE_VECTOR[BISHOP] = 315;
  //VALUE_VECTOR[ROOK]   = 482;
  //VALUE_VECTOR[QUEEN]  = 919;
  //VALUE_VECTOR[KING]   = 10000;

  //zeroa(WPAWN_PSTS,     'WPAWN_PSTS     ');
  //zeroa(WPAWN_PSTE,     'WPAWN_PSTE     ');
  //zeroa(WKNIGHT_PSTS,   'WKNIGHT_PSTS   ');
  //zeroa(WKNIGHT_PSTE,   'WKNIGHT_PSTE   ');
  //zeroa(WBISHOP_PSTS,   'WBISHOP_PSTS   ');
  //zeroa(WBISHOP_PSTE,   'WBISHOP_PSTE   ');
  //zeroa(WROOK_PSTS,     'WROOK_PSTS     ');
  //zeroa(WROOK_PSTE,     'WROOK_PSTE     ');
  //zeroa(WQUEEN_PSTS,    'WQUEEN_PSTS    ');
  //zeroa(WQUEEN_PSTE,    'WQUEEN_PSTE    ');
  //zeroa(WKING_PSTS,     'WKING_PSTS     ');
  //zeroa(WKING_PSTE,     'WKING_PSTE     ');

  //zeroa(BPAWN_PSTS,     'BPAWN_PSTS     ');
  //zeroa(BPAWN_PSTE,     'BPAWN_PSTE     ');
  //zeroa(BKNIGHT_PSTS,   'BKNIGHT_PSTS   ');
  //zeroa(BKNIGHT_PSTE,   'BKNIGHT_PSTE   ');
  //zeroa(BBISHOP_PSTS,   'BBISHOP_PSTS   ');
  //zeroa(BBISHOP_PSTE,   'BBISHOP_PSTE   ');
  //zeroa(BROOK_PSTS,     'BROOK_PSTS     ');
  //zeroa(BROOK_PSTE,     'BROOK_PSTE     ');
  //zeroa(BQUEEN_PSTS,    'BQUEEN_PSTS    ');
  //zeroa(BQUEEN_PSTE,    'BQUEEN_PSTE    ');
  //zeroa(BKING_PSTS,     'BKING_PSTS     ');
  //zeroa(BKING_PSTE,     'BKING_PSTE     ');

  //zeroa(IMBALN_S);
  //zeroa(IMBALN_E);
  //zeroa(IMBALB_S);
  //zeroa(IMBALB_E);
  //zeroa(IMBALR_S);
  //zeroa(IMBALR_E);
  //zeroa(IMBALQ_S);
  //zeroa(IMBALQ_E);

  //zeroa(MOBN_S);
  //zeroa(MOBN_E);
  //zeroa(MOBB_S);
  //zeroa(MOBB_E);
  //zeroa(MOBR_S);
  //zeroa(MOBR_E);
  //zeroa(MOBQ_S);
  //zeroa(MOBQ_E);

  zeroa(EV);

  zeroa(WSHELTER);
  zeroa(WSTORM);
  EV[iKING_PENALTY] = 10;

}

//}}}
//{{{  grunt

function grunt () {

  lozza.newGameInit();

  //findK();
  //process.exit();

  console.log('creating params...');

  //{{{  create params
  
  //addp('', VALUE_VECTOR, KNIGHT, function (piece,mg,eg) {return (board.wCounts[KNIGHT] - board.bCounts[KNIGHT])});
  //addp('', VALUE_VECTOR, BISHOP, function (piece,mg,eg) {return (board.wCounts[BISHOP] - board.bCounts[BISHOP])});
  //addp('', VALUE_VECTOR, ROOK,   function (piece,mg,eg) {return (board.wCounts[ROOK]   - board.bCounts[ROOK])});
  //addp('', VALUE_VECTOR, QUEEN,  function (piece,mg,eg) {return (board.wCounts[QUEEN]  - board.bCounts[QUEEN])});
  /*
  for (var i=8; i < 56; i++) {
    var sq = B88[i];
    addp('', WPAWN_PSTS, sq, function (sq,mg,eg) {return (is(W_PAWN,sq) - is(B_PAWN,wbmap(sq))) * mg;});
    addp('', WPAWN_PSTE, sq, function (sq,mg,eg) {return (is(W_PAWN,sq) - is(B_PAWN,wbmap(sq))) * eg;});
  }
  
  for (var i=0; i < 64; i++) {
    var sq = B88[i];
    addp('', WKNIGHT_PSTS, sq, function (sq,mg,eg) {return (is(W_KNIGHT,sq) - is(B_KNIGHT,wbmap(sq))) * mg;});
    addp('', WKNIGHT_PSTE, sq, function (sq,mg,eg) {return (is(W_KNIGHT,sq) - is(B_KNIGHT,wbmap(sq))) * eg;});
    addp('', WBISHOP_PSTS, sq, function (sq,mg,eg) {return (is(W_BISHOP,sq) - is(B_BISHOP,wbmap(sq))) * mg;});
    addp('', WBISHOP_PSTE, sq, function (sq,mg,eg) {return (is(W_BISHOP,sq) - is(B_BISHOP,wbmap(sq))) * eg;});
    addp('', WROOK_PSTS,   sq, function (sq,mg,eg) {return (is(W_ROOK,sq)   - is(B_ROOK,  wbmap(sq))) * mg;});
    addp('', WROOK_PSTE,   sq, function (sq,mg,eg) {return (is(W_ROOK,sq)   - is(B_ROOK,  wbmap(sq))) * eg;});
    addp('', WQUEEN_PSTS,  sq, function (sq,mg,eg) {return (is(W_QUEEN,sq)  - is(B_QUEEN, wbmap(sq))) * mg;});
    addp('', WQUEEN_PSTE,  sq, function (sq,mg,eg) {return (is(W_QUEEN,sq)  - is(B_QUEEN, wbmap(sq))) * eg;});
    addp('', WKING_PSTS,   sq, function (sq,mg,eg) {return (is(W_KING,sq)   - is(B_KING,  wbmap(sq))) * mg;});
    addp('', WKING_PSTE,   sq, function (sq,mg,eg) {return (is(W_KING,sq)   - is(B_KING,  wbmap(sq))) * eg;});
  }
  */
  for (var i=0; i < WSHELTER.length; i++) {
    addp('', WSHELTER, i, function (row,mg,eg) {return board.features.wShelter[row] * mg;});
    addp('', WSTORM,   i, function (row,mg,eg) {return board.features.wStorm[row]   * mg;});
  }
  addp('k penalty s', EV, iKING_PENALTY, function (i,mg,eg) {return board.features.kingPenalty * mg;});
  /*
  var ko =[51,52,53,54,55,56,63,64,65,66,67,68,75,76,77,78,79,80]; //knight outpost squares
  for (var i=0; i < ko.length; i++) {
    var sq = ko[i];
    addp('', WOUTPOST, sq, function (sq,mg,eg) {return board.features.wOutpost[sq] * mg;});
  }
  for (var i=0; i <= 8; i++) {
    addp('', IMBALN_S, i, function (pawns,mg,eg) {return (board.wCounts[KNIGHT] * (board.wCounts[PAWN] == pawns) - board.bCounts[KNIGHT] * (board.bCounts[PAWN] == pawns)) * mg});
    addp('', IMBALN_E, i, function (pawns,mg,eg) {return (board.wCounts[KNIGHT] * (board.wCounts[PAWN] == pawns) - board.bCounts[KNIGHT] * (board.bCounts[PAWN] == pawns)) * eg});
    addp('', IMBALB_S, i, function (pawns,mg,eg) {return (board.wCounts[BISHOP] * (board.wCounts[PAWN] == pawns) - board.bCounts[BISHOP] * (board.bCounts[PAWN] == pawns)) * mg});
    addp('', IMBALB_E, i, function (pawns,mg,eg) {return (board.wCounts[BISHOP] * (board.wCounts[PAWN] == pawns) - board.bCounts[BISHOP] * (board.bCounts[PAWN] == pawns)) * eg});
    addp('', IMBALR_S, i, function (pawns,mg,eg) {return (board.wCounts[ROOK]   * (board.wCounts[PAWN] == pawns) - board.bCounts[ROOK]   * (board.bCounts[PAWN] == pawns)) * mg});
    addp('', IMBALR_E, i, function (pawns,mg,eg) {return (board.wCounts[ROOK]   * (board.wCounts[PAWN] == pawns) - board.bCounts[ROOK]   * (board.bCounts[PAWN] == pawns)) * eg});
    addp('', IMBALQ_S, i, function (pawns,mg,eg) {return (board.wCounts[QUEEN]  * (board.wCounts[PAWN] == pawns) - board.bCounts[QUEEN]  * (board.bCounts[PAWN] == pawns)) * mg});
    addp('', IMBALQ_E, i, function (pawns,mg,eg) {return (board.wCounts[QUEEN]  * (board.wCounts[PAWN] == pawns) - board.bCounts[QUEEN]  * (board.bCounts[PAWN] == pawns)) * eg});
  }
  for (var i=0; i < MOBN_S.length; i++) {
    addp('', MOBN_S, i, function (mob,mg,eg) {return board.features.mobN[mob] * mg});
    addp('', MOBN_E, i, function (mob,mg,eg) {return board.features.mobN[mob] * eg});
  }
  for (var i=0; i < MOBB_S.length; i++) {
    addp('', MOBB_S, i, function (mob,mg,eg) {return board.features.mobB[mob] * mg});
    addp('', MOBB_E, i, function (mob,mg,eg) {return board.features.mobB[mob] * eg});
  }
  for (var i=0; i < MOBR_S.length; i++) {
    addp('', MOBR_S, i, function (mob,mg,eg) {return board.features.mobR[mob] * mg});
    addp('', MOBR_E, i, function (mob,mg,eg) {return board.features.mobR[mob] * eg});
  }
  for (var i=0; i < MOBQ_S.length; i++) {
    addp('', MOBQ_S, i, function (mob,mg,eg) {return board.features.mobQ[mob] * mg});
    addp('', MOBQ_E, i, function (mob,mg,eg) {return board.features.mobQ[mob] * eg});
  }
  
  addp('', EV, iTIGHT_NS,             function (i,mg,eg) {return board.features.tightNS            * mg;});
  addp('', EV, iTIGHT_NE,             function (i,mg,eg) {return board.features.tightNE            * eg;});
  addp('', EV, iTIGHT_BS,             function (i,mg,eg) {return board.features.tightBS            * mg;});
  addp('', EV, iTIGHT_BE,             function (i,mg,eg) {return board.features.tightBE            * eg;});
  addp('', EV, iTIGHT_RS,             function (i,mg,eg) {return board.features.tightRS            * mg;});
  addp('', EV, iTIGHT_RE,             function (i,mg,eg) {return board.features.tightRE            * eg;});
  addp('', EV, iTIGHT_QS,             function (i,mg,eg) {return board.features.tightQS            * mg;});
  addp('', EV, iTIGHT_QE,             function (i,mg,eg) {return board.features.tightQE            * eg;});
  
  addp('', EV, iTENSE_NS,             function (i,mg,eg) {return board.features.tenseNS            * mg;});
  addp('', EV, iTENSE_NE,             function (i,mg,eg) {return board.features.tenseNE            * eg;});
  addp('', EV, iTENSE_BS,             function (i,mg,eg) {return board.features.tenseBS            * mg;});
  addp('', EV, iTENSE_BE,             function (i,mg,eg) {return board.features.tenseBE            * eg;});
  addp('', EV, iTENSE_RS,             function (i,mg,eg) {return board.features.tenseRS            * mg;});
  addp('', EV, iTENSE_RE,             function (i,mg,eg) {return board.features.tenseRE            * eg;});
  addp('', EV, iTENSE_QS,             function (i,mg,eg) {return board.features.tenseQS            * mg;});
  addp('', EV, iTENSE_QE,             function (i,mg,eg) {return board.features.tenseQE            * eg;});
  
  addp('', EV, iPAWN_DOUBLED_S,       function (i,mg,eg) {return board.features.pawnDoubledS       * mg;});
  addp('', EV, iPAWN_DOUBLED_E,       function (i,mg,eg) {return board.features.pawnDoubledE       * eg;});
  addp('', EV, iPAWN_BACKWARD_S,      function (i,mg,eg) {return board.features.pawnBackwardS      * mg;});
  addp('', EV, iPAWN_BACKWARD_E,      function (i,mg,eg) {return board.features.pawnBackwardE      * eg;});
  addp('', EV, iPAWN_ISOLATED_S,      function (i,mg,eg) {return board.features.pawnIsolatedS      * mg;});
  addp('', EV, iPAWN_ISOLATED_E,      function (i,mg,eg) {return board.features.pawnIsolatedE      * eg;});
  addp('', EV, iPAWN_PASSED_OFFSET_S, function (i,mg,eg) {return board.features.pawnPassedOffsetS  * mg;});
  addp('', EV, iPAWN_PASSED_OFFSET_E, function (i,mg,eg) {return board.features.pawnPassedOffsetE  * eg;});
  addp('', EV, iPAWN_PASSED_MULT_S,   function (i,mg,eg) {return board.features.pawnPassedMultS    * mg;});
  addp('', EV, iPAWN_PASSED_MULT_E,   function (i,mg,eg) {return board.features.pawnPassedMultE    * eg;});
  addp('', EV, iPAWN_OFFSET_S,        function (i,mg,eg) {return board.features.pawnPassedOffset2S * mg;});
  addp('', EV, iPAWN_OFFSET_E,        function (i,mg,eg) {return board.features.pawnPassedOffset2E * eg;});
  addp('', EV, iPAWN_MULT_S,          function (i,mg,eg) {return board.features.pawnPassedMult2S   * mg;});
  addp('', EV, iPAWN_MULT_E,          function (i,mg,eg) {return board.features.pawnPassedMult2E   * eg;});
  addp('', EV, iPAWN_PASS_FREE,       function (i,mg,eg) {return board.features.pawnPassedFreeE    * eg;});
  addp('', EV, iPAWN_PASS_UNSTOP,     function (i,mg,eg) {return board.features.pawnPassedUnstopE  * eg;});
  addp('', EV, iPAWN_PASS_KING1,      function (i,mg,eg) {return board.features.pawnPassedKing1E   * eg;});
  addp('', EV, iPAWN_PASS_KING2,      function (i,mg,eg) {return board.features.pawnPassedKing2E   * eg;});
  
  addp('', EV, iTWOBISHOPS_S,         function (i,mg,eg) {return board.features.bishopPairS        * mg;});
  addp('', EV, iTWOBISHOPS_E,         function (i,mg,eg) {return board.features.bishopPairE        * eg;});
  
  addp('', EV, iROOK7TH_S,            function (i,mg,eg) {return board.features.rook7thS           * mg;});
  addp('', EV, iROOK7TH_E,            function (i,mg,eg) {return board.features.rook7thE           * eg;});
  addp('', EV, iROOKOPEN_S,           function (i,mg,eg) {return board.features.rookOpenS          * mg;});
  addp('', EV, iROOKOPEN_E,           function (i,mg,eg) {return board.features.rookOpenE          * eg;});
  
  addp('', EV, iQUEEN7TH_S,           function (i,mg,eg) {return board.features.queen7thS          * mg;});
  addp('', EV, iQUEEN7TH_E,           function (i,mg,eg) {return board.features.queen7thE          * eg;});
  
  addp('', EV, iTEMPO_S,              function (i,mg,eg) {return board.features.tempoS             * mg;});
  addp('', EV, iTEMPO_E,              function (i,mg,eg) {return board.features.tempoE             * eg;});
  
  addp('', EV, iTRAPPED_S,            function (i,mg,eg) {return board.features.trappedS           * mg;});
  addp('', EV, iTRAPPED_E,            function (i,mg,eg) {return board.features.trappedE           * eg;});
  
  addp('', EV, iATT_N,                function (i,mg,eg) {return board.features.attN               * mg;});
  addp('', EV, iATT_B,                function (i,mg,eg) {return board.features.attB               * mg;});
  addp('', EV, iATT_R,                function (i,mg,eg) {return board.features.attR               * mg;});
  addp('', EV, iATT_Q,                function (i,mg,eg) {return board.features.attQ               * mg;});
  */
  //}}}

  console.log('tuning...');

  //{{{  tune params
  
  console.log('positions =',Vtotal);
  
  var epoch      = 0;
  var numParams  = params.length;
  var numBatches = Vtotal / gBatchSize | 0;
  var err        = 0;
  var lastErr    = 0;
  
  var K2 = gK / 200.0;
  
  while (gMaxEpochs--) {
  
    if (epoch % gErrStep == 0) {
      //{{{  report loss
      
      err = calcErr();
      
      console.log(epoch, err, err-lastErr);
      
      lastErr = err;
      
      saveparams(err,epoch);
      
      //}}}
      //{{{  check for crazy values
      /*
      for (var i=0; i < numParams; i++) {
        var p = params[i];
        var delta = Math.abs(p.v - p.a[p.i]);
        if (delta > 5 && p.s)
          console.log(p.s,p.v,p.a[p.i],delta);
      }
      */
      //}}}
      //{{{  reset adagrad
      
      if (gResetAdagrad) {
        for (var i=0; i < numParams; i++)
          params[i].ag = 0;
      }
      
      //}}}
    }
    else {
      process.stdout.write(epoch+'\r');
    }
  
    epoch++;
  
    for (var batch=0; batch < numBatches; batch++) {
      //{{{  reset gradient sums
      
      for (var i=0; i < numParams; i++)
        params[i].gr = 0;
      
      //}}}
      //{{{  accumulate gradients
      
      for (var i=batch*gBatchSize; i < (batch+1)*gBatchSize; i++) {
      
        var vi  = Vindex(i);
        var epd = epds[vi];
      
        uci.spec.board    = epd.board;
        uci.spec.turn     = epd.turn;
        uci.spec.rights   = epd.rights;
        uci.spec.ep       = epd.ep;
        uci.spec.fmc      = 0;
        uci.spec.hmc      = 0;
        uci.spec.id       = 'id' + j;
        uci.spec.moves    = [];
      
        lozza.position();
      
        var pr = epd.prob;
      
        var ev = board.evaluate(board.turn);
        if (board.turn == BLACK)
          ev = -ev;  // undo negamax.
      
        var sg    = sigmoid(ev);
        var phase = board.cleanPhase(board.phase);
        var mg    = (TPHASE - phase) / TPHASE;
        var eg    = phase / TPHASE;
      
        for (var j=0; j < numParams; j++) {
          var p = params[j];
          p.gr += p.coeff(p.i,mg,eg) * (sg * (1 - sg)) * (sg - pr);  // chain rule
        }
      }
      
      //}}}
      //{{{  apply mean gradient
      
      for (var i=0; i < numParams; i++) {
        var p    = params[i];
        var gr   = K2 * p.gr / gBatchSize;
        p.ag     += gr * gr;
        p.a[p.i] -= (gLearningRate / Math.sqrt(p.ag + 1e-8)) * gr;  // adagrad
      }
      
      //}}}
      //{{{  sync black arrays
      
      for (var i=0; i < 144; i++) {
        BPAWN_PSTS[wbmap(i)]   = WPAWN_PSTS[i];
        BPAWN_PSTE[wbmap(i)]   = WPAWN_PSTE[i];
        BKNIGHT_PSTS[wbmap(i)] = WKNIGHT_PSTS[i];
        BKNIGHT_PSTE[wbmap(i)] = WKNIGHT_PSTE[i];
        BBISHOP_PSTS[wbmap(i)] = WBISHOP_PSTS[i];
        BBISHOP_PSTE[wbmap(i)] = WBISHOP_PSTE[i];
        BROOK_PSTS[wbmap(i)]   = WROOK_PSTS[i];
        BROOK_PSTE[wbmap(i)]   = WROOK_PSTE[i];
        BQUEEN_PSTS[wbmap(i)]  = WQUEEN_PSTS[i];
        BQUEEN_PSTE[wbmap(i)]  = WQUEEN_PSTE[i];
        BKING_PSTS[wbmap(i)]   = WKING_PSTS[i];
        BKING_PSTE[wbmap(i)]   = WKING_PSTE[i];
        BOUTPOST[wbmap(i)]     = WOUTPOST[i];
      }
      
      //}}}
    }
  }
  
  console.log('Done',err);
  
  //}}}

  process.exit();
}

//}}}
//{{{  readfile

function readfile() {

  //process.stdout.write(Vfileno+'\r');

  var data  = fs.readFileSync('data/' + gPrefix + Vfileno + gSuffix + '.epd', 'utf8');
  var lines = data.split('\n');

  data = '';
  epds = [];

  for (var i=0; i < lines.length; i++) {

    var line = lines[i];

    line = line.replace(/(\r\n|\n|\r)/gm,'');
    line = line.trim();

    if (!line.length)
      continue;

    var parts = line.split(' ');

    if (!parts.length)
      continue;

    if (gUseScore)
      var train = sigmoid(parseFloat(parts[gWDLIndex]));
    else
      var train = getprob(parts[gWDLIndex]);

    epds.push({board:   parts[0],
               turn:    parts[1],
               rights:  parts[2],
               ep:      parts[3],
               prob:    train});
  }
}

//}}}
//{{{  Vindex

function Vindex(n) {

  var f = Vf[n];
  var i = Vi[n];

  if (Vfileno != f) {
    Vfileno = f;
    readfile();
  }

  return i;
}

//}}}

//}}}

var Vf      = [];
var Vi      = [];
var Vtotal  = 0;
var Vfileno = 0;

console.log('indexing files...');

for (var i=0; i < gNumFiles; i++) {
  Vfileno = i;
  readfile();
  for (var j=0; j < epds.length; j++) {
    Vf[Vtotal] = i;
    Vi[Vtotal] = j;
    Vtotal++;
  }
}

grunt();

