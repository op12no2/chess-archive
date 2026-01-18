
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <inttypes.h>
#include <assert.h>

enum { WHITE=0, BLACK=1 };

#define NOT_A_FILE 0xfefefefefefefefeULL
#define NOT_H_FILE 0x7f7f7f7f7f7f7f7fULL

typedef struct {
  int bits;
  int count;
  int shift;
  uint64_t mask;
  uint64_t magic;
  uint64_t *attacks; // reindexed
} Attack;

// ---------------- utils ----------------
static inline int popcount64(uint64_t x){ return __builtin_popcountll(x); }

static uint64_t rng_state = 0x9E3779B97F4A7C15ULL;
static inline uint64_t xorshift64star(void){
  uint64_t x = rng_state;
  x ^= x >> 12; x ^= x << 25; x ^= x >> 27;
  rng_state = x;
  return x * 2685821657736338717ULL;
}

static inline int magic_index(uint64_t blockers, uint64_t magic, int shift){
  return (int)((blockers * magic) >> shift);
}

// ---------------- tables ----------------
static uint64_t pawn_attacks[2][64];
static uint64_t knight_attacks[64];
static uint64_t king_attacks[64];
static Attack bishop_attacks[64];
static Attack rook_attacks[64];

// -------------- init jumpers --------------
static void init_pawn_attacks(void){
  for(int sq=0; sq<64; ++sq){
    uint64_t bb = 1ULL << sq;
    pawn_attacks[WHITE][sq] = ((bb >> 7) & NOT_A_FILE) | ((bb >> 9) & NOT_H_FILE);
    pawn_attacks[BLACK][sq] = ((bb << 7) & NOT_H_FILE) | ((bb << 9) & NOT_A_FILE);
  }
}
static void init_knight_attacks(void){
  for(int sq=0; sq<64; ++sq){
    int r=sq/8, f=sq%8; uint64_t bb=0;
    int dr[8]={-2,-1,1,2,2,1,-1,-2};
    int df[8]={ 1, 2,2,1,-1,-2,-2,-1};
    for(int i=0;i<8;i++){
      int nr=r+dr[i], nf=f+df[i];
      if(nr>=0&&nr<8&&nf>=0&&nf<8) bb |= 1ULL<<(nr*8+nf);
    }
    knight_attacks[sq]=bb;
  }
}
static void init_king_attacks(void){
  for(int sq=0; sq<64; ++sq){
    int r=sq/8, f=sq%8; uint64_t bb=0;
    for(int dr=-1; dr<=1; ++dr) for(int df=-1; df<=1; ++df){
      if(!dr && !df) continue;
      int nr=r+dr, nf=f+df;
      if(nr>=0&&nr<8&&nf>=0&&nf<8) bb |= 1ULL<<(nr*8+nf);
    }
    king_attacks[sq]=bb;
  }
}

// -------------- masks -> blockers --------------
static void get_blockers(Attack *a, uint64_t *blockers){
  int bits[64], n=0;
  for(int b=0;b<64;b++) if(a->mask & (1ULL<<b)) bits[n++]=b;
  for(int i=0;i<a->count;i++){
    uint64_t blk=0;
    for(int j=0;j<a->bits;j++) if(i&(1<<j)) blk |= 1ULL<<bits[j];
    blockers[i]=blk;
  }
}

