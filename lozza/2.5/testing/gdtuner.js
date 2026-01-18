//
// Copy lozza.js above here.
//

TUNING = 1;

lozza.newGameInit();

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

//{{{  data files

var datafiles = [];

datafiles[0]  = 'data\\quiet-labeled-sf.epd';
datafiles[1]  = 'data\\pedantic-sf.epd';
datafiles[2]  = 'data\\eth0-sf.epd';
datafiles[3]  = 'data\\eth1-sf.epd';
datafiles[4]  = 'data\\eth2-sf.epd';
datafiles[5]  = 'data\\eth3-sf.epd';
datafiles[6]  = 'data\\eth4-sf.epd';
datafiles[7]  = 'data\\eth5-sf.epd';
datafiles[8]  = 'data\\eth6-sf.epd';
datafiles[9]  = 'data\\eth7-sf.epd';
datafiles[10] = 'data\\eth8-sf.epd';
datafiles[11] = 'data\\eth9-sf.epd';

//}}}

var epds     = [];
const params = [];

const gOutFile = 'gdtuner.txt';

//{{{  functions

//{{{  loss

function loss (x, y) {
  return Math.abs(x-y);
}

//}}}
//{{{  addp

function addp (a,i,j,k,callback) {
  params.push({a: a, i: i, j: j, k: k, callback: callback, grSum: 0, n: 0});
}

//}}}
//{{{  calcErr

var counted = 0;
var numepds = 0;

function calcErr () {

  numepds = 0;

  var err = 0;
  var n   = 0;

  for (var j=0; j < datafiles.length; j++) {

    loadEpds(datafiles[j]);

    for (var i=0; i < epds.length; i++) {

      numepds++;

      var epd = epds[i];

      uci.spec.board    = epd.board;
      uci.spec.turn     = epd.turn;
      uci.spec.rights   = epd.rights;
      uci.spec.ep       = epd.ep;
      uci.spec.fmc      = 0;
      uci.spec.hmc      = 0;
      uci.spec.id       = '';
      uci.spec.moves    = [];

      lozza.position();

      var e1 = epd.eval;
      var e2 = lozza.board.evaluate(lozza.board.turn);
      if (lozza.board.turn == BLACK)
        e2 = -e2;

      err += loss(e1,e2);
      n++;
    }
  }

  if (!counted) {
    counted = 1;
    console.log('num positions =', numepds);
  }

  return err / n;
}

//}}}
//{{{  loga

function loga (p) {

  var a = Array(p.length);

  for (var i=0; i < p.length; i++)
    a[i] = myround(p[i]);

  return '[' + a.toString() + '];\r\n';
}

//}}}
//{{{  saveparams

function saveparams (epochs, err) {

  var d = new Date().toGMTString();

  var out = '{{{  gd eval weights\r\n// ';

  out +=  d + '\r\n// ';
  out +=  epochs + ' ' + err + '\r\n';

  for (var u=0; u<7; u++) {
    for (var v=0; v<144; v++) {
      out += 'EVAL_KPST_W[' + u +'][' + v + '] = ' + loga(EVAL_KPST_W[u][v]);
      out += 'EVAL_kPST_W[' + u +'][' + v + '] = ' + loga(EVAL_kPST_W[u][v]);
      out += 'EVAL_KPST_B[' + u +'][' + v + '] = ' + loga(EVAL_KPST_B[u][v]);
      out += 'EVAL_kPST_B[' + u +'][' + v + '] = ' + loga(EVAL_kPST_B[u][v]);
    }
  }

  out += '}}}\r\n';

  fs.writeFileSync(gOutFile, out);
}

//}}}
//{{{  loadEpds

