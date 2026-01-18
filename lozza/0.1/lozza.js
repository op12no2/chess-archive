
var VERSION = '0.1';

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

23/05/14 V 0.1
23/05/14 Fix bug in QSearch.  It must not fail soft.

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
var CONTEMPT  = 50;

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
var MOVE_SPARE1_MASK   = 0x01000000;
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
// Values base on Larry Kaufman.
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

var WBISHOP_PST = [0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, -20, -10, -10, -10, -10, -10, -10, -20, 0, 0,
                   0, 0, -10, 0,   0,   0,   0,   0,    0,  -10, 0, 0,
                   0, 0, -10, 0,   5,   10,  10,  5,    0,  -10, 0, 0,
                   0, 0, -10, 5,   5,   10,  10,  5,    5,  -10, 0, 0,
                   0, 0, -10, 0,   10,  10,  10,  10,   0,  -10, 0, 0,
                   0, 0, -10, 10,  10,  10,  10,  10,   10, -10, 0, 0,
                   0, 0, -10, 5 ,   0,   0,   0,   0,   5,  -10, 0, 0,
                   0, 0, -20, -10, -10, -10, -10, -10, -10, -20, 0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                   0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0];

var WROOK_PST = [0, 0, 0,   0,   0,   0,   0,   0,   0,   0,  0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,  0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,  0, 0,
                 0, 0, 5,   10,  10,  10,  10,  10,  10,  5,  0, 0,
                 0, 0, -5,  0,   0,   0,   0,   0,   0,   -5, 0, 0,
                 0, 0, -5,  0,   0,   0,   0,   0,   0,   -5, 0, 0,
                 0, 0, -5,  0,   0,   0,   0,   0,   0,   -5, 0, 0,
                 0, 0, -5,  0,   0,   0,   0,   0,   0,   -5, 0, 0,
                 0, 0, -5,  0,   0,   0,   0,   0,   0,   -5, 0, 0,
                 0, 0, 0,   0,   0,   5,   5,   0,   0,   0,  0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,  0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,  0, 0];

var WQUEEN_PST = [0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                  0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                  0, 0, -20, -10, -10, -5,  -5,  -10, -10, -20, 0, 0,
                  0, 0, -10, 0,   0,   0,   0,   0,    0,  -10, 0, 0,
                  0, 0, -10, 0,   5,   5,   5,   5,    0,  -10, 0, 0,
                  0, 0, -5,  0,   5,   5,   5,   5,    0,  -5,  0, 0,
                  0, 0,  0,  0,   5,   5,   5,   5,    0,  -5,  0, 0,
                  0, 0, -10, 5,   5,   5,   5,   5,    0,  -10, 0, 0,
                  0, 0, -10, 0,   5,   0,   0,   0,    0,  -10, 0, 0,
                  0, 0, -20, -10, -10, -5,  -5,  -10, -10, -20, 0, 0,
                  0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                  0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0];

var WKING_PST = [0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                 0, 0, -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                 0, 0, -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                 0, 0, -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                 0, 0, -30, -40, -40, -50, -50, -40, -40, -30, 0, 0,
                 0, 0, -20, -30, -30, -40, -40, -30, -30, -20, 0, 0,
                 0, 0, -10, -20, -20, -20, -20, -20, -20, -10, 0, 0,
                 0, 0, 20,  20,  0,   0,   0,   0,   20,  20,  0, 0,
                 0, 0, 20,  30,  10,  0,   0,   10,  30,  20,  0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0,
                 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0, 0];

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
var BKNIGHT_PST = Array(144);
var BBISHOP_PST = Array(144);
var BROOK_PST   = Array(144);
var BQUEEN_PST  = Array(144);
var BKING_PST   = Array(144);
var BKING_PST2  = Array(144);

pst2Black(WPAWN_PST,   BPAWN_PST);
pst2Black(WKNIGHT_PST, BKNIGHT_PST);
pst2Black(WBISHOP_PST, BBISHOP_PST);
pst2Black(WROOK_PST,   BROOK_PST);
pst2Black(WQUEEN_PST,  BQUEEN_PST);
pst2Black(WKING_PST,   BKING_PST);
pst2Black(WKING_PST2,  BKING_PST2);

var WHITE_PST = [NULL_PST, WPAWN_PST, WKNIGHT_PST, WBISHOP_PST, WROOK_PST, WQUEEN_PST, WKING_PST];
var BLACK_PST = [NULL_PST, BPAWN_PST, BKNIGHT_PST, BBISHOP_PST, BROOK_PST, BQUEEN_PST, BKING_PST];

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

