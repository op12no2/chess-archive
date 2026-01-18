#ifndef UCI_H
#define UCI_H

void position_fen(const char *fen, char **moves, int num_moves);
void uci_loop(void);
void exec_string(const char *cmd);

#endif
