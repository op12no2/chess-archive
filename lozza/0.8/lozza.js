
var VERSION = '0.8';

//{{{  readme
/*

  Lozza - a simple javascript UCI chess engine.

  email:   colin@sailwave.com
  twitter: @op12no2
  Readme:  http://op12no2.me/posts/1641

*/

//}}}
//{{{  history

/*

19/06/14 v0.8

30/06/14 use simple arrays for piece counts and add colour counts.
30/06/14 Split runningEval into runningEvalS and runningEval E and combine in evaluate();
30/06/14 Inline various functions.

19/06/14 v0.7

27/06/14 Fix repetition detection at last.

19/06/14 v0.6

26/06/14 Base LMR on the move base.
26/06/14 Just use > alpha for LMR research.
26/06/14 Fix hash update bugs.
26/06/14 move mate distance and rep check tests to pre horizon.
26/06/14 Only extend at root and if depth below horizon.
26/06/14 Remove lone king stuff.

19/06/14 v0.5

24/06/14 Mate distance pruning.
24/06/14 No LMR if lone king.

19/06/14 v0.4

21/06/14 No null move if a lone king on the board.
21/06/14 Add detection of insufficient material draws.
21/06/14 Add very primitive king safety to eval.
21/06/14 Change pCounts into wCount and bCount.
19/06/14 Set contempt to 0.
19/06/14 Fix fail soft QS bug on beta cut.

28/05/14 v0.3

06/06/14 Facilitate N messages in one UCI message string.
28/05/14 Fix bug where search() and alphabeta() returned -INFINITY instead of oAlpha.
28/05/14 Adjust MATE score in TT etc.

28/05/14 v0.2

24/05/14 Allow futility to filter all moves and return oAlpha in that case.
24/05/14 Fix infinite loops when showing PV.
24/05/14 Fix mate killer addition condition.
24/05/14 Generalise bishop counting using board.pCounts.
24/05/14 Don't allow a killer to be the (current) hash.
24/05/14 Don't research ALL node LMR fails unless R is set!
24/05/14 Arrange things so that QS doesn't use or affect node killers/hashes etc.  In tests it's less nodes.
23/05/14 Increase asp window and add time on ID research.
23/05/14 Add crude bishop pair bonus imp.  NB: updating a piece count array using a[i]++ and a[i]-- was too slow!!
23/05/14 Use tapered PSTs.

23/05/14 v0.1

23/05/14 Fix bug in QS.  It *must not* fail soft.

*/

//}}}
//{{{  seed
//
// seedrandom.js version 2.3.4
// Author: David Bau
// Date: 2014 Mar 9
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
// Can be used as a node.js or AMD module.  Can be called with "new"
// to create a local PRNG without changing Math.random.
//
// Basic usage:
//
//   <script src=http://davidbau.com/encode/seedrandom.min.js></script>
//
//   Math.seedrandom('yay.');  // Sets Math.random to a function that is
//                             // initialized using the given explicit seed.
//
//   Math.seedrandom();        // Sets Math.random to a function that is
//                             // seeded using the current time, dom state,
//                             // and other accumulated local entropy.
//                             // The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             // Seeds using the given explicit seed mixed
//                             // together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 <!-- Seeds using urandom bits from a server. -->
//
//   Math.seedrandom("hello.");           // Behavior is the same everywhere:
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//
// Math.seedrandom can be used as a constructor to return a seeded PRNG
// that is independent of Math.random:
//
//   var myrng = new Math.seedrandom('yay.');
//   var n = myrng();          // Using "new" creates a local prng without
//                             // altering Math.random.
//
// When used as a module, seedrandom is a function that returns a seeded
// PRNG instance without altering Math.random:
//
//   // With node.js (after "npm install seedrandom"):
//   var seedrandom = require('seedrandom');
//   var rng = seedrandom('hello.');
//   console.log(rng());                  // always 0.9282578795792454
//
//   // With require.js or other AMD loader:
//   require(['seedrandom'], function(seedrandom) {
//     var rng = seedrandom('hello.');
//     console.log(rng());                // always 0.9282578795792454
//   });
//
// More examples:
//
//   var seed = Math.seedrandom();        // Use prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   var rng = new Math.seedrandom(seed); // A new prng with the same seed.
//   document.write(rng());               // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// The callback third arg can be used to get both the prng and the seed.
// The following returns both an autoseeded prng and the seed as an object,
// without mutating Math.random:
//
//   var obj = Math.seedrandom(null, false, function(prng, seed) {
//     return { random: prng, seed: seed };
//   });
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// * Version 2.0 changed the sequence for non-string seeds.
// * Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
// * Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
// * Version 2.3 adds support for "new", module loading, and a null seed arg.
// * Version 2.3.1 adds a build environment, module packaging, and tests.
// * Version 2.3.3 fixes bugs on IE8, and switches to MIT license.
// * Version 2.3.4 fixes documentation to contain the MIT license.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args or a null seed, it uses a
// seed drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is several
// times slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
//
// Autoseeding without crypto is somewhat slower, about 20-30 milliseconds on
// a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera.
// Seeded rng calls themselves are fast across these browsers, with slowest
// numbers on Opera at about 0.0005 ms per seeded Math.random().
//
// LICENSE (MIT):
//
// Copyright (c)2014 David Bau.
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits, module, define, rngname) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,

//
// seedrandom()
// This is the seedrandom function described above.
//
impl = math['seed' + rngname] = function(seed, use_entropy, callback) {
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (callback ||
      // If called as a method of Math (Math.seedrandom()), mutate Math.random
      // because that is how seedrandom.js has worked since v1.0.  Otherwise,
      // it is a newer calling convention, so return the prng directly.
      function(prng, seed, is_math_call) {
        if (is_math_call) { math[rngname] = prng; return seed; }
        else return prng;
      })(

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  }, shortseed, this == math);
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array|Navigator=} seed */
function autoseed(seed) {
  try {
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global, (seed = global.navigator) && seed.plugins,
            global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math[rngname](), pool);

//
// Nodejs and AMD support: export the implemenation as a module using
// either convention.
//
if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
}

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52,     // digits: there are 52 significant digits in a double
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define,  // present with an AMD loader
  'random'// rngname: name for Math.random and Math.seedrandom
);

Math.seedrandom('Lozza rules OK');  //always generates the same sequence of PRNs

//}}}
//{{{  constants

var MAX_PLY   = 100;                // limited by lozza.board.ttDepth.
var MAX_MOVES = 100;                // reasonable?
var INFINITY  = 30000;              // limited by lozza.board.ttScore.
var MATE      = 20000;
var MINMATE   = MATE - 2*MAX_PLY;
var CONTEMPT  = 0;

var WHITE = 0x0;                    // toggle these with:        ~turn & COLOR_MASK
var BLACK = 0x8;                    // get +/- 1 (W/B) with:     (-turn >> 31) | 1
                                    // get 0/1 (W/B) index with: turn >>> 3
var PIECE_MASK = 0x7;
var COLOR_MASK = 0x8;

var TT_EMPTY  = 0;
var TT_EXACT  = 1;
var TT_BETA   = 2;
var TT_ALPHA  = 3;

var MOVE_TO_BITS      = 0;
var MOVE_FR_BITS      = 8;
var MOVE_TOOBJ_BITS   = 16;
var MOVE_FROBJ_BITS   = 20;
var MOVE_PROMAS_BITS  = 29;

var MOVE_TO_MASK       = 0x000000FF;
var MOVE_FR_MASK       = 0x0000FF00;
var MOVE_TOOBJ_MASK    = 0x000F0000;
var MOVE_FROBJ_MASK    = 0x00F00000;
var MOVE_PAWN_MASK     = 0x01000000;
var MOVE_EPTAKE_MASK   = 0x02000000;
var MOVE_EPMAKE_MASK   = 0x04000000;
var MOVE_CASTLE_MASK   = 0x08000000;
var MOVE_PROMOTE_MASK  = 0x10000000;
var MOVE_PROMAS_MASK   = 0x60000000;  // NBRQ.
var MOVE_SPARE2_MASK   = 0x80000000;

var MOVE_SPECIAL_MASK  = MOVE_CASTLE_MASK | MOVE_EPTAKE_MASK | MOVE_EPMAKE_MASK | MOVE_PROMOTE_MASK; // need extra work in make move.

var NULL   = 0x0;
var PAWN   = 0x1;
var KNIGHT = 0x2;
var BISHOP = 0x3;
var ROOK   = 0x4;
var QUEEN  = 0x5;
var KING   = 0x6;
var EDGE   = 0x7;

var W_PAWN   = PAWN;
var W_KNIGHT = KNIGHT;
var W_BISHOP = BISHOP;
var W_ROOK   = ROOK;
var W_QUEEN  = QUEEN;
var W_KING   = KING;

var B_PAWN   = PAWN   | BLACK;
var B_KNIGHT = KNIGHT | BLACK;
var B_BISHOP = BISHOP | BLACK;
var B_ROOK   = ROOK   | BLACK;
var B_QUEEN  = QUEEN  | BLACK;
var B_KING   = KING   | BLACK;

var PPHASE = 0;
var NPHASE = 1;
var BPHASE = 1;
var RPHASE = 2;
var QPHASE = 4;
var VPHASE = [0,PPHASE,NPHASE,BPHASE,RPHASE,QPHASE,0];
var TPHASE = PPHASE*16 + NPHASE*4 + BPHASE*4 + RPHASE*4 + QPHASE*2;
var EPHASE = 180;

var A1 = 110;
var B1 = 111;
var C1 = 112;
var D1 = 113;
var E1 = 114;
var F1 = 115;
var G1 = 116;
var H1 = 117;

var A8 = 26;
var B8 = 27;
var C8 = 28;
var D8 = 29;
var E8 = 30;
var F8 = 31;
var G8 = 32;
var H8 = 33;

var MOVE_E1G1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | G1;
var MOVE_E1C1 = MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | C1;
var MOVE_E8G8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | G8;
var MOVE_E8C8 = MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | C8;

var WHITE_RIGHTS_KING  = 0x00000001;
var WHITE_RIGHTS_QUEEN = 0x00000002;
var BLACK_RIGHTS_KING  = 0x00000004;
var BLACK_RIGHTS_QUEEN = 0x00000008;
var SPARE1_RIGHTS_MASK = 0x000000F0;
var WKSQ_RIGHTS_MASK   = 0x0000FF00;  // we can manipulate the turn colour (0,0x8) generically to
var BKSQ_RIGHTS_MASK   = 0x00FF0000;  // generate the required shift by col+BLACK: 0->8, 8->16
var SPARE2_RIGHTS_MASK = 0xFF000000;  // ep could go in here.

var WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
var BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;
var ALL_RIGHTS         = BLACK_RIGHTS | WHITE_RIGHTS;

var WP_OFFSET_ORTH  = -12;
var WP_OFFSET_DIAG1 = -13;
var WP_OFFSET_DIAG2 = -11;

var BP_OFFSET_ORTH  = 12;
var BP_OFFSET_DIAG1 = 13;
var BP_OFFSET_DIAG2 = 11;

