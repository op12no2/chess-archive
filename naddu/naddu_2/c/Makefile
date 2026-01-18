# Naddu Chess Engine - C Port
# Works with GCC (w64devkit/MinGW) and MSVC

CC = gcc
CFLAGS = -O3 -march=native -Wall -Wextra
LDFLAGS = -lpthread

# For MSVC, use: nmake CC=cl CFLAGS=/O2 /W3

SRC = main.c uci.c pos.c zob.c node.c gen.c make.c attack.c eval.c \
      tt.c search.c qsearch.c history.c killers.c rep.c tc.c iterate.c go.c \
      move.c perft.c bench.c pt.c

OBJ = $(SRC:.c=.o)
EXE = naddu.exe

all: $(EXE)

$(EXE): $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c -o $@ $<

clean:
	rm -f $(OBJ) $(EXE)

debug: CFLAGS = -g -O0 -Wall -Wextra -DDEBUG
debug: clean $(EXE)

.PHONY: all clean debug
