function uciWrite(data) {
  process.stdout.write(data + '\n');
}

function uciQuit() {
  process.exit(0);
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line) {
  const cmd = line.trim().toLowerCase();
  if (cmd === 'quit' || cmd === 'q') {
    uciQuit();
  }
  else {
    execString(line);
  }
});