var CENT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0,
            0, 0, 2, 5, 6, 7, 7, 6, 5, 2, 0, 0,
            0, 0, 3, 6, 8, 9, 9, 8, 6, 3, 0, 0,
            0, 0, 4, 7, 9, 10,10,9, 7, 4, 0, 0,
            0, 0, 4, 7, 9, 10,10,9, 7, 4, 0, 0,
            0, 0, 3, 6, 8, 9, 9, 8, 6, 3, 0, 0,
            0, 0, 2, 5, 6, 7, 7, 6, 5, 2, 0, 0,
            0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var DIA1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
            0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0,
            0, 0, 3, 4, 5, 6, 7, 8, 9, 10,0, 0,
            0, 0, 4, 5, 6, 7, 8, 9, 10,11,0, 0,
            0, 0, 5, 6, 7, 8, 9, 10,11,12,0, 0,
            0, 0, 6, 7, 8, 9, 10,11,12,13,0, 0,
            0, 0, 7, 8, 9, 10,11,12,13,14,0, 0,
            0, 0, 8, 9, 10,11,12,13,14,15,0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var DIA2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0,
            0, 0, 9, 8, 7, 6, 5, 4, 3, 2, 0, 0,
            0, 0, 10,9, 8, 7, 6, 5, 4, 3, 0, 0,
            0, 0, 11,10,9, 8, 7, 6, 5, 4, 0, 0,
            0, 0, 12,11,10,9, 8, 7, 6, 5, 0, 0,
            0, 0, 13,12,11,10,9, 8, 7, 6, 0, 0,
            0, 0, 14,13,12,11,10,9, 8, 7, 0, 0,
            0, 0, 15,14,13,12,11,10,9, 8,0, 0,
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

  for (var i=0; i < this.nodes.length; i++)
    this.nodes[i].init();

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

  var promote  = 0;
  this.endGame = 0;

  WHITE_PST[KING] = WKING_PST;
  BLACK_PST[KING] = BKING_PST;

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
  
  var i = 0;
  for (var j=0; j < this.pos.board.length; j++) {
    var ch  = this.pos.board.charAt(j);
    var chn = parseInt(ch);
    while (board.b[i] == EDGE)
      i++;
    if (isNaN(chn)) {
      if (ch != '/') {
        board.b[i] = map[ch];
        var piece     = board.b[i] & PIECE_MASK;
        var col       = board.b[i] & COLOR_MASK;
        board.loHash ^= board.loPieces[col>>>3][piece-1][i];
        board.hiHash ^= board.hiPieces[col>>>3][piece-1][i];
        if (board.b[i] == W_KING)
          board.rights |= i << BLACK;
        if (board.b[i] == B_KING)
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
  
  board.runningEval = 0;
  
  for (var sq8=0; sq8 < 64; sq8++) {
  
    var sq = B88[sq8];
    var p  = board.b[sq];
  
    if (p == NULL)
      continue;
  
    var pCol  = p & COLOR_MASK;
    var pType = p & PIECE_MASK;
  
    if (pCol == BLACK) {
      board.runningEval -= VALUE_VECTOR[pType];
      board.runningEval -= BLACK_PST[pType][sq]
    }
    else {
      board.runningEval += VALUE_VECTOR[pType];
      board.runningEval += WHITE_PST[pType][sq]
    }
  }
  
  //}}}

  for (var i=0; i < this.pos.moves.length; i++) {
    if (this.playMove(this.pos.moves[i], board.turn))
      promote = true;
    board.turn = ~board.turn & COLOR_MASK;
  }

  //{{{  endgame?
  
  var nWQ = 0;
  var nBQ = 0;
  var nWM = 0;
  var nBM = 0;
  var nWR = 0;
  var nBR = 0;
  
  for (var sq=0; sq<64; sq++) {
  
    var fr    = B88[sq];
    var frObj = board.b[fr];
  
    if (frObj == W_QUEEN)
      nWQ++;
    else if (frObj == B_QUEEN)
      nBQ++;
    else if (frObj == W_KNIGHT || frObj == W_BISHOP)
      nWM++;
    else if (frObj == B_KNIGHT || frObj == B_BISHOP)
      nBM++;
    else if (frObj == W_ROOK)
      nWR++;
    else if (frObj == B_ROOK)
      nBR++;
  }
  
  if (promote || ((nWQ+nWR+nWM+nBQ+nBR+nBM) <= 4) || ((nWQ==0 && nBQ==0) && (nWR+nWM+nBR+nBM <= 6))) {
  
    this.endGame = 1;
  
    WHITE_PST[KING] = WKING_PST2;
    BLACK_PST[KING] = BKING_PST2;
  }
  
  //}}}
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
      var movesToGo = spec.movesToGo + 5;  //buffer
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

    //{{{  reset node hash moves
    
    //for (var i=0; i < this.nodes.length; i++)
      //this.nodes[i].hashMove = 0;
    
    //}}}

    this.stats.ply = ply;

    score = this.search(this.rootNode, ply, board.turn, alpha, beta);

    move = board.ttGetMove(this.rootNode);
    if (move)
      bestMove = move;

    if (this.stats.timeOut)
      break;

    if (score <= alpha || score >= beta) {
      //{{{  research
      
      this.uci.debug(board.id,'asp win research depth', ply, 'alpha', alpha, 'score', score, 'beta', beta);
      
      alpha = -INFINITY;
      beta  = INFINITY;
      
      this.stats.moveTime += 250;
      
      continue;
      
      //}}}
    }

    if (score >= MINMATE && score <= MATE)
      break;

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
  
  this.uci.debug (board.id,'depth',ply,'TT','hits',l.ttHits,'misses',l.ttMisses,'hit rate',l.ttHits/(l.ttMisses+l.ttHits),'collisions',l.ttCollide/(l.ttMisses+l.ttHits));
  this.uci.debug (board.id,'depth',ply,'ZW','hits',l.zwHits,'misses',l.zwMisses,'research rate',l.zwMisses/(l.zwHits+l.zwMisses));
  this.uci.debug (board.id,'depth',ply,'KILL','hits',l.killHits,'misses',l.killMisses,'hit rate',l.killHits/(l.killHits+l.killMisses));
  
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

var KEEPER_MASK  = MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_TOOBJ_MASK;

lozChess.prototype.search = function (node, depth, turn, alpha, beta) {

  //{{{  housekeeping
  
  if (!node.childNode) {
    this.stats.timeOut = 1;
    return;
  }
  
  //}}}

  this.stats.nodes++;

  var board         = this.board;
  var nextTurn      = ~turn & COLOR_MASK;
  var oAlpha        = alpha;
  var numLegalMoves = 0;
  var move          = 0;
  var bestMove      = 0;
  var score         = 0;
  var bestScore     = -INFINITY;
  var inCheck       = board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn);
  var R             = 0;
  var givesCheck    = 0;
  var alphaMate     = ((alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE)) ? true : false;
  var betaMate      = ((beta  <= -MINMATE && beta  >= -MATE) || (beta  >= MINMATE && beta  <= MATE)) ? true : false;

  depth = (inCheck) ? depth + 1 : depth;

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
    
    if (depth >= 3 && !inCheck && !betaMate && !alphaMate && numLegalMoves > 20 && !(move & KEEPER_MASK)) {
    
      givesCheck = board.isAttacked((board.rights >>> nextTurn+BLACK) & 0xFF, turn);
    
      if (!givesCheck)
        R = 1;
    }
    
    //}}}

    if (numLegalMoves == 1)
      score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
    else {
      score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -alpha-1, -alpha);
      if (!this.stats.timeOut && score > alpha && score < beta) {
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

    if (this.stats.timeOut)
      return;

    if (score > bestScore) {
      if (score > alpha) {
        if (score >= beta) {
          node.addKiller(depth, score, move);
          board.ttPut(TT_BETA, depth, score, move);
          return score;
        }
        alpha     = score;
        alphaMate = ((alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE)) ? true : false;
        board.ttPut(TT_ALPHA, depth, score, move);
        this.uci.send('info depth',this.stats.ply,'score cp',score,'pv',this.getPVStr(node));
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  if (bestScore > oAlpha)
    board.ttPut(TT_EXACT, depth, bestScore, bestMove);
  else {
    board.ttPut(TT_ALPHA, depth, bestScore, bestMove);
  }

  if (numLegalMoves == 1)
    this.stats.timeOut = 1;

  return bestScore;
}

//}}}
//{{{  .alphabeta

lozChess.prototype.alphabeta = function (node, depth, turn, alpha, beta, nullOK) {

  //{{{  housekeeping
  
  if (!node.childNode)
    this.stats.timeOut = 1;
  
  if (depth > 2 || this.stats.timeOut) {
    this.stats.lazyUpdate();
    if (this.stats.timeOut)
      return;
  }
  
  //}}}

  var board    = this.board;
  var nextTurn = ~turn & COLOR_MASK;
  var score    = 0;
  var inCheck  = board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn);

  depth = (inCheck) ? depth + 1 : depth;

  //{{{  horizon?
  
  if (depth <= 0) {
  
    //score = board.ttGet(node, 0, INFINITY, -INFINITY);  //  get *any* TT entry for this position - it will be at least as good as a Q search.
  
    //if (score != undefined) {
    //  return score;
    //}
  
    score = this.qSearch(node, depth-1, turn, alpha, beta);  // pass node in so GP killers work.
  
    //board.ttPut(TT_EXACT, 0, score, 0);  //  will never trigger when depth > 0.
  
    return score;
  }
  
  //}}}

  this.stats.nodes++;

  //{{{  check for repetition
  
  for (var i=board.numRep-5; i >= 0; i -= 2) {
  
    if (board.rep[i][0] == board.loHash && board.rep[i][1] == board.hiHash) {
  
      if (alpha < 0)
        return CONTEMPT;
      else
        return -CONTEMPT;
    }
  }
  
  //}}}
  //{{{  try tt
  
  score = board.ttGet(node, depth, alpha, beta);
  
  if (score != undefined) {
    return score;
  }
  
  //}}}

  var betaMate = ((beta <= -MINMATE && beta >= -MATE) || (beta >= MINMATE && beta <= MATE)) ? true : false;
  var pvNode   = ((beta == alpha + 1)) ? false : true;
  var standPat = board.runningEval * ((-turn >> 31) | 1);
  var R        = 0;

  node.cache();

  //{{{  try null move
  //
  //  The parent node passes in nullOK == false if it did a null
  //  move.  It will be undefined otherwise, so we can do one.
  //
  
  R = 3;
  
  if (!pvNode && standPat > beta && !betaMate && nullOK !== false && !inCheck && depth >= 1) {
  
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
      //board.ttPut(TT_BETA, depth, score, 0);
      return score;
    }
  }
  
  R = 0;
  
  //}}}

  var bestScore      = -INFINITY;
  var move           = 0;
  var bestMove       = 0;
  var oAlpha         = alpha;
  var alphaMate      = ((alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE)) ? true : false;
  var futility       = (!inCheck && !alphaMate && (standPat + 10 + depth*40 < alpha)) ? true : false;
  var numLegalMoves  = 0;
  var givesCheck     = undefined;

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
    
    if (futility && !alphaMate && numLegalMoves > 1 && !(move & KEEPER_MASK)) {
    
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
    
    if (depth >= 3 && !inCheck && !alphaMate && !betaMate && numLegalMoves > 10 && !(move & KEEPER_MASK)) {
    
      if (givesCheck == undefined)
        givesCheck = board.isAttacked((board.rights >>> nextTurn+BLACK) & 0xFF, turn);
    
      if (!givesCheck)
        R = 1;
    }
    
    //}}}

    if (pvNode) {
      if (numLegalMoves == 1)
        score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
      else {
        score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -alpha-1, -alpha);
        if (!this.stats.timeOut && score > alpha && score < beta) {
          this.log.zwMisses++;
          score = -this.alphabeta(node.childNode, depth-1, nextTurn, -beta, -alpha);
        }
        else
          this.log.zwHits++;
      }
    }

    else {
      score = -this.alphabeta(node.childNode, depth-R-1, nextTurn, -beta, -alpha);  // ZW by implication.
      if (!this.stats.timeOut && score > alpha && score < beta)
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
          board.ttPut(TT_BETA, depth, score, move);
          return score;
        }
        board.ttPut(TT_ALPHA, depth, score, move);
        alpha     = score;
        alphaMate = ((alpha <= -MINMATE && alpha >= -MATE) || (alpha >= MINMATE && alpha <= MATE)) ? true : false;
      }
      bestScore = score;
      bestMove  = move;
    }
  }

  //{{{  no moves?
  
  if (numLegalMoves == 0) {
  
    if (inCheck) {
      bestScore = -MATE + this.stats.ply - depth;  // needs to be tweaked in TT for next ID.
      if (bestScore < -MATE)
        bestScore = -MATE;
    }
  
    else {
      if (alpha < 0)
        bestScore = CONTEMPT;
      else
        bestScore = -CONTEMPT;
    }
  }
  
  //}}}

  if (bestScore > oAlpha)
    board.ttPut(TT_EXACT, depth, bestScore, bestMove);
  else
    board.ttPut(TT_ALPHA, depth, bestScore, bestMove);

  return bestScore;
}

