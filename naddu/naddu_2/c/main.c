#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "types.h"
#include "node.h"
#include "eval.h"
#include "zob.h"
#include "tt.h"
#include "history.h"
#include "make.h"
#include "uci.h"
#include "tc.h"

#ifdef _WIN32
#include <windows.h>

static HANDLE input_thread;
static volatile int running = 1;

static DWORD WINAPI input_thread_func(LPVOID param) {
  (void)param;
  char line[4096];

  while (running && fgets(line, sizeof(line), stdin)) {
    size_t len = strlen(line);
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';

    if (len == 0)
      continue;

    // Handle stop command immediately
    if (strcmp(line, "stop") == 0) {
      tc.stop = 1;
      continue;
    }

    // Handle quit
    if (strcmp(line, "quit") == 0 || strcmp(line, "q") == 0) {
      running = 0;
      tc.stop = 1;
      exit(0);
    }

    exec_string(line);
  }

  return 0;
}

static void start_input_thread(void) {
  input_thread = CreateThread(NULL, 0, input_thread_func, NULL, 0, NULL);
}

#else
#include <pthread.h>

static pthread_t input_thread;
static volatile int running = 1;

static void *input_thread_func(void *param) {
  (void)param;
  char line[4096];

  while (running && fgets(line, sizeof(line), stdin)) {
    size_t len = strlen(line);
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';
    if (len > 0 && (line[len-1] == '\n' || line[len-1] == '\r'))
      line[--len] = '\0';

    if (len == 0)
      continue;

    // Handle stop command immediately
    if (strcmp(line, "stop") == 0) {
      tc.stop = 1;
      continue;
    }

    // Handle quit
    if (strcmp(line, "quit") == 0 || strcmp(line, "q") == 0) {
      running = 0;
      tc.stop = 1;
      exit(0);
    }

    exec_string(line);
  }

  return NULL;
}

static void start_input_thread(void) {
  pthread_create(&input_thread, NULL, input_thread_func, NULL);
}

#endif

static void init_all(void) {
  node_init();
  eval_init();
  zob_init();
  tt_init();
  history_init();
  make_init();
}

int main(int argc, char **argv) {
  // Disable buffering for UCI
  setbuf(stdout, NULL);
  setbuf(stdin, NULL);

  init_all();

  // If command-line arguments provided, execute them and exit
  if (argc > 1) {
    for (int i = 1; i < argc; i++) {
      exec_string(argv[i]);
    }
    return 0;
  }

  // Start input thread and enter main loop
  start_input_thread();

  // Keep main thread alive
  while (running) {
#ifdef _WIN32
    Sleep(100);
#else
    usleep(100000);
#endif
  }

  return 0;
}