// -------------- init sliders --------------
static void init_bishop_attacks(void){
  for(int sq=0; sq<64; ++sq){
    Attack *a=&bishop_attacks[sq];
    int r=sq/8, f=sq%8;
    a->mask=0;
    for(int rr=r+1,ff=f+1; rr<=6&&ff<=6; rr++,ff++) a->mask|=1ULL<<(rr*8+ff);
    for(int rr=r+1,ff=f-1; rr<=6&&ff>=1; rr++,ff--) a->mask|=1ULL<<(rr*8+ff);
    for(int rr=r-1,ff=f+1; rr>=1&&ff<=6; rr--,ff++) a->mask|=1ULL<<(rr*8+ff);
    for(int rr=r-1,ff=f-1; rr>=1&&ff>=1; rr--,ff--) a->mask|=1ULL<<(rr*8+ff);
    a->bits=popcount64(a->mask); a->shift=64-a->bits; a->count=1<<a->bits;
    a->attacks = (uint64_t*)malloc(a->count*sizeof(uint64_t));
    uint64_t *blk=(uint64_t*)malloc(a->count*sizeof(uint64_t));
    get_blockers(a, blk);
    for(int i=0;i<a->count;i++){
      uint64_t b=blk[i], atk=0;
      for(int rr=r+1,ff=f+1; rr<=7&&ff<=7; rr++,ff++){ int s=rr*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int rr=r+1,ff=f-1; rr<=7&&ff>=0; rr++,ff--){ int s=rr*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int rr=r-1,ff=f+1; rr>=0&&ff<=7; rr--,ff++){ int s=rr*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int rr=r-1,ff=f-1; rr>=0&&ff>=0; rr--,ff--){ int s=rr*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      a->attacks[i]=atk;
    }
    free(blk);
  }
}
static void init_rook_attacks(void){
  for(int sq=0; sq<64; ++sq){
    Attack *a=&rook_attacks[sq];
    int r=sq/8, f=sq%8; a->mask=0;
    for(int ff=f+1; ff<=6; ff++) a->mask|=1ULL<<(r*8+ff);
    for(int ff=f-1; ff>=1; ff--) a->mask|=1ULL<<(r*8+ff);
    for(int rr=r+1; rr<=6; rr++) a->mask|=1ULL<<(rr*8+f);
    for(int rr=r-1; rr>=1; rr--) a->mask|=1ULL<<(rr*8+f);
    a->bits=popcount64(a->mask); a->shift=64-a->bits; a->count=1<<a->bits;
    a->attacks = (uint64_t*)malloc(a->count*sizeof(uint64_t));
    uint64_t *blk=(uint64_t*)malloc(a->count*sizeof(uint64_t));
    get_blockers(a, blk);
    for(int i=0;i<a->count;i++){
      uint64_t b=blk[i], atk=0;
      for(int rr=r+1; rr<=7; rr++){ int s=rr*8+f; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int rr=r-1; rr>=0; rr--){ int s=rr*8+f; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int ff=f+1; ff<=7; ff++){ int s=r*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      for(int ff=f-1; ff>=0; ff--){ int s=r*8+ff; atk|=1ULL<<s; if(b&(1ULL<<s)) break; }
      a->attacks[i]=atk;
    }
    free(blk);
  }
}

// -------------- find magics --------------
static void find_magics(Attack a[64], const char *label){
  int v=0, total=0;
  if(v){ printf("%-2s %3s %12s %5s %-18s %4s\n","T","Sq","Tries","Bits","Magic","Fill");
         printf("-------------------------------------------------\n"); }
  for(int sq=0; sq<64; ++sq){
    Attack *t=&a[sq];
    uint64_t *blk=(uint64_t*)malloc(t->count*sizeof(uint64_t));
    get_blockers(t, blk);
    int tries=0;
    while(1){
      tries++;
      uint64_t magic = xorshift64star() & xorshift64star() & xorshift64star();
      if(popcount64((t->mask*magic)>>(64-t->bits)) < t->bits-2) continue;
      uint64_t *tab=(uint64_t*)calloc(t->count,sizeof(uint64_t));
      int fail=0, filled=0;
      for(int i=0;i<t->count;i++){
        int idx = magic_index(blk[i], magic, t->shift);
        uint64_t atk = t->attacks[i];
        if(tab[idx]==0){ tab[idx]=atk; filled++; }
        else if(tab[idx]!=atk){ fail=1; free(tab); break; }
      }
      if(!fail){
        t->magic=magic; free(t->attacks); t->attacks=tab;
        if(v){ int pct=(100*filled)/t->count; printf("%-2s %3d %12d %5d %016" PRIx64 " %5d%%\n",label,sq,tries,t->bits,magic,pct); }
        total+=tries; break;
      }
    }
    free(blk);
  }
  if(v){ printf("-------------------------------------------------\n"); printf("Total tries for %s: %d\n",label,total); }
}

// -------------- dump helpers --------------
static void w32(FILE *fp, uint32_t x){ if(fwrite(&x,4,1,fp)!=1){ perror("fwrite"); exit(1);} }
static void w64_as_2x32(FILE *fp, uint64_t v){ w32(fp,(uint32_t)(v & 0xFFFFFFFFu)); w32(fp,(uint32_t)(v>>32)); }

static void dump_table(FILE *fp, Attack t[64]){
  for(int sq=0; sq<64; ++sq){
    Attack *a=&t[sq];
    w32(fp,(uint32_t)a->bits);
    w32(fp,(uint32_t)a->shift);
    w64_as_2x32(fp, a->magic);
    w64_as_2x32(fp, a->mask);
    uint32_t n = 1u<<a->bits;
    for(uint32_t i=0;i<n;i++) w64_as_2x32(fp, a->attacks[i]);
  }
}
static void dump_jumpers_and_pawns(FILE *fp){
  for(int sq=0;sq<64;sq++) w64_as_2x32(fp, knight_attacks[sq]);
  for(int sq=0;sq<64;sq++) w64_as_2x32(fp, king_attacks[sq]);
  for(int c=0;c<2;c++) for(int sq=0;sq<64;sq++) w64_as_2x32(fp, pawn_attacks[c][sq]);
}

static void dump_all(const char* path){
  FILE *fp=fopen(path,"wb"); if(!fp){ perror("fopen"); exit(1); }
  dump_table(fp, rook_attacks);
  dump_table(fp, bishop_attacks);
  dump_jumpers_and_pawns(fp);
  fclose(fp);
}

// -------------- hashes for quick concordance --------------
static inline uint64_t fnv1a64_init(void){ return 0xcbf29ce484222325ULL; }
static inline uint64_t fnv1a64_push(uint64_t h, uint32_t x){ h^=(uint64_t)x; h*=0x100000001b3ULL; return h; }
static uint64_t hash_slider(Attack t[64]){
  uint64_t H=fnv1a64_init();
  for(int sq=0;sq<64;sq++){
    Attack *a=&t[sq];
    H=fnv1a64_push(H,(uint32_t)a->bits);
    H=fnv1a64_push(H,(uint32_t)a->shift);
    H=fnv1a64_push(H,(uint32_t)(a->magic & 0xFFFFFFFFu));
    H=fnv1a64_push(H,(uint32_t)(a->magic >> 32));
    uint32_t n=1u<<a->bits;
    for(uint32_t i=0;i<n;i++){
      uint64_t v=a->attacks[i];
      H=fnv1a64_push(H,(uint32_t)(v & 0xFFFFFFFFu));
      H=fnv1a64_push(H,(uint32_t)(v >> 32));
    }
  }
  return H;
}
static uint64_t hash_bb_array(const uint64_t *arr, int n){
  uint64_t H=fnv1a64_init();
  for(int i=0;i<n;i++){
    uint64_t v=arr[i];
    H=fnv1a64_push(H,(uint32_t)(v & 0xFFFFFFFFu));
    H=fnv1a64_push(H,(uint32_t)(v >> 32));
  }
  return H;
}
static uint64_t hash_pawns(void){
  uint64_t H=fnv1a64_init();
  for(int c=0;c<2;c++) for(int sq=0;sq<64;sq++){
    uint64_t v=pawn_attacks[c][sq];
    H=fnv1a64_push(H,(uint32_t)(v & 0xFFFFFFFFu));
    H=fnv1a64_push(H,(uint32_t)(v >> 32));
  }
  return H;
}

// -------------- main --------------
int main(void){
  init_pawn_attacks();
  init_knight_attacks();
  init_king_attacks();
  init_bishop_attacks();
  init_rook_attacks();
  find_magics(bishop_attacks, "B");
  find_magics(rook_attacks, "R");

  uint64_t HR = hash_slider(rook_attacks);
  uint64_t HB = hash_slider(bishop_attacks);
  uint64_t HK = hash_bb_array(knight_attacks, 64);
  uint64_t HKg= hash_bb_array(king_attacks, 64);
  uint64_t HP = hash_pawns();

  printf("Hash Rook 0x%016" PRIx64 " Bishop 0x%016" PRIx64 " Knight 0x%016" PRIx64 " King 0x%016" PRIx64 " Pawns 0x%016" PRIx64 "\n",
    HR, HB, HK, HKg, HP);

  dump_all("magics.bin");

  return 0;

}