//}}}
//{{{  .quiescence

lozChess.prototype.qSearch = function (node, depth, turn, alpha, beta) {

  this.stats.nodes++;

  var board       = this.board;
  var standPat    = board.runningEval * ((-turn >> 31) | 1);

  //{{{  housekeeping
  
  if (depth < -30 || !node.childNode) {
    this.uci.debug('Q LIMIT');
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

  board.ttGet(node, depth, alpha, beta);  // load hash move.

  board.genQMoves(node, turn);

  while (move = node.getNextMove()) {

    board.makeQMove(move);

    //{{{  legal?
    
    if (board.isAttacked((board.rights >>> turn+BLACK) & 0xFF, nextTurn)) {
    
      board.unmakeQMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}
    //{{{  futile?
    
    if (!this.endGame && (move && MOVE_PROMOTE_MASK) && standPat + 200 + VALUE_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK] < alpha) {
    
      board.unmakeQMove(move);
    
      node.uncache();
    
      continue;
    }
    
    //}}}

    var score = -this.qSearch(node.childNode, depth-1, nextTurn, -beta, -alpha);

    //{{{  unmake move
    
    board.unmakeQMove(move);
    
    node.uncache();
    
    //}}}

    if (score > alpha) {
      if (score >= beta) {
        node.addKiller(depth, score, move);
        return score;
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
      return move & MOVE_PROMOTE_MASK;
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

  var str = board.formatMove(move) + ' ' + this.getPVStr(node.childNode);

  board.unmakeMove(move);
  node.uncache();

  return str;
}


//}}}

//}}}
//{{{  lozBoard class

//{{{  lozBoard

function lozBoard () {

  this.b = [];

  this.runningEval = 0;  // these are all caches across make/unmakeMove.
  this.rights      = 0;
  this.ep          = 0;
  this.numRep      = 0;
  this.loHash      = 0;
  this.hiHash      = 0;

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

  for (var i=0; i < this.ttType.length; i++) {
    this.ttType[i] = TT_EMPTY;
  }

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

  this.rep = Array(200);
  for (var i=0; i < 200; i++)
    this.rep[i] = [0,0]; // lo/hi hash.
}

//}}}
//{{{  .init

lozBoard.prototype.init = function () {

  this.loHash = 0;
  this.hiHash = 0;

  for (var i=0; i < this.ttType.length; i++) {
    this.ttType[i] = TT_EMPTY;
  }

  this.numRep = 0;
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
    var pPushRank1   = 5;
    var pPushRank2   = 8;
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
    var pPushRank1   = 1;
    var pPushRank2   = 4;
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

    var fr    = B88[sq];
    var frObj = b[fr];

    if (frObj == NULL || turn != (frObj & COLOR_MASK))
      continue;

    var frPiece = frObj & PIECE_MASK;
    var frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);

    if (frPiece == PAWN) {
      //{{{  pawn
      
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
      
          if (toObj == EDGE)
            break;
      
          if (toObj == NULL) {
            node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
            continue;
          }
      
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

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  b[fr] = NULL;
  b[to] = frObj;

  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;
  var frColI  = frCol >>> 3;

  this.loHash ^= this.loPieces[frColI][frPiece-1][fr];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][fr];

  this.loHash ^= this.loPieces[frColI][frPiece-1][to];
  this.hiHash ^= this.hiPieces[frColI][frPiece-1][to];

  this.loHash ^= this.loRights[this.rights & ALL_RIGHTS];
  this.hiHash ^= this.hiRights[this.rights & ALL_RIGHTS];

  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];

  //{{{  update running eval
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
    var toColI  = toCol >>> 3;
  
    this.loHash ^= this.loPieces[toColI][toPiece-1][to];
    this.hiHash ^= this.hiPieces[toColI][toPiece-1][to];
  
    if (toCol == WHITE) {
      this.runningEval -= VALUE_VECTOR[toPiece];
      this.runningEval -= WHITE_PST[toPiece][to];
    }
    else {
      this.runningEval += VALUE_VECTOR[toPiece];
      this.runningEval += BLACK_PST[toPiece][to];
    }
  }
  
  if (frCol == WHITE) {
    this.runningEval -= WHITE_PST[frPiece][fr];
    this.runningEval += WHITE_PST[frPiece][to];
  }
  else {
    this.runningEval += BLACK_PST[frPiece][fr];
    this.runningEval -= BLACK_PST[frPiece][to];
  }
  
  //}}}
  //{{{  update king square + clear rights?
  
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
  
  //}}}

  this.ep = 0;

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if (frCol == WHITE) {
    
      if (move & MOVE_EPMAKE_MASK)
    
        this.ep = to + 12;
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to+12] = NULL;
    
        this.loHash      ^= this.loPieces[0][PAWN-1][to+12];
        this.hiHash      ^= this.hiPieces[0][PAWN-1][to+12];
        this.runningEval += VALUE_PAWN;
        this.runningEval += BLACK_PST[PAWN][to+12];  // sic.
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = WHITE | pro;
    
        this.loHash      ^= this.loPieces[0][PAWN-1][to];
        this.hiHash      ^= this.hiPieces[0][PAWN-1][to];
        this.loHash      ^= this.loPieces[0][pro-1][to];
        this.hiHash      ^= this.hiPieces[0][pro-1][to];
        this.runningEval -= VALUE_PAWN;
        this.runningEval -= WHITE_PST[PAWN][to];
        this.runningEval += VALUE_VECTOR[pro];
        this.runningEval += WHITE_PST[pro][to];
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = NULL;
        b[F1] = W_ROOK;
    
        this.loHash      ^= this.loPieces[0][ROOK-1][H1];
        this.hiHash      ^= this.hiPieces[0][ROOK-1][H1];
        this.loHash      ^= this.loPieces[0][ROOK-1][F1];
        this.hiHash      ^= this.hiPieces[0][ROOK-1][F1];
        this.runningEval -= WHITE_PST[ROOK][H1];
        this.runningEval += WHITE_PST[ROOK][F1];
        this.runningEval += 50;
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = NULL;
        b[D1] = W_ROOK;
    
        this.loHash      ^= this.loPieces[0][ROOK-1][A1];
        this.hiHash      ^= this.hiPieces[0][ROOK-1][A1];
        this.loHash      ^= this.loPieces[0][ROOK-1][D1];
        this.hiHash      ^= this.hiPieces[0][ROOK-1][D1];
        this.runningEval -= WHITE_PST[ROOK][A1];
        this.runningEval += WHITE_PST[ROOK][D1];
        this.runningEval += 50;
      }
    }
    
    else {
    
      if (move & MOVE_EPMAKE_MASK)
    
        this.ep = to - 12;
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to-12] = NULL;
    
        this.loHash      ^= this.loPieces[1][PAWN-1][to-12];
        this.hiHash      ^= this.hiPieces[1][PAWN-1][to-12];
        this.runningEval -= VALUE_PAWN;
        this.runningEval -= WHITE_PST[PAWN][to-12];  // sic.
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  //NBRQ
        b[to]   = BLACK | pro;
    
        this.loHash      ^= this.loPieces[1][PAWN-1][to];
        this.hiHash      ^= this.hiPieces[1][PAWN-1][to];
        this.loHash      ^= this.loPieces[1][pro-1][to];
        this.hiHash      ^= this.hiPieces[1][pro-1][to];
        this.runningEval += VALUE_PAWN;
        this.runningEval += BLACK_PST[PAWN][to];
        this.runningEval -= VALUE_VECTOR[pro];
        this.runningEval -= BLACK_PST[pro][to];
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = NULL;
        b[F8] = B_ROOK;
    
        this.loHash      ^= this.loPieces[1][ROOK-1][H8];
        this.hiHash      ^= this.hiPieces[1][ROOK-1][H8];
        this.loHash      ^= this.loPieces[1][ROOK-1][F8];
        this.hiHash      ^= this.hiPieces[1][ROOK-1][F8];
        this.runningEval += BLACK_PST[ROOK][H8];
        this.runningEval -= BLACK_PST[ROOK][F8];
        this.runningEval -= 50;
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = NULL;
        b[D8] = B_ROOK;
    
        this.loHash      ^= this.loPieces[1][ROOK-1][A8];
        this.hiHash      ^= this.hiPieces[1][ROOK-1][A8];
        this.loHash      ^= this.loPieces[1][ROOK-1][D8];
        this.hiHash      ^= this.hiPieces[1][ROOK-1][D8];
        this.runningEval += BLACK_PST[ROOK][A8];
        this.runningEval -= BLACK_PST[ROOK][D8];
        this.runningEval -= 50;
      }
    }
    
    //}}}
  }

  this.loHash ^= this.loRights[this.rights & ALL_RIGHTS];
  this.hiHash ^= this.hiRights[this.rights & ALL_RIGHTS];

  this.loHash ^= this.loEP[this.ep];
  this.hiHash ^= this.hiEP[this.ep];

  this.loHash ^= this.loTurn;
  this.hiHash ^= this.hiTurn;

  if (!(move & (MOVE_SPECIAL_MASK | MOVE_TOOBJ_MASK)) && frPiece != PAWN) {
    this.rep[this.numRep][0] = this.loHash;
    this.rep[this.numRep][1] = this.hiHash;
    this.numRep++;
  }
  else
    this.numRep = 0; // this move means reps have become impossible
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

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if ((frObj & COLOR_MASK) == WHITE) {
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to + 12] = B_PAWN;
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
    var pPushRank1   = 5;
    var pPushRank2   = 8;
  }
  
  else {
  
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pPromoteRank = 1;
    var pPushRank1   = 1;
    var pPushRank2   = 4;
  }
  
  //}}}

  for (var sq=0; sq<64; sq++) {

    var fr    = B88[sq];
    var frObj = b[fr];

    if (frObj == NULL || turn != (frObj & COLOR_MASK))
      continue;

    var frPiece = frObj & PIECE_MASK;
    var frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);

    if (frPiece == PAWN) {
      //{{{  pawn
      
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
      
          if (toObj == EDGE)
            break;
      
          if (toObj == NULL)
            continue;
      
          if ((toObj & COLOR_MASK) != turn) {
            node.addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
          }
      
          break;
        }
      }
      
      //}}}
    }
  }
}

