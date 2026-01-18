const v8 = require('v8');
console.log(`Max memory: ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);
process.exit();
var epdfile = 'lichess-big3-resolved';

var split   = 5000000;
var o       = '';
var seq     = 0;         // change if needed

var thisPosition = 0;

const fs       = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('data/'+epdfile+'.epd'),
    output: process.stdout,
    crlfDelay: Infinity,
    terminal: false
});

rl.on('line', function (line) {

  thisPosition += 1;

  if (thisPosition % split == 0) {
    fs.writeFileSync('data/'+epdfile+seq+'.epd',o);
    o = '';
    seq++;
  }

  o += line+'\r\n';
});

rl.on('close', function(){
  if (o) {
    fs.writeFileSync('data/'+epdfile+seq+'.book',o);
  }
});

