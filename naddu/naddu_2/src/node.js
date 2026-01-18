
const MAX_PLY = 64;
const MAX_MOVES = 256;

class Node {

  constructor() {
    this.pos = null;
    this.moves = new Uint32Array(MAX_MOVES);
    this.ranks = new Int32Array(MAX_MOVES);
    this.numMoves = 0;
    this.nextMove = 0;
    this.stage = 0;
    this.ttMove = 0;
    this.killer = 0;
    this.draw = 0;
  }
}

const nodes = Array(MAX_PLY);

function nodeInitOnce() {
  for (let i=0; i < MAX_PLY; i++ ) {
    nodes[i] = new Node();
    nodes[i].pos = new Pos();
  }
}