//}}}
//{{{  .makeQMove

lozBoard.prototype.makeQMove = function (move) {

  var b = this.b;

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  b[fr] = NULL;
  b[to] = frObj;

  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;

  //{{{  update running eval
  
  if (toObj) {
  
    var toPiece = toObj & PIECE_MASK;
    var toCol   = toObj & COLOR_MASK;
  
    if (toCol == WHITE) {
      this.runningEval -= VALUE_VECTOR[toPiece];
      this.runningEval -= WHITE_PST[toPiece][to];
    }
    else {
      this.runningEval += VALUE_VECTOR[toPiece];
      this.runningEval += BLACK_PST[toPiece][to];
    }
  }
  
  if (frCol == WHITE) {
    this.runningEval -= WHITE_PST[frPiece][fr];
    this.runningEval += WHITE_PST[frPiece][to];
  }
  else {
    this.runningEval += BLACK_PST[frPiece][fr];
    this.runningEval -= BLACK_PST[frPiece][to];
  }
  
  //}}}
  //{{{  update king square
  
  if (frPiece == KING) {
    this.rights &= ~((WHITE_RIGHTS << (frCol >>> 2)) | (0xFF << frCol+8));
    this.rights |= to << frCol+8;
  }
  
  //}}}

  this.ep = 0;

  if (move & MOVE_SPECIAL_MASK) {
    //{{{  ikky stuff
    
    if (frCol == WHITE) {
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to + 12] = NULL;
    
        this.runningEval += VALUE_PAWN;
        this.runningEval += BLACK_PST[PAWN][to + 12];  // sic.
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  // NBRQ.
        b[to]   = WHITE | pro;
    
        this.runningEval -= VALUE_PAWN;
        this.runningEval -= WHITE_PST[PAWN][to];
        this.runningEval += VALUE_VECTOR[pro];
        this.runningEval += WHITE_PST[pro][to];
      }
    }
    
    else {
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to - 12] = NULL;
    
        this.runningEval -= VALUE_PAWN;
        this.runningEval -= WHITE_PST[PAWN][to - 12];  // sic.
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        var pro = ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;  // NBRQ.
        b[to]   = BLACK | pro;
    
        this.runningEval += VALUE_PAWN;
        this.runningEval += BLACK_PST[PAWN][to];
        this.runningEval -= VALUE_VECTOR[pro];
        this.runningEval -= BLACK_PST[pro][to];
      }
    }
    
    //}}}
  }
}