function loadEpds (f) {

  epds = [];

  var data  = fs.readFileSync(f, 'utf8');
  var lines = data.split('\n');

  data = '';  //release.

  for (var i=0; i < lines.length; i++) {

    var line = lines[i];

    line = line.replace(/(\r\n|\n|\r|;|")/gm,'');

    line = line.trim();
    if (!line.length)
      continue;

    var parts = line.split(' ');
    if (!parts.length)
      continue;

    if (parts.length != 5) {
      console.log('file format',line);
      process.exit();
    }

    //console.log(line);

    epds.push({board:   parts[0],
               turn:    parts[1],
               rights:  parts[2],
               ep:      parts[3],
               eval:    parseInt(parts[4])});
  }

  lines = [];
}

//}}}
//{{{  is

function is (colour, piece, sq) {
  return board.b[sq] == (colour|piece) ? 1 : 0;
}

//}}}
//{{{  grunt

function grunt () {

  //{{{  create params
  
  for (var j=PAWN; j < KING; j++) {
  
    if (j == PAWN) {
      var x = 8;
      var y = 56;
    }
    else {
      var x = 0;
      var y = 64;
    }
  
    for (var sq=x; sq < y; sq++) {
  
      var i = B88[sq];
  
      for (var sq2=0; sq2 < 64; sq2++) {
  
        var k = B88[sq2];
  
        addp(EVAL_KPST_W[j][i], k, j, i,
          function (i,j,k,mg,eg) {
            //i = white king square, j = piece, k = piece square
            var wk = is(WHITE, KING, i);
            var wp = is(WHITE, j,    k);
            var bk = is(BLACK, KING, wbmap(i));
            var bp = is(BLACK, j,    wbmap(k));
            var w = (wk && wp) ? 1 : 0;
            var b = (bk && bp) ? 1 : 0;
            return (w - b);
          }
        );
  
        addp(EVAL_kPST_W[j][i], k, j, i,
          function (i,j,k,mg,eg) {
            //i = black king square, j = piece, k = piece square
            var bk = is(BLACK, KING, i);
            var wp = is(WHITE, j,    k);
            var wk = is(WHITE, KING, wbmap(i));
            var bp = is(BLACK, j,    wbmap(k));
            var w = (bk && wp) ? 1 : 0;
            var b = (wk && bp) ? 1 : 0;
            return (w - b);
          }
        );
  
      }
    }
  }
  
  //}}}
  //{{{  tune params
  
  var epoch      = 0;
  var batchSize  = 10000;
  var lr         = 0.001;
  var rate       = 1;
  
  console.log('num data files =', datafiles.length);
  console.log('num params =', params.length);
  console.log('batch size =', batchSize);
  console.log('lr =', lr);
  console.log('report rate =', rate);
  
  var err     = 0;
  var lastErr = err;
  
  while (true) {
  
    epoch++;
  
    if ((epoch % rate) == 0) {
      //{{{  report loss
      
      err = calcErr();
      
      console.log(epoch, err, err-lastErr);
      
      lastErr = err;
      
      saveparams(epoch, err);
      
      //}}}
    }
    else
      process.stdout.write(epoch+'\r');
  
    for (var fn=0; fn < datafiles.length; fn++) {
  
      loadEpds(datafiles[fn]);
  
      var numBatches = epds.length / batchSize;
  
      for (var batch=0; batch < numBatches; batch++) {
        //{{{  reset gradients
        
        for (var i=0; i < params.length; i++) {
          params[i].grSum = 0;
          params[i].n     = 0;
        }
        
        //}}}
        //{{{  accumulate gradients
        
        for (var i=0; i < batchSize; i++) {
        
          var epd = epds[Math.random() * epds.length | 0];
        
          uci.spec.board    = epd.board;
          uci.spec.turn     = epd.turn;
          uci.spec.rights   = epd.rights;
          uci.spec.ep       = epd.ep;
          uci.spec.fmc      = 0;
          uci.spec.hmc      = 0;
          uci.spec.id       = '';
          uci.spec.moves    = [];
        
          lozza.position();
        
          var e1 = epd.eval;
          var e2 = lozza.board.evaluate(lozza.board.turn);
          if (lozza.board.turn == BLACK)
            e2 = -e2;
        
          var phase = board.cleanPhase(board.phase);
          var mg    = (TPHASE - phase) / TPHASE;
          var eg    = phase / TPHASE;
        
          for (var j=0; j < params.length; j++) {
            var p = params[j];
            var f = p.callback(p.i, p.j, p.k, mg, eg);
            if (f) {
              p.grSum += f * (e2 - e1);
              p.n += 1;
            }
          }
        }
        
        //}}}
        //{{{  apply mean gradient
        
        for (var i=0; i < params.length; i++) {
          var p = params[i];
          if (p.n) {
            var gr = p.grSum / p.n;
            p.a[p.i] -= gr * lr;
          }
        }
        
        //}}}
        //{{{  sync black stuff
        
        for (var k=0; k < 7; k++) {
          for (var i=0; i < 144; i++) {
            for (var j=0; j < 144; j++) {
              EVAL_KPST_B[k][wbmap(i)][wbmap(j)] = EVAL_KPST_W[k][i][j];
              EVAL_kPST_B[k][wbmap(i)][wbmap(j)] = EVAL_kPST_W[k][i][j];
            }
          }
        }
        
        //}}}
      }
    }
  }
  
  //}}}

  process.exit();
}

//}}}

//}}}

grunt();

process.exit();

