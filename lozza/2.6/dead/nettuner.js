
var epdfile        = 'data/lichess-big3-resolved.epd';
var netInputSize   = 768;
var netHiddenSize  = 32;
var numEpochs      = 20000;
var learningRate   = 0.1;
var batchSize      = 10005;
//var useBias        = 0;

//{{{  constants

const NWHITE = 0;
const NBLACK = 1;

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;

var chPce = [];
var chCol = [];
var chNum = [];

chPce['k'] = KING;
chCol['k'] = NBLACK;
chPce['q'] = QUEEN;
chCol['q'] = NBLACK;
chPce['r'] = ROOK;
chCol['r'] = NBLACK;
chPce['b'] = BISHOP;
chCol['b'] = NBLACK;
chPce['n'] = KNIGHT;
chCol['n'] = NBLACK;
chPce['p'] = PAWN;
chCol['p'] = NBLACK;
chPce['K'] = KING;
chCol['K'] = NWHITE;
chPce['Q'] = QUEEN;
chCol['Q'] = NWHITE;
chPce['R'] = ROOK;
chCol['R'] = NWHITE;
chPce['B'] = BISHOP;
chCol['B'] = NWHITE;
chPce['N'] = KNIGHT;
chCol['N'] = NWHITE;
chPce['P'] = PAWN;
chCol['P'] = NWHITE;

chNum['8'] = 8;
chNum['7'] = 7;
chNum['6'] = 6;
chNum['5'] = 5;
chNum['4'] = 4;
chNum['3'] = 3;
chNum['2'] = 2;
chNum['1'] = 1;

//}}}
//{{{  functions

var epds    = [];
var outputs = [];
var debug   = 0;

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
  else if (r == '[0.5]')
    return 0.5;
  else if (r == '[1.0]')
    return 1.0;
  else if (r == '[0.0]')
    return 0.0;
  else
    console.log('unknown result',r);
}

//}}}
//{{{  myround

function myround(x) {
  return Math.sign(x) * Math.round(Math.abs(x));
}

//}}}
//{{{  decodeFEN
//
// Also accumulates hidden.in nnue style and creates a list of input
// vector elements that are 1.0 for calculating and accumulating gradients
// without scanning the whole input vector.
//

function decodeFEN(board) {

  var x = 0;

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    hidden.in = 0.0;
  }

  for (var i=0; i<netInputSize; i++)
    neti[i] = 0.0;

  inNum = 0;

  var sq = 0;

  for (var j=0; j < board.length; j++) {

    var ch = board.charAt(j);

    if (ch == '/')
      continue;

    var num = chNum[ch];
    var col = 0;
    var pce = 0;

    if (typeof(num) == 'undefined') {
      //{{{  decode ch
      
      pce = chPce[ch];
      col = chCol[ch];
      
      //}}}
      //{{{  check stuff
      
      if (debug) {
      
        if (sq < 0) {
          console.log('sq<0',sq);
          process.exit();
        }
        else if (sq > 63) {
          console.log('sq>63',sq);
          process.exit();
        }
        else if (pce < 1) {
          console.log('pce<0',pce);
          process.exit();
        }
        else if (pce > 6) {
          console.log('pce>5',pce);
          process.exit();
        }
        else if (typeof(pce) == 'undefined') {
          console.log('pceundef',pce);
          process.exit();
        }
        else if (col < 0) {
          console.log('col<0',col);
          process.exit();
        }
        else if (col > 1) {
          console.log('col>1',col);
          process.exit();
        }
        else if (typeof(col) == 'undefined') {
          console.log('colundef',col);
          process.exit();
        }
      }
      
      //}}}
      //{{{  map to model
      
      if (col == NWHITE)
        x = 0   + (pce-1) * 64 + sq;
      else
        x = 384 + (pce-1) * 64 + sq;
      
      if (debug) {
        if (isNaN(x)) {
          console.log('xnan',x);
          process.exit();
        }
        if (x >= 768) {
          console.log('x>768',x);
          process.exit();
        }
        if (x < 0) {
          console.log('x-ve',x);
          process.exit();
        }
      }
      
      //}}}
      neti[x] = 1.0;
      for (var h=0; h < netHiddenSize; h++) {
        var hidden = neth[h];
        hidden.in += hidden.weights[x];
      }
      inList[inNum] = x;
      inNum++;
      sq++;
    }
    else {
      sq += num;
    }
  }

  return;
}

//}}}
//{{{  network

var netOutputSize  = 1;    // output layer.

//{{{  build net

function netNode (weightsSize) {
  this.in          = 0;
  this.gin         = 0;
  this.out         = 0;
  this.gout        = 0;
  this.weights     = Array(weightsSize);
  this.gweights    = Array(weightsSize);
  this.gweightssum = Array(weightsSize);
  this.adagrad     = Array(weightsSize);
  //this.bias        = 0;
  //this.gbias       = 0;
  //this.gbiassum    = 0;
  //this.biasag      = 0;
}

var neti = Array(netInputSize);