//}}}
//{{{  .unmakeQMove

lozBoard.prototype.unmakeQMove = function (move) {

  var b = this.b;

  var fr    = (move & MOVE_FR_MASK   ) >>> MOVE_FR_BITS;
  var to    = (move & MOVE_TO_MASK   ) >>> MOVE_TO_BITS;
  var toObj = (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
  var frObj = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;

  b[fr] = frObj;
  b[to] = toObj;

  if (move & MOVE_EPTAKE_MASK) {

    var frCol  = frObj & COLOR_MASK;
    var frColM = (-frCol >> 31) | 1;

    b[to + frColM*12] = frCol | PAWN;
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
//{{{  .rand32

lozBoard.prototype.rand32 = function () {

  return Math.floor(Math.random() * 0xFFFFFFFF);

}

//}}}
//{{{  .ttPut

lozBoard.prototype.ttPut = function (type,depth,score,move) {

  var idx = this.loHash & this.ttMask;

  if (this.ttType[idx] != TT_EMPTY && this.ttDepth[idx] > depth && this.ttLo[idx] == this.loHash && this.ttHi[idx] == this.hiHash) {

    // we have a (presumably) better result from a deeper search.

    return;
  }

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

//}}}
//{{{  lozNode class

//{{{  lozNode

function lozNode (parentNode) {

  this.childNode       = null;
  this.parentNode      = parentNode;

  if (parentNode) {
    this.grandparentNode = parentNode.parentNode;
    parentNode.childNode = this;
  }
  else
    this.grandparentNode = null;

  this.moves = Array(MAX_MOVES);
  for (var i=0; i < this.moves.length; i++)
    this.moves[i] = [0,0];  // [0] = priority, [1] = move.
}

//}}}
//{{{  .cache

lozNode.prototype.cache = function() {

  var board = lozza.board;

  this.C_runningEval = board.runningEval;
  this.C_rights      = board.rights;
  this.C_ep          = board.ep;
  this.C_numRep      = board.numRep;
  this.C_loHash      = board.loHash;
  this.C_hiHash      = board.hiHash;
}

//}}}
//{{{  .uncache

lozNode.prototype.uncache = function() {

  var board = lozza.board;

  board.runningEval = this.C_runningEval;
  board.rights      = this.C_rights;
  board.ep          = this.C_ep;
  board.numRep      = this.C_numRep;
  board.loHash      = this.C_loHash;
  board.hiHash      = this.C_hiHash;
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

  this.hashMove     = 0;  // inserted when the TT is probed, will sometimes clash with killers.
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

  this.phase = next[0];  // for use with futility etc.

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

lozNode.prototype.addMove = function (move) {

  var next = this.moves[this.numMoves++];

  next[1] = move;

  if (move == this.hashMove) {
    next[0] = BASE_HASH;  // always legal.
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
      next[0] = BASE_GOODTAKES + victim * 100 - attack;
    else if (victim == attack)
      next[0] = BASE_EVENTAKES + victim * 100 - attack;
    else
      next[0] = BASE_BADTAKES + victim * 100 - attack;
    return;
  }

  var to      = (move & MOVE_TO_MASK) >>> MOVE_TO_BITS;
  var fr      = (move & MOVE_FR_MASK) >>> MOVE_FR_BITS;
  var frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
  var frPiece = frObj & PIECE_MASK;
  var frCol   = frObj & COLOR_MASK;

  if (frCol == WHITE)
    var pst  = WHITE_PST[frPiece];
  else
    var pst  = BLACK_PST[frPiece];

  next[0] = BASE_SLIDES + pst[to] - pst[fr];

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
//{{{  .addKiller

lozNode.prototype.addKiller = function (depth, score, move) {

  //if (move == this.hashMove)
    //return;

  if (move & (MOVE_EPTAKE_MASK | MOVE_PROMOTE_MASK))
    return;  // before killers in move ordering.

  if (move & MOVE_TOOBJ_MASK) {

    var victim = RANK_VECTOR[((move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS) & PIECE_MASK];
    var attack = RANK_VECTOR[((move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS) & PIECE_MASK];

    if (victim >= attack)
      return; // before killers in move ordering.
  }

  if (score >= MINMATE) {
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
    
    if (board.isAttacked((board.rights >>> turn+8) & 0xFF, nextTurn)) {
    
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

  //{{{  tokenise
  
  uci.message = e.data.replace(/(\r\n|\n|\r)/gm,"");
  uci.message = uci.message.trim();
  uci.message = uci.message.replace(/\s+/g,' ');
  
  uci.tokens  = uci.message.split(' ');
  uci.command = uci.tokens[0];
  
  //}}}

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
    
    lozza.board.loHash = 0;
    lozza.board.hiHash = 0;
    
    for (var i=0; i < lozza.board.ttType.length; i++) {
      lozza.board.ttType[i] = TT_EMPTY;
    }
    
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