var KNIGHT_OFFSETS = [25,-25,23,-23,14,-14,10,-10];
var BISHOP_OFFSETS = [11,-11,13,-13];
var ROOK_OFFSETS   =               [1,-1,12,-12];
var QUEEN_OFFSETS  = [11,-11,13,-13,1,-1,12,-12]; // must be diag then orth - see isAttacked.
var KING_OFFSETS   = [11,-11,13,-13,1,-1,12,-12];

var OFFSETS = [0,0,KNIGHT_OFFSETS,BISHOP_OFFSETS,ROOK_OFFSETS,QUEEN_OFFSETS,KING_OFFSETS];
var LIMITS  = [0,1,1,8,8,8,1];

//
// PSTs based on http://chessprogramming.wikispaces.com/Simplified+evaluation+function
//

var VALUE_PAWN   = 100;
var VALUE_QUEEN  = 975;
var VALUE_VECTOR = [0,VALUE_PAWN,325,325,500,VALUE_QUEEN,10000];
var RANK_VECTOR  = [0,1,         2,  2,  4,  5,          6];  // for move sorting.

var NULL_PST = [0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0];

var WPAWN_PST = [0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                 0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                 0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                 0, 0, 50, 50, 50,  50,  50,  50,  50, 50, 0, 0,
                 0, 0, 10, 10, 20,  30,  30,  20,  10, 10, 0, 0,
                 0, 0, 5,  5,  10,  25,  25,  10,  5,  5,  0, 0,
                 0, 0, 0,  0,  0,   20,  20,  0,   0,  0,  0, 0,
                 0, 0, 5,  -5, -10, 0,   0,   -10, -5, 5,  0, 0,
                 0, 0, 5,  10, 10,  -20, -20, 10,  10, 5,  0, 0,
                 0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                 0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                 0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0];

var WPAWN_PST2 = [0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, 80, 80, 80,  80,  80,  80,  80, 80, 0, 0,
                  0, 0, 60, 60, 60,  60,  60,  60,  60, 60, 0, 0,
                  0, 0, 40, 40, 40,  40,  40,  40,  40, 40, 0, 0,
                  0, 0, 20, 20, 20,  20,  20,  20,  20, 20, 0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, -20,-20,-20, -20, -20, -20, -20,-20,0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0,
                  0, 0, 0,  0,  0,   0,   0,   0,   0,  0,  0, 0];


var WKNIGHT_PST = [0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, -50, -40, -30, -30, -30, -30, -40, -50, 0, 0,
                   0, 0, -40, -20, 0,   0,   0,   0,   -20, -40, 0, 0,
                   0, 0, -30, 0,   10,  15,  15,  10,   0,  -30, 0, 0,
                   0, 0, -30, 5,   15,  20,  20,  15,   5,  -30, 0, 0,
                   0, 0, -30, 0,   15,  20,  20,  15,   0,  -30, 0, 0,
                   0, 0, -30, 5,   10,  15,  15,  10,   5,  -30, 0, 0,
                   0, 0, -40, -20, 0,   5,   5,   0,   -20, -40, 0, 0,
                   0, 0, -50, -40, -30, -30, -30, -30, -40, -50, 0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0];