var neth = Array(netHiddenSize);
for (var h=0; h < netHiddenSize; h++) {
  neth[h] = new netNode(netInputSize);
}

var neto = Array(netOutputSize);
for (var o=0; o < netOutputSize; o++) {
  neto[o] = new netNode(netHiddenSize);
}

var inList = Array(32);
var inNum  = 0;

//}}}

//{{{  sigmoid

function sigmoid(x) {
  return (1.0 / (1.0 + Math.exp(-x)));
}

function dsigmoid(x) {
  return sigmoid(x) * (1.0 - sigmoid(x));
}

//}}}
//{{{  relu

function relu(x) {
  return Math.max(0.0,x);
}

function drelu(x) {
  return 1.0;
}

//}}}
//{{{  linear

function linear(x) {
  return x;
}

function dlinear(x) {
  return 1.0;
}

//}}}
//{{{  leelaEval

function leelaEval(s) {

  s = (s - 0.5) + 2;

  return 111.714640912 * Math.tan(1.5620688421 * s);

}

//}}}
//{{{  netLoss

function netLoss(target) {

  var x = 0.0;

  for (var o=0; o < netOutputSize; o++) {
    x += (target[o] - neto[o].out) * (target[o] - neto[o].out);
  }

  return x;
}

//}}}
//{{{  netInitWeights()

function xavierInit(sizeIn, sizeOut) {

  const stdDev = Math.sqrt(2 / (sizeIn + sizeOut));

  return function() {

    return Math.random() * stdDev;

  };

}



function sparseInit(sizeIn, sizeOut, sparsity=0.1)
{
  const initFunction = xavierInit(sizeIn, sizeOut);

    return function() {

      return Math.random() < sparsity ? initFunction() : 0;


};
}

function netInitWeights() {

  //const initFunction = sparseInit(netInputSize, netHiddenSize, 0.5);

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    for (var i=0; i < netInputSize; i++) {
      //hidden.weights[i] = initFunction();
      hidden.weights[i] = 1 * (Math.random() * 2 - 1);
      hidden.adagrad[i] = 0;
    }
    //hidden.bias   = 0;
    //hidden.biasag = 0;
  }

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    for (var h=0; h < netHiddenSize; h++) {
      //output.weights[h] = initFunction();
      output.weights[h] = 1 * (Math.random() * 2 - 1);
      output.adagrad[h] = 0;
    }
    //output.bias   = 0;
    //output.biasag = 0;
  }
}

//}}}
//{{{  netResetGradientSums()

function netResetGradientSums() {

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    for (var h=0; h < netHiddenSize; h++) {
      output.gweightssum[h] = 0.0;
    }
    //output.gbiassum = 0.0;
  }

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    for (var i=0; i < netInputSize; i++) {
      hidden.gweightssum[i] = 0.0;
    }
    //hidden.gbiassum = 0.0;
  }
}

//}}}
//{{{  netForward()             nnue
//
//  hidden.in is accumulated by decodeFen().
//

function netForward() {

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    hidden.out = relu(hidden.in);
  }

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    output.in = 0;
    for (var h=0; h < netHiddenSize; h++) {
      output.in += output.weights[h] * neth[h].out;
    }
    output.out = sigmoid(output.in);
  }
}

//}}}
//{{{  netCalcGradients()       nnue

function netCalcGradients(targets) {

  if (targets.length != netOutputSize) {
    console.log('netCallGradients','output vector length must be',netOutputSize,'your length is',targets.length);
    process.exit;
  }

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    output.gout = 2 * (output.out - targets[o]);
    output.gin  = dsigmoid(output.in) * output.gout;
  }

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    for (var h=0; h < netHiddenSize; h++) {
      var hidden = neth[h];
      output.gweights[h] = output.gin * hidden.out;
    }
    //output.gbias = output.gin * 1;
  }

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    hidden.gout = 0;
    for (var o=0; o < netOutputSize; o++) {
      var output = neto[o];
      hidden.gout += output.gin * output.weights[h];
    }
    hidden.gin = drelu(hidden.in) * hidden.gout;
  }

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    for (var i=0; i < inNum; i++) {
      hidden.gweights[inList[i]] = hidden.gin * neti[inList[i]];
    }
    //hidden.gbias = hidden.gin * 1;
  }
}

//}}}
//{{{  netAccumulateGradients() nnue

function netAccumulateGradients() {

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    for (var h=0; h < netHiddenSize; h++) {
      output.gweightssum[h] += output.gweights[h];
    }
    //output.gbiassum += output.gbias;
  }

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    for (var i=0; i < inNum; i++) {
      hidden.gweightssum[inList[i]] += hidden.gweights[inList[i]];
    }
    //hidden.gbiassum += hidden.gbias;
  }
}

//}}}
//{{{  netApplyGradients()

