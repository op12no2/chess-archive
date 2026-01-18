function evalTests() {

  for (let i = 0; i < BENCH_POSITIONS.length; i++) {
    const fen = BENCH_POSITIONS[i];
    position(fen);
    const score = evaluate(nodes[0]);
    uciWrite(`${i + 1} fen ${fen} eval ${score}`);
  }

}