var WBISHOP_PST =  [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   -20, -10, -10, -10, -10, -10, -10, -20, 0,   0,
                    0,   0,   -10, 0,   0,   0,   0,   0,    0,  -10, 0,   0,
                    0,   0,   -10, 0,   5,   10,  10,  5,    0,  -10, 0,   0,
                    0,   0,   -10, 5,   5,   10,  10,  5,    5,  -10, 0,   0,
                    0,   0,   -10, 0,   10,  10,  10,  10,   0,  -10, 0,   0,
                    0,   0,   -10, 10,  10,  10,  10,  10,   10, -10, 0,   0,
                    0,   0,   -10, 5 ,  0,   0,   0,   0,    5,  -10, 0,   0,
                    0,   0,   -20, -10, -10, -10, -10, -10, -10, -20, 0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WROOK_PST =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   5,   10,  10,  10,  10,  10,  10,  5,   0,   0,
                    0,   0,   -5,  0,   0,   0,   0,   0,   0,   -5,  0,   0,
                    0,   0,   -5,  0,   0,   0,   0,   0,   0,   -5,  0,   0,
                    0,   0,   -5,  0,   0,   0,   0,   0,   0,   -5,  0,   0,
                    0,   0,   -5,  0,   0,   0,   0,   0,   0,   -5,  0,   0,
                    0,   0,   -5,  0,   0,   0,   0,   0,   0,   -5,  0,   0,
                    0,   0,   0,   0,   0,   5,   5,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WQUEEN_PST =   [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   -20, -10, -10, -5,  -5,  -10, -10, -20, 0,   0,
                    0,   0,   -10, 0,   0,   0,   0,   0,    0,  -10, 0,   0,
                    0,   0,   -10, 0,   5,   5,   5,   5,    0,  -10, 0,   0,
                    0,   0,   -5,  0,   5,   5,   5,   5,    0,  -5,  0,   0,
                    0,   0,   0,   0,   5,   5,   5,   5,    0,  -5,  0,   0,
                    0,   0,   -10, 5,   5,   5,   5,   5,    0,  -10, 0,   0,
                    0,   0,   -10, 0,   5,   0,   0,   0,    0,  -10, 0,   0,
                    0,   0,   -20, -10, -10, -5,  -5,  -10, -10, -20, 0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0];

var WKING_PST =    [0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                    0,   0,   -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                    0,   0,   -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                    0,   0,   -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                    0,   0,   -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                    0,   0,   -20, -30, -30, -40, -40, -30, -30, -20, 0, 0,
                    0,   0,   -10, -20, -20, -20, -20, -20, -20, -10, 0, 0,
                    0,   0,   20,  20,  0,   0,   0,   0,   20,  20,  0, 0,
                    0,   0,   20,  30,  10,  0,   0,   10,  30,  20,  0, 0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0, 0];

var WKING_PST2 = [0,0,0,  0,  0,  0,  0,  0,  0,  0,  0,0,
                  0,0,0,  0,  0,  0,  0,  0,  0,  0,  0,0,
                  0,0,-50,-40,-30,-20,-20,-30,-40,-50,0,0,
                  0,0,-30,-20,-10,  0,  0,-10,-20,-30,0,0,
                  0,0,-30,-10, 20, 30, 30, 20,-10,-30,0,0,
                  0,0,-30,-10, 30, 40, 40, 30,-10,-30,0,0,
                  0,0,-30,-10, 30, 40, 40, 30,-10,-30,0,0,
                  0,0,-30,-10, 20, 30, 30, 20,-10,-30,0,0,
                  0,0,-30,-30,  0,  0,  0,  0,-30,-30,0,0,
                  0,0,-50,-30,-30,-30,-30,-30,-30,-50,0,0,
                  0,0,0,  0,  0,  0,  0,  0,  0,  0,  0,0,
                  0,0,0,  0,  0,  0,  0,  0,  0,  0,  0,0];

function pst2Black (from,to) {
  for (var i=0; i < 12; i++) {
    var frbase = i*12;
    var tobase = (11-i)*12;
    for (var j=0; j < 12; j++)
      to[tobase+j] = from[frbase+j];
  }
}

var BPAWN_PST   = Array(144);
var BPAWN_PST2  = Array(144);
var BKNIGHT_PST = Array(144);
var BBISHOP_PST = Array(144);
var BROOK_PST   = Array(144);
var BQUEEN_PST  = Array(144);
var BKING_PST   = Array(144);
var BKING_PST2  = Array(144);

pst2Black(WPAWN_PST,   BPAWN_PST);
pst2Black(WPAWN_PST2,  BPAWN_PST2);
pst2Black(WKNIGHT_PST, BKNIGHT_PST);
pst2Black(WBISHOP_PST, BBISHOP_PST);
pst2Black(WROOK_PST,   BROOK_PST);
pst2Black(WQUEEN_PST,  BQUEEN_PST);
pst2Black(WKING_PST,   BKING_PST);
pst2Black(WKING_PST2,  BKING_PST2);

var WS_PST = [NULL_PST, WPAWN_PST,   WKNIGHT_PST, WBISHOP_PST, WROOK_PST, WQUEEN_PST, WKING_PST];
var WE_PST = [NULL_PST, WPAWN_PST2,  WKNIGHT_PST, WBISHOP_PST, WROOK_PST, WQUEEN_PST, WKING_PST2];

var BS_PST = [NULL_PST, BPAWN_PST,   BKNIGHT_PST, BBISHOP_PST, BROOK_PST, BQUEEN_PST, BKING_PST];
var BE_PST = [NULL_PST, BPAWN_PST2,  BKNIGHT_PST, BBISHOP_PST, BROOK_PST, BQUEEN_PST, BKING_PST2];

var B88 = [26, 27, 28, 29, 30, 31, 32, 33,
           38, 39, 40, 41, 42, 43, 44, 45,
           50, 51, 52, 53, 54, 55, 56, 57,
           62, 63, 64, 65, 66, 67, 68, 69,
           74, 75, 76, 77, 78, 79, 80, 81,
           86, 87, 88, 89, 90, 91, 92, 93,
           98, 99, 100,101,102,103,104,105,
           110,111,112,113,114,115,116,117];

var COORDS = ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
              '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
              '??', '??', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', '??', '??',
              '??', '??', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', '??', '??',
              '??', '??', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', '??', '??',
              '??', '??', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', '??', '??',
              '??', '??', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', '??', '??',
              '??', '??', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', '??', '??',
              '??', '??', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', '??', '??',
              '??', '??', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', '??', '??',
              '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
              '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

var NAMES = ['-','P','N','B','R','Q','K','-'];

var RANK = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
            0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
            0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
            0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
            0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
            0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
            0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var FILE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//}}}

//{{{  lozChess class

//{{{  lozChess

function lozChess () {

  this.nodes = Array(MAX_PLY);

  var parentNode = null;
  for (var i=0; i < this.nodes.length; i++) {
    this.nodes[i] = new lozNode(parentNode);
    this.nodes[i].ply = i;
    parentNode = this.nodes[i];
    if (i == 0)
      this.nodes[i].root = true;
    else
      this.nodes[i].root = false;
  }

  this.board = new lozBoard();
  this.stats = new lozStats();
  this.uci   = new lozUCI();
  this.test  = new lozTest();

  this.log = {};
  this.pos = {};

  this.rootNode = this.nodes[0];

  return this;
}

//}}}
//{{{  .init

lozChess.prototype.init = function () {

  this.log = {};

  this.log.ttHits     = 0;
  this.log.ttMisses   = 0;
  this.log.ttCollide  = 0;
  this.log.zwHits     = 0;
  this.log.zwMisses   = 0;
  this.log.killMisses = 0;
  this.log.killHits   = 0;

  for (var i=0; i < this.nodes.length; i++) {
    this.nodes[i].init();
  }

  this.board.init();
  this.stats.init();
}

//}}}
//{{{  .position

lozChess.prototype.position = function (pos) {

  this.pos = pos;
  this.initFromPosition();
}

//}}}
//{{{  .initFromPosition

lozChess.prototype.initFromPosition = function () {

  this.init();

  var board = lozza.board;

  board.id = this.pos.id;

  //{{{  board turn
  
  if (this.pos.turn == 'w')
    board.turn = WHITE;
  
  else {
    board.turn = BLACK;
    board.loHash ^= board.loTurn;
    board.hiHash ^= board.hiTurn;
  }
  
  //}}}
  //{{{  board rights
  
  board.rights = 0;
  
  for (var i=0; i < this.pos.rights.length; i++) {
  
    var ch = this.pos.rights.charAt(i);
  
    if (ch == 'K') board.rights |= WHITE_RIGHTS_KING;
    if (ch == 'Q') board.rights |= WHITE_RIGHTS_QUEEN;
    if (ch == 'k') board.rights |= BLACK_RIGHTS_KING;
    if (ch == 'q') board.rights |= BLACK_RIGHTS_QUEEN;
  }
  
  board.loHash ^= board.loRights[board.rights & ALL_RIGHTS];
  board.hiHash ^= board.hiRights[board.rights & ALL_RIGHTS];
  
  //}}}
  //{{{  board board
  
  var map = [];
  
  map['p'] = B_PAWN;
  map['n'] = B_KNIGHT;
  map['b'] = B_BISHOP;
  map['r'] = B_ROOK;
  map['q'] = B_QUEEN;
  map['k'] = B_KING;
  map['P'] = W_PAWN;
  map['N'] = W_KNIGHT;
  map['B'] = W_BISHOP;
  map['R'] = W_ROOK;
  map['Q'] = W_QUEEN;
  map['K'] = W_KING;
  
  board.b = [EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,
             EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,EDGE,EDGE,
             EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,
             EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE,EDGE];
  
  board.phase = TPHASE;
  
  var i = 0;
  for (var j=0; j < this.pos.board.length; j++) {
    var ch  = this.pos.board.charAt(j);
    var chn = parseInt(ch);
    while (board.b[i] == EDGE)
      i++;
    if (isNaN(chn)) {
      if (ch != '/') {
  
        board.b[i] = map[ch];
  
        var obj   = board.b[i];
        var piece = obj & PIECE_MASK;
        var col   = obj & COLOR_MASK;
  
        if (col == WHITE) {
          board.wCounts[piece]++;
          board.wCount++;
        }
        else {
          board.bCounts[piece]++;
          board.bCount++;
        }
  
        board.loHash ^= board.loPieces[col>>>3][piece-1][i];
        board.hiHash ^= board.hiPieces[col>>>3][piece-1][i];
  
        board.phase -= VPHASE[piece];
  
        if (obj == W_KING)
          board.rights |= i << BLACK;
        if (obj == B_KING)
          board.rights |= i << BLACK*2;
  
        i++;
      }
    }
    else {
      for (var k=0; k < chn; k++) {
        board.b[i] = 0;
        i++;
      }
    }
  }
  
  //}}}
  //{{{  board ep
  
  if (this.pos.ep.length == 2)
    board.ep = COORDS.indexOf(this.pos.ep)
  else
    board.ep = 0;
  
  board.loHash ^= board.loEP[board.ep];
  board.hiHash ^= board.hiEP[board.ep];
  
  //}}}

  //{{{  init evals
  
  board.runningEvalS = 0;
  board.runningEvalE = 0;
  
  for (var sq8=0; sq8 < 64; sq8++) {
  
    var sq = B88[sq8];
    var p  = board.b[sq];
  
    if (p == NULL)
      continue;
  
    var pCol  = p & COLOR_MASK;
    var pType = p & PIECE_MASK;
  
    if (pCol == WHITE) {
      board.runningEvalS += VALUE_VECTOR[pType];
      board.runningEvalS += WS_PST[pType][sq];
      board.runningEvalE += VALUE_VECTOR[pType];
      board.runningEvalE += WE_PST[pType][sq];
    }
    else {
      board.runningEvalS -= VALUE_VECTOR[pType];
      board.runningEvalS -= BS_PST[pType][sq];
      board.runningEvalE -= VALUE_VECTOR[pType];
      board.runningEvalE -= BE_PST[pType][sq];
    }
  }
  
  //}}}

  for (var i=0; i < this.pos.moves.length; i++) {
    this.playMove(this.pos.moves[i], board.turn);
    board.turn = ~board.turn & COLOR_MASK;
  }
}

//}}}
//{{{  .id

lozChess.prototype.id = function (id) {

  lozza.board.id = id;
}

//}}}
//{{{  .go

var ASP_MAX   = 75;
var ASP_DELTA = 3;
var ASP_MIN   = 10;

lozChess.prototype.go = function(spec) {

  var board = this.board;

  //{{{  sort out spec
  
  if (spec.depth <= 0)
    spec.depth = MAX_PLY;
  
  if (spec.moveTime > 0)
    this.stats.moveTime = spec.moveTime;
  
  if (spec.maxNodes > 0)
    this.stats.maxNodes = spec.maxNodes;
  
  if (spec.moveTime == 0) {
  
    if (spec.movesToGo > 0)
      var movesToGo = spec.movesToGo + 3;  //buffer
    else
      var movesToGo = 20;                  //hack - can do better then this based on game stage
  
    if (board.turn == WHITE) {
      var remTime = spec.wTime + movesToGo * spec.wInc;
    }
    else {
      var remTime = spec.bTime + movesToGo * spec.bInc;
    }
  
    if (remTime > 0)
      this.stats.moveTime = Math.round(remTime / movesToGo);
  }
  
  //}}}

  var alpha       = -INFINITY;
  var beta        = INFINITY;
  var asp         = ASP_MAX;
  var ply         = 1;
  var maxPly      = spec.depth;
  var move        = 0;
  var bestMove    = 0;
  var bestMoveStr = '';
  var score       = 0;

  while (ply <= maxPly) {

    this.stats.ply = ply;

    score = this.search(this.rootNode, ply, board.turn, alpha, beta);

    move = board.ttGetMove(this.rootNode);
    if (move)
      bestMove = move;

    if (this.stats.timeOut) {
      break;
    }

    if (score <= alpha || score >= beta) {
      //{{{  research
      
      this.uci.debug(board.id,'asp win research depth', ply, 'alpha', alpha, 'score', score, 'beta', beta);
      
      alpha = -INFINITY;
      beta  = INFINITY;
      asp   = ASP_MAX * 10;
      
      if (this.stats.moveTime)
        this.stats.moveTime += 250;
      
      continue;
      
      //}}}
    }

    if (score >= MINMATE && score <= MATE) {
      break;
    }

    alpha = score - asp;
    beta  = score + asp;

    asp -= ASP_DELTA;
    if (asp < ASP_MIN)
      asp = ASP_MIN;

    ply += 1;

    this.stats.update();
  }

  //{{{  show dev logs
  
  var l = this.log;
  
  //this.uci.debug (board.id,'depth',ply,'TT','hits',l.ttHits,'misses',l.ttMisses,'hit rate',l.ttHits/(l.ttMisses+l.ttHits),'collisions',l.ttCollide/(l.ttMisses+l.ttHits));
  //this.uci.debug (board.id,'depth',ply,'ZW','hits',l.zwHits,'misses',l.zwMisses,'research rate',l.zwMisses/(l.zwHits+l.zwMisses));
  //this.uci.debug (board.id,'depth',ply,'KILL','hits',l.killHits,'misses',l.killMisses,'hit rate',l.killHits/(l.killHits+l.killMisses));
  
  board.evaluate(board.turn);
  
  var wBP = board.wCounts[BISHOP];
  var bBP = board.bCounts[BISHOP];
  
  this.uci.debug (board.id,'depth',ply,'PHASE',board.gPhase,wBP,bBP,board.wCount,board.bCount);
  
  //}}}

  this.stats.update();
  this.stats.stop();

  bestMoveStr = board.formatMove(bestMove);

  this.uci.send('bestmove',bestMoveStr);

  this.uci.debug(board.id,'|',spec.depth,'ply','|',this.stats.nodesMega,'Mn','|',this.stats.timeSec,'sec','|',bestMoveStr);
  this.uci.debug('');
}

//}}}
//{{{  .search

var KEEPER_MASK = MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_TOOBJ_MASK;

lozChess.prototype.search = function (node, depth, turn, alpha, beta) {

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('S DEPTH');
    this.stats.timeOut = 1;
    return;
  }
  
  //}}}

  this.stats.nodes++;

  var board          = this.board;
  var nextTurn       = ~turn & COLOR_MASK;
  var oAlpha         = alpha;
  var numLegalMoves  = 0;
  var move           = 0;
  var bestMove       = 0;
  var score          = 0;
  var bestScore      = -INFINITY;
  var inCheck        = board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn);
  var R              = 0;
  var givesCheck     = 0;
  var alphaMate      = (alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE);
  var betaMate       = (beta  <= -MINMATE && beta  >= -MATE) || (beta  >= MINMATE && beta  <= MATE);
  var lmrs           = 0;

  depth = (inCheck) ? depth + 1 : depth;

  var doLMR = depth >= 3 && !inCheck && !betaMate;

  node.cache();

  board.ttGet(node, depth, alpha, beta);  // load hash move.

  board.genMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(move);

    //{{{  legal?
    
    if (move != node.hashMove && board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn)) {
    
      board.unmakeMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;

    //{{{  send current move to UCI
    
    if (this.stats.splits > 3) {
    
      this.uci.send('info currmove ' + board.formatMove(move) + ' currmovenumber ' + numLegalMoves);
    }
    
    //}}}
    //{{{  LMR?
    
    R = 0;
    
    if (node.base < BASE_LMR)
      lmrs += 1;
    
    if (depth >= 3 && !inCheck && !betaMate && !alphaMate && lmrs > 10) {
    
      givesCheck = board.isAttacked((board.rights >>> nextTurn+BLACK) & 0xFF, turn);
    
      if (!givesCheck) {
        R = 1;
        if (lmrs > 20 && depth > 5)
          R = 2;
      }
    }
    
    //}}}

    if (numLegalMoves == 1)
      score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
    else {
      score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -alpha-1, -alpha);
      if (!this.stats.timeOut && score > alpha) {
        this.log.zwMisses++;
        score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
      }
      else
        this.log.zwHits++;
    }

    //{{{  unmake move
    
    board.unmakeMove(move);
    
    node.uncache();
    
    //}}}

    if (this.stats.timeOut) {
      return;
    }

    if (score > bestScore) {
      if (score > alpha) {
        if (score >= beta) {
          node.addKiller(depth, score, move);
          board.ttPut(TT_BETA, depth, score, move, node.ply);
          return score;
        }
        alpha     = score;
        alphaMate = (alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE);
        board.ttPut(TT_ALPHA, depth, score, move, node.ply);
        this.uci.send('info depth',this.stats.ply,'score cp',score,'pv',this.getPVStr(node));
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  if (numLegalMoves == 1) {
    this.stats.timeOut = 1;
  }

  if (bestScore > oAlpha) {
    board.ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply);
    return bestScore;
  }
  else {
    board.ttPut(TT_ALPHA, depth, oAlpha,    bestMove, node.ply);
    return oAlpha;
  }
}

//}}}
//{{{  .alphabeta

