
fs = require('fs');

var data  = fs.readFileSync('data/quiet-labeled.epd', 'utf8');
var lines = data.split('\n');

data = '';
epds = [];

for (var i=0; i < lines.length; i++) {

  var line = lines[i];

  line = line.replace(/(\r\n|\n|\r|"|;)/gm,'');
  line = line.trim();

  if (!line.length)
    continue;

  var parts = line.split(' ');

  if (!parts.length)
    continue;

  console.log(parts[0],parts[1],parts[2],parts[3],0,0,parts[5]);
}

process.exit();

