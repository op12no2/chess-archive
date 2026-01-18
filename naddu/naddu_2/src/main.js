
nodeInitOnce();
evalInitOnce();
zobInitOnce();
ttInitOnce();
historyInitOnce();

// If command-line arguments provided, execute them and exit
if (process.argv.length > 2) {
  const commands = process.argv.slice(2);
  for (const cmd of commands) {
    execString(cmd);
  }
  process.exit(0);
}