lozChess.prototype.alphabeta = function (node, depth, turn, alpha, beta, nullOK) {

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('AB DEPTH');
    this.stats.timeOut = 1;
  }
  
  if (depth > 2 || this.stats.timeOut) {
    this.stats.lazyUpdate();
    if (this.stats.timeOut)
      return;
  }
  
  //}}}

  var board = this.board;

  //{{{  mate distance pruning
  
  var matingValue = MATE - node.ply;
  
  if (matingValue < beta) {
     beta = matingValue;
     if (alpha >= matingValue)
       return matingValue;
  }
  
  var matingValue = -MATE + node.ply;
  
  if (matingValue > alpha) {
     alpha = matingValue;
     if (beta <= matingValue)
       return matingValue;
  }
  
  //}}}
  //{{{  check for draws
  
  for (var i=board.repHi-5; i >= board.repLo; i -= 2) {
  
    if (board.rep[i][0] == board.loHash && board.rep[i][1] == board.hiHash) {
      return CONTEMPT;
    }
  }
  
  //}}}

  var nextTurn = ~turn & COLOR_MASK;
  var score    = 0;
  var inCheck  = board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn);

  depth = (inCheck && depth <= 0) ? 1 : depth;

  //{{{  horizon?
  
  if (depth <= 0) {
  
    //score = board.ttGet(node, 0, alpha, beta);
  
    //if (score != undefined)
      //return score;
  
    score = this.qSearch(node, depth-1, turn, alpha, beta);
  
    return score;
  }
  
  //}}}

  this.stats.nodes++;

  //{{{  try tt
  
  score = board.ttGet(node, depth, alpha, beta);
  
  if (score != undefined) {
    return score;
  }
  
  //}}}

  var betaMate = (beta <= -MINMATE && beta >= -MATE) || (beta >= MINMATE && beta <= MATE);
  var pvNode   = beta != (alpha + 1);
  var standPat = board.evaluate(turn);
  var R        = 0;

  node.cache();

  //{{{  try null move
  //
  //  The parent node passes in nullOK == false if it did a null
  //  move.  It will be undefined otherwise, so we can do one.
  //
  
  R = 3;
  
  if (!pvNode && standPat > beta && !betaMate && nullOK !== false && !inCheck) {
  
    board.loHash ^= board.loEP[board.ep];
    board.hiHash ^= board.hiEP[board.ep];
  
    board.ep = 0; // what else?
  
    board.loHash ^= board.loEP[board.ep];
    board.hiHash ^= board.hiEP[board.ep];
  
    board.loHash ^= board.loTurn;
    board.hiHash ^= board.hiTurn;
  
    score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -beta, -beta+1, false);  // no null.
  
    node.uncache();
  
    if (this.stats.timeOut)
      return;
  
    if (score >= beta) {
      //board.ttPut(TT_BETA, depth, score, 0, node.ply);
      return score;
    }
  }
  
  R = 0;
  
  //}}}

  var bestScore      = -INFINITY;
  var move           = 0;
  var bestMove       = 0;
  var oAlpha         = alpha;
  var alphaMate      = (alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE);
  var futility       = !inCheck && (standPat + 10 + depth*40 < alpha);
  var numLegalMoves  = 0;
  var givesCheck     = undefined;
  var lmrs           = 0;
  var doLMR          = depth >= 3 && !inCheck && !betaMate;

  //{{{  IID
  
  if (!node.hashMove && pvNode && depth > 3) {
    this.alphabeta(node.childNode, depth-2, turn, alpha, beta, false);
    board.ttGet(node, 0, alpha, beta);
  }
  
  //}}}

  board.genMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(move);

    //{{{  legal?
    
    if (move != node.hashMove && board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn)) {
    
      board.unmakeMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    numLegalMoves++;

    //{{{  futile?
    
    givesCheck = undefined;
    
    if (futility && !alphaMate && !(pvNode && numLegalMoves == 1) && !(move & KEEPER_MASK)) {
    
      givesCheck = board.isAttacked((board.rights >>> nextTurn+BLACK) & 0xFF, turn);
    
      if (!givesCheck) {
    
        board.unmakeMove(move);
    
        node.uncache();
    
        continue;
      }
    }
    
    //}}}
    //{{{  LMR?
    
    R = 0;
    
    if (node.base < BASE_LMR)
      lmrs += 1;
    
    if (doLMR && !alphaMate && lmrs > 5) {
    
      if (givesCheck == undefined)
        givesCheck = board.isAttacked((board.rights >>> nextTurn+BLACK) & 0xFF, turn);
    
      if (!givesCheck) {
        R = 1;
        if (lmrs > 20 && depth > 5)
          R = 2;
      }
    }
    
    //}}}

    if (pvNode) {
      if (numLegalMoves == 1)
        score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
      else {
        score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -alpha-1, -alpha);
        if (!this.stats.timeOut && score > alpha) {
          this.log.zwMisses++;
          score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
        }
        else
          this.log.zwHits++;
      }
    }

    else {
      score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -beta, -alpha);  // ZW by implication.
      if (R && !this.stats.timeOut && score > alpha)
        score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
    }

    //{{{  unmake move
    
    board.unmakeMove(move);
    
    node.uncache();
    
    //}}}

    if (this.stats.timeOut)
      return;

    if (score > bestScore) {
      if (score > alpha) {
        if (score >= beta) {
          node.addKiller(depth, score, move);
          board.ttPut(TT_BETA, depth, score, move, node.ply);
          return score;
        }
        board.ttPut(TT_ALPHA, depth, score, move, node.ply);
        alpha     = score;
        alphaMate = (alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE);
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  //{{{  no moves?
  
  if (numLegalMoves == 0) {
  
    if (inCheck)
      bestScore = -MATE + node.ply;
  
    else
      bestScore = CONTEMPT;
  
  }
  
  //}}}

  if (bestScore > oAlpha) {
    board.ttPut(TT_EXACT, depth, bestScore, bestMove, node.ply);
    return bestScore;
  }
  else {
    board.ttPut(TT_ALPHA, depth, oAlpha,    bestMove, node.ply);
    return oAlpha;
  }
}

//}}}
//{{{  .quiescence

lozChess.prototype.qSearch = function (node, depth, turn, alpha, beta) {

  this.stats.nodes++;

  var board    = this.board;
  var standPat = board.evaluate(turn);
  var phase    = board.gPhase;

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.uci.debug('Q DEPTH');
    return standPat;
  }
  
  //}}}

  if (standPat >= beta) {  // DO NOT BE TEMPTED TO USE FAIL SOFT!!!
    return beta;
  }

  if (standPat + VALUE_QUEEN < alpha) {
    return alpha;
  }

  var nextTurn = ~turn & COLOR_MASK;
  var move     = 0;

  alpha = (standPat > alpha) ? standPat : alpha;

  node.cache();

  board.genQMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(move);

    //{{{  legal?
    
    if (board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn)) {
    
      board.unmakeMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}
    //{{{  futile?
    
    if (phase <= EPHASE && !(move & MOVE_PROMOTE_MASK) && standPat + 200 + VALUE_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK] < alpha) {
    
      board.unmakeMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    var score = -this.qSearch(node.childNode, depth-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    board.unmakeMove(move);
    
    node.uncache();
    
    //}}}

    if (score > alpha) {
      if (score >= beta) {
        return beta;
      }
      alpha = score;
    }
  }

  return alpha;
}

//}}}
//{{{  .playMove

lozChess.prototype.playMove = function (moveStr, turn) {

  var board = this.board;
  var move  = 0;
  var node  = lozza.rootNode;

  board.genMoves(node, turn);

  while (move = node.getNextMove()) {

    if (moveStr == board.formatMove(move)) {
      board.makeMove(move);
      return;
    }
  }

  this.uci.debug('cannot play uci move',moveStr);
}

//}}}
//{{{  .getPVStr

lozChess.prototype.getPVStr = function(node) {

  if (!node)
    return '';

  var board = lozza.board;
  var move  = board.ttGetMove(node);

  if (!move)
    return '';

  node.cache();
  board.makeMove(move);

  var mv = board.formatMove(move);
  var pv = ' ' + this.getPVStr(node.childNode);

  board.unmakeMove(move);
  node.uncache();

  if (pv.indexOf(' ' + mv + ' ') === -1)
    return mv + pv;
  else
    return '';
}


//}}}

//}}}
//{{{  lozBoard class

//{{{  lozBoard

function lozBoard () {

  this.b = [];

  this.runningEvalS = 0;  // these are all caches across make/unmakeMove.
  this.runningEvalE = 0;
  this.rights       = 0;
  this.ep           = 0;
  this.repLo        = 0;
  this.repHi        = 0;
  this.loHash       = 0;
  this.hiHash       = 0;

  this.ttSize = 1 << 24;
  this.ttMask = this.ttSize - 1;

  // use separate typed arrays to save space.  optimiser probably has a go anyway but better
  // to be explicit at the expense of some conversion.  total width is 16 bytes.

  this.ttLo    = new Int32Array(this.ttSize);  // must not be Uint32.  not really sure why.
  this.ttHi    = new Int32Array(this.ttSize);  // "
  this.ttType  = new Uint8Array(this.ttSize);
  this.ttDepth = new Int8Array(this.ttSize);   // allow -ve depths but currently not used for q.
  this.ttMove  = new Uint32Array(this.ttSize); // see constants for structure.
  this.ttScore = new Int16Array(this.ttSize);

  this.ttInit();

  this.turn = 0;

  //{{{  turn
  
  this.loTurn = this.rand32();
  this.hiTurn = this.rand32();
  
  //}}}
  //{{{  pieces
  
  this.loPieces = Array(2);
  for (var i=0; i < 2; i++) {
    this.loPieces[i] = Array(6);
    for (var j=0; j < 6; j++) {
      this.loPieces[i][j] = Array(144);
      for (var k=0; k < 144; k++)
        this.loPieces[i][j][k] = this.rand32();
    }
  }
  
  this.hiPieces = Array(2);
  for (var i=0; i < 2; i++) {
    this.hiPieces[i] = Array(6);
    for (var j=0; j < 6; j++) {
      this.hiPieces[i][j] = Array(144);
      for (var k=0; k < 144; k++)
        this.hiPieces[i][j][k] = this.rand32();
    }
  }
  
  //}}}
  //{{{  rights
  
  this.loRights = Array(16);
  this.hiRights = Array(16);
  
  for (var i=0; i < 16; i++) {
    this.loRights[i] = this.rand32();
    this.hiRights[i] = this.rand32();
  }
  
  //}}}
  //{{{  EP
  
  this.loEP = Array(144);
  this.hiEP = Array(1444);
  
  for (var i=0; i < 144; i++) {
    this.loEP[i] = this.rand32();
    this.hiEP[i] = this.rand32();
  }
  
  //}}}

  this.rep = Array(2000);
  for (var i=0; i < 2000; i++)
    this.rep[i] = [0,0]; // lo/hi hash.

  this.phase   = 0;
  this.gPhase  = 0;

  this.wCounts = [0,0,0,0,0,0,0];
  this.bCounts = [0,0,0,0,0,0,0];

  this.wCount  = 0;
  this.bCount  = 0;
}

//}}}
//{{{  .init