function netApplyGradients() {

  var gr = 0;
  var lr = 0;

  for (var o=0; o < netOutputSize; o++) {
    var output = neto[o];
    for (var h=0; h < netHiddenSize; h++) {
      gr = output.gweightssum[h] / batchSize;
      output.adagrad[h] += gr * gr;
      lr = learningRate / Math.sqrt(output.adagrad[h] + 1e-8);
      output.weights[h] -= lr * gr;
    }
    //gr = output.gbiassum / batchSize;
    //output.biasag += gr * gr;
    //lr = learningRate / Math.sqrt(output.biasag + 1e-8);
    //output.bias -= lr * gr;
  }

  for (var h=0; h < netHiddenSize; h++) {
    var hidden = neth[h];
    for (var i=0; i < netInputSize; i++) {
      gr = hidden.gweightssum[i] / batchSize;
      hidden.adagrad[i] += gr * gr;
      lr = learningRate / Math.sqrt(hidden.adagrad[i] + 1e-8);
      hidden.weights[i] -= lr * gr;
    }
    //gr = hidden.gbiassum / batchSize;
    //hidden.biasag += gr * gr;
    //lr = learningRate / Math.sqrt(hidden.biasag + 1e-8);
    //hidden.bias -= lr * gr;
  }
}

//}}}
//{{{  netSaveWeights

function netSaveWeights (loss) {

  var d   = new Date();
  var out = '//{{{  network weights\r\n\r\n';

  out += '// last update ' + d;
  out += '\r\n';

  out += '// epds = ' + epdfile;
  out += '\r\n';

  out += '// hidden layer size = ' + netHiddenSize;
  out += '\r\n';

  out += '// loss = ' + loss;
  out += '\r\n';

  for (var h=0; h < netHiddenSize; h++) {
    out = out + 'this.h1['+h+'].weights = [' + neth[h].weights.toString();
    out = out + '];\r\n';
    //out = out + 'this.h1.bias = ' + neth[h].bias + ';\r\n';
  }

  for (var o=0; o < netOutputSize; o++) {
    out = out + 'this.o1.weights = [' + neto[o].weights.toString();
    out = out + '];\r\n';
    //out = out + 'this.o1.bias = ' + neto[o].bias + ';\r\n';
  }

  out = out + '\r\n//}}}\r\n\r\n';

  fs.writeFileSync('nettuner' + netHiddenSize + '.txt',out);
}

//}}}

//}}}
//{{{  grunt

function grunt () {

  console.log('positions =',epds.length);

  //{{{  check decoding
  
  process.stdout.write('checking decoding...\r');
  
  debug = 1;
  
  var t1 = Date.now();
  
  for (var i=0; i < epds.length/100|0; i++) {
  
    var epd = epds[i];
  
    decodeFEN(epd.board);
  }
  
  var t2 = Date.now();
  
  debug = 0;
  
  console.log('decoding ok',(t2-t1),'ms',epds.length/100|0,'epds');
  
  //}}}
  //{{{  tune
  
  var numBatches = epds.length / batchSize | 0;
  var loss       = 0;
  
  console.log('positions =',epds.length);
  console.log('input layer size =',netInputSize);
  console.log('hidden layer size =',netHiddenSize);
  console.log('batch size =',batchSize);
  console.log('batches per epoch =',numBatches);
  console.log('learning rate =',learningRate);
  //console.log('use bias =',useBias);
  
  netInitWeights();
  
  for (var epoch=0; epoch < numEpochs; epoch++) {
    //{{{  get loss
    
    if (epoch % 10 == 0) {
    
      loss = 0;
    
      for (var i=0; i < epds.length; i++) {
    
        var epd = epds[i];
    
        decodeFEN(epd.board);
    
        netForward();
    
        var targets = [epd.prob];
    
        loss += netLoss(targets);
      }
    
      loss = loss / epds.length;
    
      console.log ('epoch =',epoch,'loss =',loss);
    
      netSaveWeights(loss);
    }
    
    //}}}
    //{{{  batched epoch
    
    for (var batch=0; batch < numBatches; batch++) {
    
      if (batch % 100 == 0)
        process.stdout.write('epoch ' + epoch + ', batch ' + batch + '\r');
    
      netResetGradientSums();
    
      for (var i = batch*batchSize; i < (batch+1)*batchSize; i++) {
    
        var epd = epds[i];
    
        decodeFEN(epd.board);
    
        netForward()
    
        var targets = [epd.prob];
    
        netCalcGradients(targets);
        netAccumulateGradients();
      }
    
      netApplyGradients();
    }
    
    //}}}
  }
  
  console.log('done');
  
  //}}}
}

//}}}

//}}}
//{{{  kick it off

var thisPosition = 0;

const fs       = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream(epdfile),
    output: process.stdout,
    crlfDelay: Infinity,
    terminal: false
});

rl.on('line', function (line) {

  thisPosition += 1;

  if (thisPosition % 100000 == 0)
    process.stdout.write(thisPosition+'\r');

  line = line.replace(/(\r\n|\n|\r)/gm,'');

  const parts = line.split(' ');

  if (!parts.length)
    return;

  epds.push({board:   parts[0],
             turn:    parts[1],
             rights:  parts[2],
             ep:      parts[3],
             prob:    getprob(parts[6])});
});

rl.on('close', function(){
  grunt();
});

//}}}