lozBoard.prototype.init = function () {

  this.loHash = 0;
  this.hiHash = 0;

  this.repLo  = 0;
  this.repHi  = 0;

  this.phase   = 0;
  this.gPhase  = 0;

  this.wCounts = [0,0,0,0,0,0,0];
  this.bCounts = [0,0,0,0,0,0,0];

  this.wCount = 0;
  this.bCount = 0;

  this.ttInit();
}

//}}}
//{{{  .genMoves

lozBoard.prototype.genMoves = function(node, turn) {

  node.numMoves    = 0;
  node.sortedIndex = 0;

  var b = this.b;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetOrth  = WP_OFFSET_ORTH;
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pHomeRank    = 2;
    var pPromoteRank = 8;
    var rights       = this.rights & WHITE_RIGHTS;
  
    if (rights) {
  
      if ((rights & WHITE_RIGHTS_KING)  && b[F1] == NULL && b[G1] == NULL                  && !this.isAttacked(F1,BLACK) && !this.isAttacked(E1,BLACK))
        node.addMove(MOVE_E1G1);
  
      if ((rights & WHITE_RIGHTS_QUEEN) && b[B1] == NULL && b[C1] == NULL && b[D1] == NULL && !this.isAttacked(D1,BLACK) && !this.isAttacked(E1,BLACK))
        node.addMove(MOVE_E1C1);
    }
  }
  
  else {
  
    var pOffsetOrth  = BP_OFFSET_ORTH;
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pHomeRank    = 7;
    var pPromoteRank = 1;
    var rights       = this.rights & BLACK_RIGHTS;
  
    if (rights) {
  
      if ((rights & BLACK_RIGHTS_KING)  && b[F8] == NULL && b[G8] == NULL &&                  !this.isAttacked(F8,WHITE) && !this.isAttacked(E8,WHITE))
        node.addMove(MOVE_E8G8);
  
      if ((rights & BLACK_RIGHTS_QUEEN) && b[B8] == NULL && b[C8] == NULL && b[D8] == NULL && !this.isAttacked(D8,WHITE) && !this.isAttacked(E8,WHITE))
        node.addMove(MOVE_E8C8);
    }
  }
  
  //}}}

  for (var sq=0; sq<64; sq++) {

    var fr      = B88[sq];
    var frObj   = b[fr];

    if (frObj == NULL || turn != (frObj & COLOR_MASK))
      continue;

    var frPiece = frObj & PIECE_MASK;
    var frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);

    if (frPiece == PAWN) {
      //{{{  pawn
      
      frMove |= MOVE_PAWN_MASK;
      
      var to     = fr + pOffsetOrth;
      var toObj  = b[to];
      
      if (toObj == NULL) {
      
        if (RANK[to] == pPromoteRank)
          node.addPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
        else {
          node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
          if (RANK[fr] == pHomeRank) {
      
            to    += pOffsetOrth;
            toObj = b[to];
      
            if (toObj == NULL)
              node.addMove(MOVE_EPMAKE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          }
        }
      }
      
      var to    = fr + pOffsetDiag1;
      var toObj = b[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn) {
      
        if (RANK[to] == pPromoteRank)
          node.addPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep)
        node.addMove(MOVE_EPTAKE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      var to    = fr + pOffsetDiag2;
      var toObj = b[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn) {
      
        if (RANK[to] == pPromoteRank)
          node.addPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep)
        node.addMove(MOVE_EPTAKE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      //}}}
    }

    else {
      //{{{  not a pawn
      
      var offsets = OFFSETS[frPiece];
      var limit   = LIMITS[frPiece];
      
      for (var dir=0; dir < offsets.length; dir++) {
      
        var offset = offsets[dir];
      
        for (var slide=1; slide<=limit; slide++) {
      
          var to    = fr + offset * slide;
          var toObj = b[to];
      
          if (toObj == NULL) {
            node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
            continue;
          }
      
          if (toObj == EDGE)
            break;
      
          if ((toObj & COLOR_MASK) != turn)
            node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
          break;
        }
      }
      
      //}}}
    }
  }
}

//}}}
//{{{  .makeMove

lozBoard.prototype.makeMove = function (move) {

  var b = this.b;

  var fr      = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to      = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj   = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;
  var frColI  = frCol >>> 3;

  //{{{  slide piece
  
  b[fr] = NULL;
  b[to] = frObj;
  
  this.loHash ^= this.loPieces[frColI][frPiece-1][fr];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][fr];
  
  this.loHash ^= this.loPieces[frColI][frPiece-1][to];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][to];
  
  if (frCol == WHITE) {
    this.runningEvalS -= WS_PST[frPiece][fr];
    this.runningEvalS += WS_PST[frPiece][to];
    this.runningEvalE -= WE_PST[frPiece][fr];
    this.runningEvalE += WE_PST[frPiece][to];
  }
  
  else {
    this.runningEvalS += BS_PST[frPiece][fr];
    this.runningEvalS -= BS_PST[frPiece][to];
    this.runningEvalE += BE_PST[frPiece][fr];
    this.runningEvalE -= BE_PST[frPiece][to];
  }
  
  //}}}
  //{{{  capture?
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
    var toColI  = toCol >>> 3;
  
    this.loHash ^= this.loPieces[toColI][toPiece-1][to];
    this.hiHash ^= this.hiPieces[toColI][toPiece-1][to];
  
    this.phase += VPHASE[toPiece];
  
    if (toCol == WHITE) {
  
      this.runningEvalS -= VALUE_VECTOR[toPiece];
      this.runningEvalS -= WS_PST[toPiece][to];
      this.runningEvalE -= VALUE_VECTOR[toPiece];
      this.runningEvalE -= WE_PST[toPiece][to];
  
      this.wCounts[toPiece]--;
      this.wCount--;
    }
  
    else {
  
      this.runningEvalS += VALUE_VECTOR[toPiece];
      this.runningEvalS += BS_PST[toPiece][to];
      this.runningEvalE += VALUE_VECTOR[toPiece];
      this.runningEvalE += BE_PST[toPiece][to];
  
      this.bCounts[toPiece]--;
      this.bCount--;
    }
  }
  
  //}}}
  //{{{  clear rights?
  
  this.loHash ^= this.loRights[this.rights & ALL_RIGHTS];
  this.hiHash ^= this.hiRights[this.rights & ALL_RIGHTS];
  
  if (frPiece == KING) {
    this.rights &= ~((WHITE_RIGHTS << (frCol >>> 2)) | (0xFF << frCol+8));
    this.rights |= to << frCol+8;
  }
  
  
  if (this.rights & ALL_RIGHTS) {
  
    if ((frObj == W_ROOK && fr == H1) || to == H1)
      this.rights &= ~WHITE_RIGHTS_KING;
  
    if ((frObj == W_ROOK && fr == A1) || to == A1)
      this.rights &= ~WHITE_RIGHTS_QUEEN;
  
    if ((frObj == B_ROOK && fr == H8) || to == H8)
      this.rights &= ~BLACK_RIGHTS_KING;
  
    if ((frObj == B_ROOK && fr == A8) || to == A8)
      this.rights &= ~BLACK_RIGHTS_QUEEN;
  
  }
  
  this.loHash ^= this.loRights[this.rights & ALL_RIGHTS];
  this.hiHash ^= this.hiRights[this.rights & ALL_RIGHTS];
  
  //}}}
  //{{{  reset EP
  
  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];
  
  this.ep = 0;
  
  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];
  
  //}}}

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if (frCol == WHITE) {
    
      if (move & MOVE_EPMAKE_MASK) {
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
    
        this.ep = to + 12;
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to+12] = NULL;
    
        this.loHash ^= this.loPieces[1][PAWN-1][to+12];
        this.hiHash ^= this.hiPieces[1][PAWN-1][to+12];
    
        this.runningEvalS += VALUE_PAWN;
        this.runningEvalS += BS_PST[PAWN][to+12];  // sic.
        this.runningEvalE += VALUE_PAWN;
        this.runningEvalE += BE_PST[PAWN][to+12];  // sic.
    
        this.bCounts[PAWN]--;
        this.bCount--;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = WHITE | pro;
    
        this.loHash ^= this.loPieces[0][PAWN-1][to];
        this.hiHash ^= this.hiPieces[0][PAWN-1][to];
        this.loHash ^= this.loPieces[0][pro-1][to];
        this.hiHash ^= this.hiPieces[0][pro-1][to];
    
        this.runningEvalS -= VALUE_PAWN;
        this.runningEvalS -= WS_PST[PAWN][to];
        this.runningEvalE -= VALUE_PAWN;
        this.runningEvalE -= WE_PST[PAWN][to];
    
        this.wCounts[PAWN]--;
    
        this.runningEvalS += VALUE_VECTOR[pro];
        this.runningEvalS += WS_PST[pro][to];
        this.runningEvalE += VALUE_VECTOR[pro];
        this.runningEvalE += WE_PST[pro][to];
    
        this.wCounts[pro]++;
    
        this.phase -= VPHASE[pro];
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = NULL;
        b[F1] = W_ROOK;
    
        this.loHash ^= this.loPieces[0][ROOK-1][H1];
        this.hiHash ^= this.hiPieces[0][ROOK-1][H1];
        this.loHash ^= this.loPieces[0][ROOK-1][F1];
        this.hiHash ^= this.hiPieces[0][ROOK-1][F1];
    
        this.runningEvalS -= WS_PST[ROOK][H1];
        this.runningEvalS += WS_PST[ROOK][F1];
        this.runningEvalS += 50;
        this.runningEvalE -= WE_PST[ROOK][H1];
        this.runningEvalE += WE_PST[ROOK][F1];
        this.runningEvalE += 50;
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = NULL;
        b[D1] = W_ROOK;
    
        this.loHash ^= this.loPieces[0][ROOK-1][A1];
        this.hiHash ^= this.hiPieces[0][ROOK-1][A1];
        this.loHash ^= this.loPieces[0][ROOK-1][D1];
        this.hiHash ^= this.hiPieces[0][ROOK-1][D1];
    
        this.runningEvalS -= WS_PST[ROOK][A1];
        this.runningEvalS += WS_PST[ROOK][D1];
        this.runningEvalS += 50;
        this.runningEvalE -= WE_PST[ROOK][A1];
        this.runningEvalE += WE_PST[ROOK][D1];
        this.runningEvalE += 50;
      }
    }
    
    else {
    
      if (move & MOVE_EPMAKE_MASK) {
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
    
        this.ep = to - 12;
    
        this.loHash ^= this.loEP[this.ep];
        this.hiHash ^= this.hiEP[this.ep];
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to-12] = NULL;
    
        this.loHash ^= this.loPieces[0][PAWN-1][to-12];
        this.hiHash ^= this.hiPieces[0][PAWN-1][to-12];
    
        this.runningEvalS -= VALUE_PAWN;
        this.runningEvalS -= WS_PST[PAWN][to-12];  // sic.
        this.runningEvalE -= VALUE_PAWN;
        this.runningEvalE -= WE_PST[PAWN][to-12];  // sic.
    
        this.wCounts[PAWN]--;
        this.wCount--;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = BLACK | pro;
    
        this.loHash ^= this.loPieces[1][PAWN-1][to];
        this.hiHash ^= this.hiPieces[1][PAWN-1][to];
        this.loHash ^= this.loPieces[1][pro-1][to];
        this.hiHash ^= this.hiPieces[1][pro-1][to];
    
        this.runningEvalS += VALUE_PAWN;
        this.runningEvalS += BS_PST[PAWN][to];
        this.runningEvalE += VALUE_PAWN;
        this.runningEvalE += BE_PST[PAWN][to];
    
        this.bCounts[PAWN]--;
    
        this.runningEvalS -= VALUE_VECTOR[pro];
        this.runningEvalS -= BS_PST[pro][to];
        this.runningEvalE -= VALUE_VECTOR[pro];
        this.runningEvalE -= BE_PST[pro][to];
    
        this.bCounts[pro]++;
    
        this.phase -= VPHASE[pro];
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = NULL;
        b[F8] = B_ROOK;
    
        this.loHash ^= this.loPieces[1][ROOK-1][H8];
        this.hiHash ^= this.hiPieces[1][ROOK-1][H8];
        this.loHash ^= this.loPieces[1][ROOK-1][F8];
        this.hiHash ^= this.hiPieces[1][ROOK-1][F8];
    
        this.runningEvalS += BS_PST[ROOK][H8];
        this.runningEvalS -= BS_PST[ROOK][F8];
        this.runningEvalS -= 50;
        this.runningEvalE += BE_PST[ROOK][H8];
        this.runningEvalE -= BE_PST[ROOK][F8];
        this.runningEvalE -= 50;
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = NULL;
        b[D8] = B_ROOK;
    
        this.loHash ^= this.loPieces[1][ROOK-1][A8];
        this.hiHash ^= this.hiPieces[1][ROOK-1][A8];
        this.loHash ^= this.loPieces[1][ROOK-1][D8];
        this.hiHash ^= this.hiPieces[1][ROOK-1][D8];
    
        this.runningEvalS += BS_PST[ROOK][A8];
        this.runningEvalS -= BS_PST[ROOK][D8];
        this.runningEvalS -= 50;
        this.runningEvalE += BE_PST[ROOK][A8];
        this.runningEvalE -= BE_PST[ROOK][D8];
        this.runningEvalE -= 50;
      }
    }
    
    //}}}
  }

  //{{{  flip turn in hash
  
  this.loHash ^= this.loTurn;
  this.hiHash ^= this.hiTurn;
  
  //}}}
  //{{{  push rep hash
  
  this.rep[this.repHi][0] = this.loHash;
  this.rep[this.repHi][1] = this.hiHash;
  
  this.repHi++;
  
  if ((move & (MOVE_SPECIAL_MASK | MOVE_TOOBJ_MASK)) || frPiece == PAWN)
    this.repLo = this.repHi
  
  //}}}
}

//}}}
//{{{  .unmakeMove

lozBoard.prototype.unmakeMove = function (move) {

  var b = this.b;

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  b[fr] = frObj;
  b[to] = toObj;

  //{{{  capture?
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
  
    this.phase -= VPHASE[toPiece];
  
    if (toCol == WHITE) {
  
      this.wCounts[toPiece]++;
      this.wCount++;
    }
  
    else {
  
      this.bCounts[toPiece]++;
      this.bCount++;
    }
  }
  
  //}}}

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if ((frObj & COLOR_MASK) == WHITE) {
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to + 12] = B_PAWN;
    
        this.bCounts[PAWN]++;
        this.bCount++;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        this.wCounts[PAWN]++;
        this.wCounts[pro]--;
    
        this.phase += VPHASE[pro];
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = W_ROOK;
        b[F1] = NULL;
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = W_ROOK;
        b[D1] = NULL;
      }
    }
    
    else {
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to - 12] = W_PAWN;
    
        this.wCounts[PAWN]++;
        this.wCount++;
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
    
        this.bCounts[PAWN]++;
        this.bCounts[pro]--;
    
        this.phase += VPHASE[pro];
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = B_ROOK;
        b[F8] = NULL;
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = B_ROOK;
        b[D8] = NULL;
      }
    }
    
    //}}}
  }
}

//}}}
//{{{  .genQMoves

lozBoard.prototype.genQMoves = function(node, turn) {

  node.numMoves    = 0;
  node.sortedIndex = 0;

  var b = this.b;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pPromoteRank = 8;
  }
  
  else {
  
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pPromoteRank = 1;
  }
  
  //}}}

  for (var sq=0; sq<64; sq++) {

    var fr      = B88[sq];
    var frObj   = b[fr];

    if (frObj == NULL || turn != (frObj & COLOR_MASK))
      continue;

    var frPiece = frObj & PIECE_MASK;
    var frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);

    if (frPiece == PAWN) {
      //{{{  pawn
      
      frMove |= MOVE_PAWN_MASK;
      
      var to    = fr + pOffsetDiag1;
      var toObj = b[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn) {
      
        if (RANK[to] == pPromoteRank)
          node.addQPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep)
        node.addQMove(MOVE_EPTAKE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      var to    = fr + pOffsetDiag2;
      var toObj = b[to];
      
      if (toObj != NULL && toObj != EDGE && (toObj & COLOR_MASK) != turn) {
      
        if (RANK[to] == pPromoteRank)
          node.addQPromotion(MOVE_PROMOTE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
        else
          node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (toObj == NULL && to == this.ep)
        node.addQMove(MOVE_EPTAKE_MASK | frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      
      //}}}
    }

    else {
      //{{{  not a pawn
      
      var offsets = OFFSETS[frPiece];
      var limit   = LIMITS[frPiece];
      
      for (var dir=0; dir < offsets.length; dir++) {
      
        var offset = offsets[dir];
      
        for (var slide=1; slide<=limit; slide++) {
      
          var to    = fr + offset * slide;
          var toObj = b[to];
      
          if (toObj == NULL)
            continue;
      
          if (toObj == EDGE)
            break;
      
          if ((toObj & COLOR_MASK) != turn) {
            node.addQMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          }
      
          break;
        }
      }
      
      //}}}
    }
  }
}

//}}}
//{{{  .isAttacked

lozBoard.prototype.isAttacked = function(to, byCol) {

  var b = this.b;

  //{{{  queen, bishop, rook
  
  var offsets = QUEEN_OFFSETS;
  var len     = offsets.length;
  var cwtch   = 0;
  
  for (var dir=len; dir--;) {
  
    var offset = offsets[dir];
  
    for (var slide=1; slide<=8; slide++) {
  
      var frObj = b[to + slide*offset];
  
      if (frObj == NULL)
        continue;
  
      if ((frObj == EDGE) || (frObj & COLOR_MASK) != byCol) {
        cwtch++;
        break;
      }
  
      var frPiece = frObj & PIECE_MASK;
  
      if (frPiece == QUEEN || dir <= 3 && frPiece == BISHOP || dir > 3  && frPiece == ROOK)
        return frObj;
  
      break;
    }
  }
  
  //}}}
  //{{{  knights
  
  var attacker = KNIGHT | byCol;
  
  if (b[to + -10] == attacker) return attacker;
  if (b[to + -23] == attacker) return attacker;
  if (b[to + -14] == attacker) return attacker;
  if (b[to + -25] == attacker) return attacker;
  if (b[to +  10] == attacker) return attacker;
  if (b[to +  23] == attacker) return attacker;
  if (b[to +  14] == attacker) return attacker;
  if (b[to +  25] == attacker) return attacker;
  
  //}}}

  if (cwtch == 8) // this can be used towards king safety?
    return 0;

  //{{{  pawns
  
  if (byCol == BLACK && b[to + WP_OFFSET_DIAG1] == B_PAWN) return B_PAWN;
  if (byCol == BLACK && b[to + WP_OFFSET_DIAG2] == B_PAWN) return B_PAWN;
  if (byCol == WHITE && b[to + BP_OFFSET_DIAG1] == W_PAWN) return W_PAWN;
  if (byCol == WHITE && b[to + BP_OFFSET_DIAG2] == W_PAWN) return W_PAWN;
  
  //}}}
  //{{{  kings
  
  var attacker = KING | byCol;
  
  if (b[to + -11] == attacker) return attacker;
  if (b[to + -13] == attacker) return attacker;
  if (b[to + -12] == attacker) return attacker;
  if (b[to + -1 ] == attacker) return attacker;
  if (b[to +  11] == attacker) return attacker;
  if (b[to +  13] == attacker) return attacker;
  if (b[to +  12] == attacker) return attacker;
  if (b[to +  1 ] == attacker) return attacker;
  
  //}}}

  return 0;
}

//}}}
//{{{  .formatMove

var PROMOTES = ['n','b','r','q']; // 0-3 encoded in move.

lozBoard.prototype.formatMove = function (move) {

  if (move == 0)
    return 'NULL';

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  var frCoord = COORDS[fr];
  var toCoord = COORDS[to];

  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;
  var frName  = NAMES[frPiece];

  var toPiece = toObj & PIECE_MASK;
  var toCol   = toObj & COLOR_MASK;
  var toName  = NAMES[toPiece];

  if (move & MOVE_PROMOTE_MASK)
    var pro = PROMOTES[(move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS];
  else
    var pro = '';

  if (lozza.uci.options.san != 'on')
    return frCoord + toCoord + pro;

  if (toObj != NULL) {
    if (frPiece == PAWN)
      return frCoord + 'x' + toCoord + pro;
    else
      return frName + 'x' + toCoord;
  }

  if (frPiece == PAWN)
    return toCoord + pro;

  if (move == MOVE_E1G1 || move == MOVE_E8G8)
    return '0-0';

  if (move == MOVE_E1C1 || move == MOVE_E8C8)
    return '0-0-0';

  return frName + toCoord;

}

//}}}
//{{{  .evaluate

lozBoard.prototype.evaluate = function (turn) {

  //this.check(turn);

  var numPieces = this.wCount + this.bCount;

  //{{{  insufficient material?
  
  if (numPieces == 2)  // KvK.
    return 0;
  
  if (numPieces == 3 && (this.wCounts[KNIGHT] || this.bCounts[KNIGHT] || this.wCounts[BISHOP] || this.bCounts[BISHOP]))  // KvN or KvB.
    return 0;
  
  //}}}

  this.gPhase = Math.round((this.phase << 8) / TPHASE);

  var evalS = this.runningEvalS;
  var evalE = this.runningEvalE;

  //{{{  bishop pair
  
  if (this.wCounts[BISHOP] >= 2) {
    evalS += 50;
    evalE += 50;
  }
  
  if (this.bCounts[BISHOP] >= 2) {
    evalS -= 50;
    evalE -= 50;
  }
  
  //}}}

  var e = ((evalS * (256 - this.gPhase)) + (evalE * this.gPhase)) >> 8;

  return e * ((-turn >> 31) | 1);
}

//}}}
//{{{  .rand32

lozBoard.prototype.rand32 = function () {

  return Math.floor(Math.random() * 0xFFFFFFFF);

}

//}}}
//{{{  .ttPut

lozBoard.prototype.ttPut = function (type,depth,score,move,ply) {

  var idx = this.loHash & this.ttMask;

  if (this.ttType[idx] != TT_EMPTY && this.ttDepth[idx] > depth && this.ttLo[idx] == this.loHash && this.ttHi[idx] == this.hiHash) {

    // we have a better result from a deeper search.

    return;
  }

  if (score <= -MINMATE && score >= -MATE)
    score -= ply;

  else if (score >= MINMATE && score <= MATE)
    score += ply;

  this.ttLo[idx]    = this.loHash;
  this.ttHi[idx]    = this.hiHash;
  this.ttType[idx]  = type;
  this.ttDepth[idx] = depth;
  this.ttScore[idx] = score;
  this.ttMove[idx]  = move;
}

//}}}
//{{{  .ttGet

lozBoard.prototype.ttGet = function (node, depth, alpha, beta) {

  var log   = lozza.log;
  var idx   = this.loHash & this.ttMask;
  var type  = this.ttType[idx];

  node.hashMove = 0;

  if (type == TT_EMPTY) {
    log.ttMisses++;
    return undefined;
  }

  var lo = this.ttLo[idx];
  var hi = this.ttHi[idx];

  if (lo != this.loHash || hi != this.hiHash) {
    log.ttMisses++;
    log.ttCollide++;
    return undefined;
  }

  //
  // Set the hash move before the depth check
  // so that iterative deepening works.
  //

  node.hashMove = this.ttMove[idx];

  if (this.ttDepth[idx] < depth) {
    log.ttMisses++;
    return undefined;
  }

  var score = this.ttScore[idx];

  if (score <= -MINMATE && score >= -MATE)
    score += node.ply;

  else if (score >= MINMATE && score <= MATE)
    score -= node.ply;

  if (type == TT_EXACT) {
    log.ttHits++;
    return score;
   }

  if (type == TT_ALPHA && score <= alpha) {
    log.ttHits++;
    return score;
  }

  if (type == TT_BETA && score >= beta) {
    log.ttHits++;
    return score;
  }

  log.ttMisses++;
  return undefined;
}

//}}}
//{{{  .ttGetMove

lozBoard.prototype.ttGetMove = function (node) {

  var idx = this.loHash & this.ttMask;

  if (this.ttType[idx] != TT_EMPTY && this.ttLo[idx] == this.loHash && this.ttHi[idx] == this.hiHash)
    return this.ttMove[idx];

  return 0;
}

//}}}
//{{{  .ttInit

lozBoard.prototype.ttInit = function () {

  this.loHash = 0;
  this.hiHash = 0;

  for (var i=0; i < this.ttType.length; i++) {
    this.ttType[i]  = TT_EMPTY;
    //this.ttMove[i]  = 0;
    //this.ttLo[i]    = 0;
    //this.ttHi[i]    = 0;
    //this.ttScore[i] = 0;
    //this.ttDepth[i] = 0;
  }
}

//}}}
//{{{  .check

lozBoard.prototype.check = function (turn) {

  var loHash = 0;
  var hiHash = 0;

  if (turn) {
    loHash ^= this.loTurn;
    hiHash ^= this.hiTurn;
  }

  loHash ^= this.loRights[this.rights & ALL_RIGHTS];
  hiHash ^= this.hiRights[this.rights & ALL_RIGHTS];

  loHash ^= this.loEP[this.ep];
  hiHash ^= this.hiEP[this.ep];

  for (var sq88=0; sq88<64; sq88++) {

    var sq  = B88[sq88];
    var obj = this.b[sq];

    if (obj == NULL)
      continue;

    var piece = obj & PIECE_MASK;
    var col   = obj & COLOR_MASK;

    loHash ^= this.loPieces[col>>>3][piece-1][sq];
    hiHash ^= this.hiPieces[col>>>3][piece-1][sq];

  }

  if (this.loHash != loHash)
    lozza.uci.debug('*************** LO',this.loHash,loHash);

  if (this.hiHash != hiHash)
    lozza.uci.debug('*************** HI',this.hiHash,hiHash);
}

//}}}

//}}}
//{{{  lozNode class

//{{{  lozNode

function lozNode (parentNode) {

  this.ply      = 0;
  this.root     = false;

  this.hashMove = 0;

  this.killer1    = 0;
  this.killer2    = 0;
  this.mateKiller = 0;

  this.childNode  = null;
  this.parentNode = parentNode;

  if (parentNode) {
    this.grandparentNode = parentNode.parentNode;
    parentNode.childNode = this;
  }
  else {
    this.grandparentNode = null;
  }

  this.numMoves    = 0;
  this.sortedIndex = 0;
  this.base        = 0;

  this.moves = Array(MAX_MOVES);
  for (var i=0; i < this.moves.length; i++)
    this.moves[i] = [0,0];  // [0] = priority, [1] = move.

  this.C_runningEvalS = 0;
  this.C_runningEvalE = 0;
  this.C_rights       = 0;
  this.C_ep           = 0;
  this.C_repLo        = 0;
  this.C_repHi        = 0;
  this.C_loHash       = 0;
  this.C_hiHash       = 0;
}

//}}}
//{{{  .cache

lozNode.prototype.cache = function() {

  var board = lozza.board;

  this.C_runningEvalS = board.runningEvalS;
  this.C_runningEvalE = board.runningEvalE
  this.C_rights       = board.rights;
  this.C_ep           = board.ep;
  this.C_repLo        = board.repLo;
  this.C_repHi        = board.repHi;
  this.C_loHash       = board.loHash;
  this.C_hiHash       = board.hiHash;
}

//}}}
//{{{  .uncache

lozNode.prototype.uncache = function() {

  var board = lozza.board;

  board.runningEvalS   = this.C_runningEvalS;
  board.runningEvalE   = this.C_runningEvalE;
  board.rights         = this.C_rights;
  board.ep             = this.C_ep;
  board.repLo          = this.C_repLo;
  board.repHi          = this.C_repHi;
  board.loHash         = this.C_loHash;
  board.hiHash         = this.C_hiHash;
}

//}}}
//{{{  .init
//
//  By storing the killers in the node, we are implicitly using depth from root, rather than
//  depth, which can jump around all over the place and is inappropriate to use for killers.
//

lozNode.prototype.init = function() {

  this.killer1      = 0;
  this.killer2      = 0;
  this.mateKiller   = 0;

  this.numMoves     = 0;  // pseudo-legal.
  this.sortedIndex  = 0;  // the number of moves we've extracted using a simple selection sort.

  this.hashMove     = 0;  // inserted when the TT is probed.
  this.base         = 0;
}

//}}}
//{{{  .getNextMove

lozNode.prototype.getNextMove = function () {

  if (this.sortedIndex == this.numMoves)
    return 0;

  var maxV = -INFINITY;
  var maxI = 0;

  for (var i=this.sortedIndex; i < this.numMoves; i++) {
    if (this.moves[i][0] > maxV) {
      maxV = this.moves[i][0];
      maxI = i;
    }
  }

  var next = this.moves[this.sortedIndex];
  var maxi = this.moves[maxI];

  var tmpV = next[0];
  var tmpM = next[1];

  next[0] = maxi[0];
  next[1] = maxi[1];
  maxi[0] = tmpV;
  maxi[1] = tmpM;

  this.base = this.moves[this.sortedIndex][0];

  return this.moves[this.sortedIndex++][1];
}

//}}}
//{{{  .addMove
//
// Higher value => better move.
//

var BASE_HASH       =  11000;
var BASE_PROMOTES   =  10000;
var BASE_GOODTAKES  =   9000;
var BASE_EVENTAKES  =   8000;
var BASE_EPTAKES    =   7000;
var BASE_MATEKILLER =   6000;
var BASE_MYKILLERS  =   5000;
var BASE_GPKILLERS  =   4000;
var BASE_CASTLING   =   3000;
var BASE_BADTAKES   =   2000;
var BASE_SLIDES     =   1000;

var BASE_LMR        = BASE_BADTAKES;

lozNode.prototype.addMove = function (move) {

  var next = this.moves[this.numMoves++];
  next[1]  = move;

  if (move == this.hashMove) {
    next[0] = BASE_HASH;
    return;
  }

  if (move & MOVE_PROMOTE_MASK) {
    next[0] = BASE_PROMOTES + ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS); // QRBN.
    return;
  }

  if (move & MOVE_EPTAKE_MASK) {
    next[0] = BASE_EPTAKES;
    return;
  }

  if (move == this.mateKiller) {
    next[0] = BASE_MATEKILLER;
    return;
  }

  if (move == this.killer1) {
    next[0] = BASE_MYKILLERS + 1;
    return;
  }

  if (move == this.killer2) {
    next[0] = BASE_MYKILLERS;
    return;
  }

  if (this.grandparentNode && move == this.grandparentNode.killer1) {
    next[0] = BASE_GPKILLERS + 1;
    return;
  }

  if (this.grandparentNode && move == this.grandparentNode.killer2) {
    next[0] = BASE_GPKILLERS;
    return;
  }

  if (move & MOVE_CASTLE_MASK) {
    next[0] = BASE_CASTLING;
    return;
  }

  if (move & MOVE_TOOBJ_MASK) {

    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim > attack)
      next[0] = BASE_GOODTAKES + victim * 64 - attack;
    else if (victim == attack)
      next[0] = BASE_EVENTAKES + victim * 64 - attack;
    else
      next[0] = BASE_BADTAKES  + victim * 64 - attack;

    return;
  }

  else {
    var board = lozza.board;

    var to      = (move & MOVE_TO_MASK)    >>> MOVE_TO_BITS;
    var fr      = (move & MOVE_FR_MASK)    >>> MOVE_FR_BITS;
    var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
    var frPiece = frObj & PIECE_MASK;

    if ((frObj & COLOR_MASK) == WHITE)
      next[0] = BASE_SLIDES + WE_PST[frPiece][to] - WE_PST[frPiece][fr];
    else
      next[0] = BASE_SLIDES + BE_PST[frPiece][to] - BE_PST[frPiece][fr];
  }

  return;
}

//}}}
//{{{  .addQMove

lozNode.prototype.addQMove = function (move) {

  var next = this.moves[this.numMoves++];
  next[1]  = move;

  if (move & MOVE_PROMOTE_MASK) {
    next[0] = BASE_PROMOTES + ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS); // QRBN.
    return;
  }

  if (move & MOVE_EPTAKE_MASK) {
    next[0] = BASE_EPTAKES;
    return;
  }

  var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
  var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

  if (victim > attack)
    next[0] = BASE_GOODTAKES + victim * 64 - attack;

  else if (victim == attack)
    next[0] = BASE_EVENTAKES + victim * 64 - attack;

  else
    next[0] = BASE_BADTAKES  + victim * 64 - attack;

  return;
}

//}}}
//{{{  .addPromotion

lozNode.prototype.addPromotion = function (move) {

  this.addMove (move | (QUEEN-2)  << MOVE_PROMAS_BITS);
  this.addMove (move | (ROOK-2)   << MOVE_PROMAS_BITS);
  this.addMove (move | (BISHOP-2) << MOVE_PROMAS_BITS);
  this.addMove (move | (KNIGHT-2) << MOVE_PROMAS_BITS);
}

//}}}
//{{{  .addQPromotion

lozNode.prototype.addQPromotion = function (move) {

  this.addQMove (move | (QUEEN-2)  << MOVE_PROMAS_BITS);
  this.addQMove (move | (ROOK-2)   << MOVE_PROMAS_BITS);
  this.addQMove (move | (BISHOP-2) << MOVE_PROMAS_BITS);
  this.addQMove (move | (KNIGHT-2) << MOVE_PROMAS_BITS);
}

//}}}
//{{{  .addKiller

lozNode.prototype.addKiller = function (depth, score, move) {

  if (move == this.hashMove)
    return;

  if (move & (MOVE_EPTAKE_MASK | MOVE_PROMOTE_MASK))
    return;  // before killers in move ordering.

  if (move & MOVE_TOOBJ_MASK) {

    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim >= attack)
      return; // before killers in move ordering.
  }

  if (score >= MINMATE && score <= MATE) {
    if (this.mateKiller == move)
      lozza.log.killHits++;
    this.mateKiller = move;
    if (this.killer1 == move)
      this.killer1 = 0;
    if (this.killer2 == move)
      this.killer2 = 0;
    return;
  }

  if (this.killer1 == move || this.killer2 == move) {
    lozza.log.killHits++;
    return;
  }

  lozza.log.killMisses++;

  if (this.killer1 == 0) {
    this.killer1 = move;
    return;
  }

  if (this.killer2 == 0) {
    this.killer2 = move;
    return;
  }

  var tmp      = this.killer1;
  this.killer1 = move;
  this.killer2 = tmp;
}

//}}}

//}}}
//{{{  lozStats class

//{{{  lozStats

function lozStats () {
}

//}}}
//{{{  .init

lozStats.prototype.init = function () {

  this.startTime = Date.now();
  this.splitTime = 0;
  this.nodes     = 0;  // per analysis
  this.ply       = 0;  // current ID root ply
  this.splits    = 0;
  this.moveTime  = 0;
  this.maxNodes  = 0;
  this.timeOut   = 0;
}

//}}}
//{{{  .lazyUpdate

lozStats.prototype.lazyUpdate = function () {

  //postMessage('info string ' + lastMessage);  //hack - never shows stop.

  //if (__jsUCI && lastMessage.indexOf('stop') != -1) {
  //  lozza.uci.debug('stop');
  //  this.stats.timeOut = 1;
  //}

  if (this.moveTime > 0 && ((Date.now() - this.startTime) > this.moveTime))
    this.timeOut = 1;

  if (this.maxNodes > 0 && this.nodes >= this.maxNodes)
    this.timeOut = 1;

  if (Date.now() - this.splitTime > 500) {
    this.splits++;
    this.update();
    this.splitTime = Date.now();
  }
}

//}}}
//{{{  .update

lozStats.prototype.update = function () {

  var tim = Date.now() - this.startTime;
  var nps = Math.floor((this.nodes * 1000) / tim);

  lozza.uci.send('info nodes',this.nodes,'time',tim,'nps',nps);
}

//}}}
//{{{  .stop

lozStats.prototype.stop = function () {

  this.stopTime  = Date.now();
  this.time      = this.stopTime - this.startTime;
  this.timeSec   = Math.round(this.time / 100) / 10;
  this.nodesMega = Math.round(this.nodes / 100000) / 10;
}

//}}}

//}}}
//{{{  lozTest class

//{{{  lozTest

function lozTest () {
}

//}}}
//{{{  .perft

lozTest.prototype.perft = function (spec) {

  lozza.initFromPosition();

  lozza.stats.ply = spec.depth;

  var moves = this.perftSearch(lozza.rootNode, spec.depth, lozza.board.turn, spec.inner);

  lozza.stats.update();

  var error = moves - spec.moves;

  if (error == 0)
    var err = 'error';
  else
    var err = '<b>ERROR</b>';

  lozza.uci.debug('perft',lozza.board.id,'depth',spec.depth,'moves',moves,'expected',spec.moves,err,error);
}

//}}}
//{{{  .perftSearch

lozTest.prototype.perftSearch = function (node, depth, turn, inner) {

  lozza.stats.nodes++;

  if (depth == 0)
    return 1;

  var board         = lozza.board;
  var numNodes      = 0;
  var totalNodes    = 0;
  var move          = 0;
  var nextTurn      = ~turn & COLOR_MASK;
  var numLegalMoves = 0;

  node.cache();

  board.genMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeMove(move);

    //{{{  legal?
    
    if (board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn)) {
    
       board.unmakeMove(move);
    
       node.uncache();
    
       continue;
    }
    
    //}}}

    numLegalMoves++;

    var numNodes = this.perftSearch(node.childNode, depth-1, nextTurn);

    totalNodes += numNodes;

    //{{{  unmake move
    
    board.unmakeMove(move);
    
    node.uncache();
    
    //}}}

    if (node.root) {
      var fmove = board.formatMove(move);
      lozza.uci.send('info currmove ' + fmove + ' currmovenumber ' + numLegalMoves);
      if (inner)
        lozza.uci.debug(board.id,fmove,numNodes);
    }
  }

  if (depth > 2)
    lozza.stats.lazyUpdate();

  return totalNodes;
}

//}}}

//}}}
//{{{  lozUCI class

//{{{  lozUCI

function lozUCI () {

  this.message = '';
  this.tokens  = [];
  this.command = '';

  this.debugging = true;

  this.options = {};

  this.options.san = 'off';  // useful to switch 'on' in a non UCI context.
}

//}}}
//{{{  .send

lozUCI.prototype.send = function () {

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  postMessage(s);
  //console.log(s);
}

//}}}
//{{{  .debug

lozUCI.prototype.debug = function () {

  if (!this.debugging)
    return;

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  postMessage('info string ' + s);
  //console.log(s);
}

//}}}
//{{{  .getInt

lozUCI.prototype.getInt = function (key, def) {

  for (var i=0; i < this.tokens.length; i++)
    if (this.tokens[i] == key)
      if (i < this.tokens.length - 1)
        return parseInt(this.tokens[i+1]);

  return def;
}

//}}}
//{{{  .getStr

lozUCI.prototype.getStr = function (key, def) {

  for (var i=0; i < this.tokens.length; i++)
    if (this.tokens[i] == key)
      if (i < this.tokens.length - 1)
        return this.tokens[i+1];

  return def;
}

//}}}
//{{{  .getArr

lozUCI.prototype.getArr = function (key, to) {

  var lo = 0;
  var hi = 0;

  for (var i=0; i < this.tokens.length; i++) {
    if (this.tokens[i] == key) {
      lo = i + 1;  //assumes at least one item
      hi = lo;
      for (var j=lo; j < this.tokens.length; j++) {
        if (this.tokens[j] == to)
          break;
        hi = j;
      }
    }
  }

  return {lo:lo, hi:hi};
}

//}}}
//{{{  .onmessage

onmessage = function(e) {

  var uci = lozza.uci;

  uci.messageList = e.data.split('\n');

  for (var messageNum=0; messageNum < uci.messageList.length; messageNum++ ) {

    uci.message = uci.messageList[messageNum].replace(/(\r\n|\n|\r)/gm,"");
    uci.message = uci.message.trim();
    uci.message = uci.message.replace(/\s+/g,' ');

    uci.tokens  = uci.message.split(' ');
    uci.command = uci.tokens[0];

    switch (uci.command) {

    case 'position':
      //{{{  position
      //
      //  position (startpos | fen <fen>) [moves 0<move>]
      //
      
      var spec = {};
      
      spec.board  = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
      spec.turn   = 'w';
      spec.rights = 'KQkq';
      spec.ep     = '-';
      spec.hmc    = 0;
      spec.fmc    = 1;
      spec.id     = '';
      
      var arr = uci.getArr('fen','moves');
      
      if (arr.lo > 0) { // handle partial FENs
        if (arr.lo <= arr.hi) spec.board  =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) spec.turn   =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) spec.rights =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) spec.ep     =          uci.tokens[arr.lo];  arr.lo++;
        if (arr.lo <= arr.hi) spec.hmc    = parseInt(uci.tokens[arr.lo]); arr.lo++;
        if (arr.lo <= arr.hi) spec.fmc    = parseInt(uci.tokens[arr.lo]); arr.lo++;
      }
      
      spec.moves = [];
      
      var arr = uci.getArr('moves','fen');
      
      if (arr.lo > 0) {
        for (var i=arr.lo; i <= arr.hi; i++)
          spec.moves.push(uci.tokens[i]);
      }
      
      lozza.position(spec);
      
      break;
      
      //}}}

    case 'go':
      //{{{  go
      //
      // go
      //
      
      var spec = {};
      
      spec.depth     = uci.getInt('depth',0);
      spec.moveTime  = uci.getInt('movetime',0);
      spec.maxNodes  = uci.getInt('nodes',0);
      spec.wTime     = uci.getInt('wtime',0);
      spec.bTime     = uci.getInt('btime',0);
      spec.wInc      = uci.getInt('winc',0);
      spec.bInc      = uci.getInt('binc',0);
      spec.movesToGo = uci.getInt('movestogo',0);
      
      lozza.go(spec);
      
      break;
      
      //}}}

    case 'ucinewgame':
      //{{{  ucinewgame
      //
      // ucinewgame
      //
      
      lozza.board.ttInit();
      
      break;
      
      //}}}

    case 'quit':
      //{{{  quit
      
      close(); //kill worker
      
      break;
      
      //}}}

    case 'debug':
      //{{{  debug
      
      if (uci.getStr('debug','off') == 'on') {
      
        uci.debugging = true;
        uci.send('info string debug enabled');
      }
      
      else
        uci.debugging = false;
      
      break;
      
      //}}}

    case 'uci':
      //{{{  uci
      
      uci.send('id name Lozza');
      uci.send('id author Colin Jenkins');
      uci.send('option');
      uci.send('uciok');
      
      break;
      
      //}}}

    case 'isready':
      //{{{  isready
      
      uci.send('readyok');
      
      break;
      
      //}}}

    case 'setoption':
      //{{{  setoption
      
      var key = uci.getStr('name');
      var val = uci.getStr('value');
      
      uci.options[key] = val;
      
      break;
      
      //}}}

    case 'ping':
      //{{{  ping
      
      uci.send('info string Lozza version',VERSION,'is alive');
      
      break;
      
      
      //}}}

    case 'id':
      //{{{  id
      //
      //  id <str>
      //
      
      lozza.id(uci.tokens[1]);
      
      break;
      
      //}}}

    case 'perft':
      //{{{  perft
      //
      // perft [depth <int>] [moves <int>] [inner 0|1]
      //
      
      var spec = {};
      
      spec.depth = uci.getInt('depth',0);
      spec.moves = uci.getInt('moves',0);
      spec.inner = uci.getInt('inner',0);
      
      lozza.test.perft (spec);
      
      break;
      
      //}}}

    }

  }
}

//}}}

//}}}

var lozza = new lozChess()

if ((typeof lastMessage) == 'undefined') {
  __jsUCI = false;
  lastMessage = '';  //so no errors when using native.
}
else {
  __jsUCI = true;
  postMessage('info string jsUCI detected');
}

//{{{  for use with node.js

/*

var spec = {};

spec.board  = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
spec.turn   = 'w';
spec.rights = 'KQkq';
spec.ep     = '-';
spec.hmc    = 0;
spec.fmc    = 1;
spec.id     = 'node test';
spec.moves = [];

lozza.position(spec);

spec.depth = 12;

lozza.go(spec);

*/

//}}}

