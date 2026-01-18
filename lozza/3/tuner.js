//
// Copy lozza.js above here.
//

RELEASE = 0;

lozza.newGameInit();

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

var epds   = [];
var params = [];

var gKList     = [1.423,1.424,1.425]
var gCalcK     = false
var gK         = 1.424;
var gFile      = 'quiet-labeled.epd';
var gWDLIndex  = 5;
var gOutFile   = 'tuner.txt';

//{{{  1. add weight id

var iATT_N                = 100;
var iATT_B                = 200;
var iATT_R                = 300;
var iATT_Q                = 400;
var iPAWN_DOUBLED_S       = 500;
var iPAWN_DOUBLED_E       = 600;
var iPAWN_ISOLATED_S      = 700;
var iPAWN_ISOLATED_E      = 800;
var iPAWN_BACKWARD_S      = 900;
var iPAWN_BACKWARD_E      = 1000;
var iPAWN_PASSED_OFFSET_S = 1100;
var iPAWN_PASSED_OFFSET_E = 1200;
var iPAWN_PASSED_MULT_S   = 1300;
var iPAWN_PASSED_MULT_E   = 1400;
var iPAWN_OFFSET_S        = 1500;
var iPAWN_OFFSET_E        = 1600;
var iPAWN_MULT_S          = 1700;
var iPAWN_MULT_E          = 1800;
var iPAWN_PASS_FREE       = 1900;
var iPAWN_PASS_UNSTOP     = 2000;
var iPAWN_PASS_KING1      = 2100;
var iPAWN_PASS_KING2      = 2200;
var iPAWN_CHAIN_S         = 2300;
var iPAWN_CHAIN_E         = 2400;
var iTWOBISHOPS_S         = 2500;
var iTWOBISHOPS_E         = 2600;
var iROOK7TH_S            = 2700;
var iROOK7TH_E            = 2800;
var iROOKOPEN_S           = 2900;
var iROOKOPEN_E           = 3000;
var iROOKDOUBLED_S        = 3001;
var iROOKDOUBLED_E        = 3002;
var iQUEEN7TH_S           = 3100;
var iQUEEN7TH_E           = 3200;
var iTRAPPED_S            = 3300;
var iTRAPPED_E            = 3400;
var iKING_PENALTY         = 3500;
var iTIGHT_NS             = 3800;
var iTIGHT_NE             = 3900;
var iTIGHT_BS             = 4000;
var iTIGHT_BE             = 4100;
var iTIGHT_RS             = 4200;
var iTIGHT_RE             = 4300;
var iTIGHT_QS             = 4400;
var iTIGHT_QE             = 4500;
var iTENSE_NS             = 4600;
var iTENSE_NE             = 4700;
var iTENSE_BS             = 4800;
var iTENSE_BE             = 4900;
var iTENSE_RS             = 5000;
var iTENSE_RE             = 5100;
var iTENSE_QS             = 5200;
var iTENSE_QE             = 5300;
var iMOBN_S               = 5400;
var iMOBN_E               = 5500;
var iMOBN_S0              = 5600;
var iMOBN_E0              = 5700;
var iMOBB_S               = 5800;
var iMOBB_E               = 5900;
var iMOBB_S0              = 6000;
var iMOBB_E0              = 6100;
var iMOBR_S               = 6200;
var iMOBR_E               = 6300;
var iMOBR_S0              = 6400;
var iMOBR_E0              = 6500;
var iMOBQ_S               = 6600;
var iMOBQ_E               = 6700;
var iMOBQ_S0              = 6800;
var iMOBQ_E0              = 6900;
var iXRAY_BS              = 7000;
var iXRAY_BE              = 7100;
var iXRAY_RS              = 7200;
var iXRAY_RE              = 7300;
var iXRAY_QS              = 7400;
var iXRAY_QE              = 7500;

//}}}
//{{{  2. add to tweak()

function tweak(a,i,v) {

  if (a) {
    a[i] = a[i] + v;
    return a[i];
  }

  switch (i) {
    case iPAWN_CHAIN_S:         return PAWN_CHAIN_S         += v;
    case iPAWN_CHAIN_E:         return PAWN_CHAIN_E         += v;
    case iPAWN_DOUBLED_S:       return PAWN_DOUBLED_S       += v;
    case iPAWN_DOUBLED_E:       return PAWN_DOUBLED_E       += v;
    case iPAWN_ISOLATED_S:      return PAWN_ISOLATED_S      += v;
    case iPAWN_ISOLATED_E:      return PAWN_ISOLATED_E      += v;
    case iPAWN_BACKWARD_S:      return PAWN_BACKWARD_S      += v;
    case iPAWN_BACKWARD_E:      return PAWN_BACKWARD_E      += v;
    case iPAWN_PASSED_OFFSET_S: return PAWN_PASSED_OFFSET_S += v;
    case iPAWN_PASSED_OFFSET_E: return PAWN_PASSED_OFFSET_E += v;
    case iPAWN_PASSED_MULT_S:   return PAWN_PASSED_MULT_S   += v;
    case iPAWN_PASSED_MULT_E:   return PAWN_PASSED_MULT_E   += v;
    case iPAWN_OFFSET_S:        return PAWN_OFFSET_S        += v;
    case iPAWN_OFFSET_E:        return PAWN_OFFSET_E        += v;
    case iPAWN_MULT_S:          return PAWN_MULT_S          += v;
    case iPAWN_MULT_E:          return PAWN_MULT_E          += v;
    case iPAWN_PASS_FREE:       return PAWN_PASS_FREE       += v;
    case iPAWN_PASS_UNSTOP:     return PAWN_PASS_UNSTOP     += v;
    case iPAWN_PASS_KING1:      return PAWN_PASS_KING1      += v;
    case iPAWN_PASS_KING2:      return PAWN_PASS_KING2      += v;
    case iATT_N:                return ATT_N                += v;
    case iATT_B:                return ATT_B                += v;
    case iATT_R:                return ATT_R                += v;
    case iATT_Q:                return ATT_Q                += v;
    case iTWOBISHOPS_S:         return TWOBISHOPS_S         += v;
    case iTWOBISHOPS_E:         return TWOBISHOPS_E         += v;
    case iROOK7TH_S:            return ROOK7TH_S            += v;
    case iROOK7TH_E:            return ROOK7TH_E            += v;
    case iROOKOPEN_S:           return ROOKOPEN_S           += v;
    case iROOKOPEN_E:           return ROOKOPEN_E           += v;
    case iROOKDOUBLED_S:        return ROOK_DOUBLED_S       += v;
    case iROOKDOUBLED_E:        return ROOK_DOUBLED_E       += v;
    case iQUEEN7TH_S:           return QUEEN7TH_S           += v;
    case iQUEEN7TH_E:           return QUEEN7TH_E           += v;
    case iTRAPPED_S:            return TRAPPED_S            += v;
    case iTRAPPED_E:            return TRAPPED_E            += v;
    case iKING_PENALTY:         return KING_PENALTY         += v;
    case iTIGHT_NS:             return TIGHT_NS             += v;
    case iTIGHT_NE:             return TIGHT_NE             += v;
    case iTIGHT_BS:             return TIGHT_BS             += v;
    case iTIGHT_BE:             return TIGHT_BE             += v;
    case iTIGHT_RS:             return TIGHT_RS             += v;
    case iTIGHT_RE:             return TIGHT_RE             += v;
    case iTIGHT_QS:             return TIGHT_QS             += v;
    case iTIGHT_QE:             return TIGHT_QE             += v;
    case iTENSE_NS:             return TENSE_NS             += v;
    case iTENSE_NE:             return TENSE_NE             += v;
    case iTENSE_BS:             return TENSE_BS             += v;
    case iTENSE_BE:             return TENSE_BE             += v;
    case iTENSE_RS:             return TENSE_RS             += v;
    case iTENSE_RE:             return TENSE_RE             += v;
    case iTENSE_QS:             return TENSE_QS             += v;
    case iTENSE_QE:             return TENSE_QE             += v;
    case iMOBN_S:               return MOBN_S               += v;
    case iMOBN_E:               return MOBN_E               += v;
    case iMOBN_S0:              return MOBN_S0              += v;
    case iMOBN_E0:              return MOBN_E0              += v;
    case iMOBB_S:               return MOBB_S               += v;
    case iMOBB_E:               return MOBB_E               += v;
    case iMOBB_S0:              return MOBB_S0              += v;
    case iMOBB_E0:              return MOBB_E0              += v;
    case iMOBR_S:               return MOBR_S               += v;
    case iMOBR_E:               return MOBR_E               += v;
    case iMOBR_S0:              return MOBR_S0              += v;
    case iMOBR_E0:              return MOBR_E0              += v;
    case iMOBQ_S:               return MOBQ_S               += v;
    case iMOBQ_E:               return MOBQ_E               += v;
    case iMOBQ_S0:              return MOBQ_S0              += v;
    case iMOBQ_E0:              return MOBQ_E0              += v;
    case iXRAY_BS:              return XRAY_BS              += v;
    case iXRAY_BE:              return XRAY_BE              += v;
    case iXRAY_RS:              return XRAY_RS              += v;
    case iXRAY_RE:              return XRAY_RE              += v;
    case iXRAY_QS:              return XRAY_QS              += v;
    case iXRAY_QE:              return XRAY_QE              += v;
  }
}

//}}}
//{{{  3. add to output

var lastOut = '';

function saveparams (err, epochs) {

  var d    = new Date();
  var out1 = '//{{{  eval weights\r\n';

  out1 += '//';
  out1 += '\r\n';
  out1 += '// file = ' + gFile;
  out1 += '\r\n';
  out1 += '// num positions = ' + epds.length;
  out1 += '\r\n';
  out1 += '// num features = ' + params.length;
  out1 += '\r\n';
  out1 += '// k = ' + gK;
  out1 += '\r\n';
  out1 += '// loss = ' + err;
  out1 += '\r\n';
  out1 += '// epochs = ' + epochs;
  out1 += '\r\n';
  out1 += '// last update = ' + d;
  out1 += '\r\n';
  out1 += '//';
  out1 += '\r\n\r\n';

  var out = '';

  out += loga(MATERIAL, 'MATERIAL');

  out += '\r\n';

  out +=  'var PAWN_CHAIN_S         = ' + PAWN_CHAIN_S + ';\r\n';
  out +=  'var PAWN_CHAIN_E         = ' + PAWN_CHAIN_E + ';\r\n';
  out +=  'var PAWN_DOUBLED_S       = ' + PAWN_DOUBLED_S + ';\r\n';
  out +=  'var PAWN_DOUBLED_E       = ' + PAWN_DOUBLED_E + ';\r\n';
  out +=  'var PAWN_ISOLATED_S      = ' + PAWN_ISOLATED_S + ';\r\n';
  out +=  'var PAWN_ISOLATED_E      = ' + PAWN_ISOLATED_E + ';\r\n';
  out +=  'var PAWN_BACKWARD_S      = ' + PAWN_BACKWARD_S + ';\r\n';
  out +=  'var PAWN_BACKWARD_E      = ' + PAWN_BACKWARD_E + ';\r\n';
  out +=  'var PAWN_PASSED_OFFSET_S = ' + PAWN_PASSED_OFFSET_S + ';\r\n';
  out +=  'var PAWN_PASSED_OFFSET_E = ' + PAWN_PASSED_OFFSET_E + ';\r\n';
  out +=  'var PAWN_PASSED_MULT_S   = ' + PAWN_PASSED_MULT_S + ';\r\n';
  out +=  'var PAWN_PASSED_MULT_E   = ' + PAWN_PASSED_MULT_E + ';\r\n';
  out +=  'var PAWN_OFFSET_S        = ' + PAWN_OFFSET_S + ';\r\n';
  out +=  'var PAWN_OFFSET_E        = ' + PAWN_OFFSET_E + ';\r\n';
  out +=  'var PAWN_MULT_S          = ' + PAWN_MULT_S + ';\r\n';
  out +=  'var PAWN_MULT_E          = ' + PAWN_MULT_E + ';\r\n';
  out +=  'var PAWN_PASS_FREE       = ' + PAWN_PASS_FREE + ';\r\n';
  out +=  'var PAWN_PASS_UNSTOP     = ' + PAWN_PASS_UNSTOP + ';\r\n';
  out +=  'var PAWN_PASS_KING1      = ' + PAWN_PASS_KING1 + ';\r\n';
  out +=  'var PAWN_PASS_KING2      = ' + PAWN_PASS_KING2 + ';\r\n';
  out +=  'var ATT_N                = ' + ATT_N + ';\r\n';
  out +=  'var ATT_B                = ' + ATT_B + ';\r\n';
  out +=  'var ATT_R                = ' + ATT_R + ';\r\n';
  out +=  'var ATT_Q                = ' + ATT_Q + ';\r\n';
  out +=  'var TWOBISHOPS_S         = ' + TWOBISHOPS_S + ';\r\n';
  out +=  'var TWOBISHOPS_E         = ' + TWOBISHOPS_E + ';\r\n';
  out +=  'var ROOK7TH_S            = ' + ROOK7TH_S + ';\r\n';
  out +=  'var ROOK7TH_E            = ' + ROOK7TH_E + ';\r\n';
  out +=  'var ROOKOPEN_S           = ' + ROOKOPEN_S + ';\r\n';
  out +=  'var ROOKOPEN_E           = ' + ROOKOPEN_E + ';\r\n';
  out +=  'var ROOK_DOUBLED_S       = ' + ROOK_DOUBLED_S + ';\r\n';
  out +=  'var ROOK_DOUBLED_E       = ' + ROOK_DOUBLED_E + ';\r\n';
  out +=  'var QUEEN7TH_S           = ' + QUEEN7TH_S + ';\r\n';
  out +=  'var QUEEN7TH_E           = ' + QUEEN7TH_E + ';\r\n';
  out +=  'var TRAPPED_S            = ' + TRAPPED_S + ';\r\n';
  out +=  'var TRAPPED_E            = ' + TRAPPED_E + ';\r\n';
  out +=  'var KING_PENALTY         = ' + KING_PENALTY + ';\r\n';
  out +=  'var TIGHT_NS             = ' + TIGHT_NS + ';\r\n';
  out +=  'var TIGHT_NE             = ' + TIGHT_NE + ';\r\n';
  out +=  'var TIGHT_BS             = ' + TIGHT_BS + ';\r\n';
  out +=  'var TIGHT_BE             = ' + TIGHT_BE + ';\r\n';
  out +=  'var TIGHT_RS             = ' + TIGHT_RS + ';\r\n';
  out +=  'var TIGHT_RE             = ' + TIGHT_RE + ';\r\n';
  out +=  'var TIGHT_QS             = ' + TIGHT_QS + ';\r\n';
  out +=  'var TIGHT_QE             = ' + TIGHT_QE + ';\r\n';
  out +=  'var TENSE_NS             = ' + TENSE_NS + ';\r\n';
  out +=  'var TENSE_NE             = ' + TENSE_NE + ';\r\n';
  out +=  'var TENSE_BS             = ' + TENSE_BS + ';\r\n';
  out +=  'var TENSE_BE             = ' + TENSE_BE + ';\r\n';
  out +=  'var TENSE_RS             = ' + TENSE_RS + ';\r\n';
  out +=  'var TENSE_RE             = ' + TENSE_RE + ';\r\n';
  out +=  'var TENSE_QS             = ' + TENSE_QS + ';\r\n';
  out +=  'var TENSE_QE             = ' + TENSE_QE + ';\r\n';
  out +=  'var MOBN_S               = ' + MOBN_S + ';\r\n';
  out +=  'var MOBN_E               = ' + MOBN_E + ';\r\n';
  out +=  'var MOBN_S0              = ' + MOBN_S0 + ';\r\n';
  out +=  'var MOBN_E0              = ' + MOBN_E0 + ';\r\n';
  out +=  'var MOBB_S               = ' + MOBB_S + ';\r\n';
  out +=  'var MOBB_E               = ' + MOBB_E + ';\r\n';
  out +=  'var MOBB_S0              = ' + MOBB_S0 + ';\r\n';
  out +=  'var MOBB_E0              = ' + MOBB_E0 + ';\r\n';
  out +=  'var MOBR_S               = ' + MOBR_S + ';\r\n';
  out +=  'var MOBR_E               = ' + MOBR_E + ';\r\n';
  out +=  'var MOBR_S0              = ' + MOBR_S0 + ';\r\n';
  out +=  'var MOBR_E0              = ' + MOBR_E0 + ';\r\n';
  out +=  'var MOBQ_S               = ' + MOBQ_S + ';\r\n';
  out +=  'var MOBQ_E               = ' + MOBQ_E + ';\r\n';
  out +=  'var MOBQ_S0              = ' + MOBQ_S0 + ';\r\n';
  out +=  'var MOBQ_E0              = ' + MOBQ_E0 + ';\r\n';
  out +=  'var XRAY_BS              = ' + XRAY_BS + ';\r\n';
  out +=  'var XRAY_BE              = ' + XRAY_BE + ';\r\n';
  out +=  'var XRAY_RS              = ' + XRAY_RS + ';\r\n';
  out +=  'var XRAY_RE              = ' + XRAY_RE + ';\r\n';
  out +=  'var XRAY_QS              = ' + XRAY_QS + ';\r\n';
  out +=  'var XRAY_QE              = ' + XRAY_QE + ';\r\n';

  out += '\r\n';

  out += logpst(WPAWN_PSTS,   'WPAWN_PSTS');
  out += logpst(WPAWN_PSTE,   'WPAWN_PSTE');
  out += logpst(WKNIGHT_PSTS, 'WKNIGHT_PSTS');
  out += logpst(WKNIGHT_PSTE, 'WKNIGHT_PSTE');
  out += logpst(WBISHOP_PSTS, 'WBISHOP_PSTS');
  out += logpst(WBISHOP_PSTE, 'WBISHOP_PSTE');
  out += logpst(WROOK_PSTS,   'WROOK_PSTS');
  out += logpst(WROOK_PSTE,   'WROOK_PSTE');
  out += logpst(WQUEEN_PSTS,  'WQUEEN_PSTS');
  out += logpst(WQUEEN_PSTE,  'WQUEEN_PSTE');
  out += logpst(WKING_PSTS,   'WKING_PSTS');
  out += logpst(WKING_PSTE,   'WKING_PSTE');

  out += logpst(BPAWN_PSTS,   'BPAWN_PSTS');
  out += logpst(BPAWN_PSTE,   'BPAWN_PSTE');
  out += logpst(BKNIGHT_PSTS, 'BKNIGHT_PSTS');
  out += logpst(BKNIGHT_PSTE, 'BKNIGHT_PSTE');
  out += logpst(BBISHOP_PSTS, 'BBISHOP_PSTS');
  out += logpst(BBISHOP_PSTE, 'BBISHOP_PSTE');
  out += logpst(BROOK_PSTS,   'BROOK_PSTS');
  out += logpst(BROOK_PSTE,   'BROOK_PSTE');
  out += logpst(BQUEEN_PSTS,  'BQUEEN_PSTS');
  out += logpst(BQUEEN_PSTE,  'BQUEEN_PSTE');
  out += logpst(BKING_PSTS,   'BKING_PSTS');
  out += logpst(BKING_PSTE,   'BKING_PSTE');

  out += logpst(WOUTPOST, 'WOUTPOST');
  out += logpst(BOUTPOST, 'BOUTPOST');

  out += loga(WSHELTER, 'WSHELTER');
  out += loga(WSTORM,   'WSTORM  ');

  out += '\r\n';

  out += loga(IMBALN_S, 'IMBALN_S');
  out += loga(IMBALN_E, 'IMBALN_E');
  out += loga(IMBALB_S, 'IMBALB_S');
  out += loga(IMBALB_E, 'IMBALB_E');
  out += loga(IMBALR_S, 'IMBALR_S');
  out += loga(IMBALR_E, 'IMBALR_E');
  out += loga(IMBALQ_S, 'IMBALQ_S');
  out += loga(IMBALQ_E, 'IMBALQ_E');

  //out += '\r\n';

  out = out + '\r\n//}}}\r\n';

  fs.writeFileSync(gOutFile, out1+out);
}

//}}}
//{{{  4. add to tuning

function createParams() {

  addp('knight', MATERIAL, KNIGHT);
  addp('bishop', MATERIAL, BISHOP);
  addp('rook',   MATERIAL, ROOK);
  addp('queen',  MATERIAL, QUEEN);

  for (var i=0; i <= 8; i++) {
    addp('n_imbal_s_'+i, IMBALN_S, i);
    addp('n_imbal_e_'+i, IMBALN_E, i);
    addp('b_imbal_s_'+i, IMBALB_S, i);
    addp('b_imbal_e_'+i, IMBALB_E, i);
    addp('r_imbal_s_'+i, IMBALR_S, i);
    addp('r_imbal_e_'+i, IMBALR_E, i);
    addp('q_imbal_s_'+i, IMBALQ_S, i);
    addp('q_imbal_e_'+i, IMBALQ_E, i);
  }

  for (var i=8; i < 56; i++) {
    var sq = B88[i];
    addp('wp_pst_s_'+COORDS[sq], WPAWN_PSTS, sq);
    addp('wp_pst_s_'+COORDS[sq], WPAWN_PSTE, sq);
  }

  for (var i=0; i < 64; i++) {
    var sq = B88[i];
    addp('wn_pst_s_'+COORDS[sq], WKNIGHT_PSTS, sq);
    addp('wn_pst_e_'+COORDS[sq], WKNIGHT_PSTE, sq);
    addp('wb_pst_s_'+COORDS[sq], WBISHOP_PSTS, sq);
    addp('wb_pst_e_'+COORDS[sq], WBISHOP_PSTE, sq);
    addp('wr_pst_s_'+COORDS[sq], WROOK_PSTS,   sq);
    addp('wr_pst_e_'+COORDS[sq], WROOK_PSTE,   sq);
    addp('wq_pst_s_'+COORDS[sq], WQUEEN_PSTS,  sq);
    addp('wq_pst_e_'+COORDS[sq], WQUEEN_PSTE,  sq);
    addp('wk_pst_s_'+COORDS[sq], WKING_PSTS,   sq);
    addp('wk_pst_e_'+COORDS[sq], WKING_PSTE,   sq);
  }

  for (var i=0; i < WSHELTER.length; i++) {
    addp('shelter_'+i, WSHELTER, i);
    addp('storm_'+i,   WSTORM,   i);
  }
  addp('k penalty s', null, iKING_PENALTY);

  var ko =[51,52,53,54,55,56,63,64,65,66,67,68,75,76,77,78,79,80]; //knight outpost squares
  for (var i=0; i < ko.length; i++) {
    var sq = ko[i];
    addp('outpost_'+COORDS[sq], WOUTPOST, sq);
  }

  addp('n_mob_s',  null, iMOBN_S);
  addp('n_mob_e',  null, iMOBN_E);
  addp('n_mob_s0', null, iMOBN_S0);
  addp('n_mob_e0', null, iMOBN_E0);
  addp('b_mob_s',  null, iMOBB_S);
  addp('b_mob_e',  null, iMOBB_E);
  addp('b_mob_s0', null, iMOBB_S0);
  addp('b_mob_e0', null, iMOBB_E0);
  addp('r_mob_s',  null, iMOBR_S);
  addp('r_mob_e',  null, iMOBR_E);
  addp('r_mob_s0', null, iMOBR_S0);
  addp('r_mob_e0', null, iMOBR_E0);
  addp('q_mob_s',  null, iMOBQ_S);
  addp('q_mob_e',  null, iMOBQ_E);
  addp('q_mob_s0', null, iMOBQ_S0);
  addp('q_mob_e0', null, iMOBQ_E0);

  addp('n_tight_s', null, iTIGHT_NS);
  addp('n_tight_e', null, iTIGHT_NE);
  addp('b_tight_s', null, iTIGHT_BS);
  addp('b_tight_e', null, iTIGHT_BE);
  addp('r_tight_s', null, iTIGHT_RS);
  addp('r_tight_e', null, iTIGHT_RE);
  addp('q_tight_s', null, iTIGHT_QS);
  addp('q_tight_e', null, iTIGHT_QE);

  addp('n_tense_s', null, iTENSE_NS);
  addp('n_tense_e', null, iTENSE_NE);
  addp('b_tense_s', null, iTENSE_BS);
  addp('b_tense_e', null, iTENSE_BE);
  addp('r_tense_s', null, iTENSE_RS);
  addp('r_tense_e', null, iTENSE_RE);
  addp('q_tense_s', null, iTENSE_QS);
  addp('q_tense_e', null, iTENSE_QE);

  addp('p_chain_s',      null, iPAWN_CHAIN_S);
  addp('p_chain_e',      null, iPAWN_CHAIN_E);
  addp('p_doubled_s',    null, iPAWN_DOUBLED_S);
  addp('p_doubled_e',    null, iPAWN_DOUBLED_E);
  addp('p_backward_s',   null, iPAWN_BACKWARD_S);
  addp('p_backward_e',   null, iPAWN_BACKWARD_E);
  addp('p_isolated_s',   null, iPAWN_ISOLATED_S);
  addp('p_isolated_e',   null, iPAWN_ISOLATED_E);
  addp('p_passoffset_s', null, iPAWN_PASSED_OFFSET_S);
  addp('p_passoffset_e', null, iPAWN_PASSED_OFFSET_E);
  addp('p_passmult_s',   null, iPAWN_PASSED_MULT_S);
  addp('p_passmult_s',   null, iPAWN_PASSED_MULT_E);
  addp('p_candoffset_s', null, iPAWN_OFFSET_S);
  addp('p_candoffset_e', null, iPAWN_OFFSET_E);
  addp('p_candmult_s',   null, iPAWN_MULT_S);
  addp('p_candmult_e',   null, iPAWN_MULT_E);
  addp('p_passfree',     null, iPAWN_PASS_FREE);
  addp('p_passunstop',   null, iPAWN_PASS_UNSTOP);
  addp('p_passking1',    null, iPAWN_PASS_KING1);
  addp('p_passking2',    null, iPAWN_PASS_KING2);

  addp('bispair_s', null, iTWOBISHOPS_S);
  addp('bispair_e', null, iTWOBISHOPS_E);

  addp('rook7th_s',   null, iROOK7TH_S);
  addp('rook7th_e',   null, iROOK7TH_E);
  addp('rookopen_s',  null, iROOKOPEN_S);
  addp('rookopen_e',  null, iROOKOPEN_E);
  addp('r_doubled_s', null, iROOKDOUBLED_S);
  addp('r_doubled_e', null, iROOKDOUBLED_E);

  addp('queen7th_s', null, iQUEEN7TH_S);
  addp('queen7th_e', null, iQUEEN7TH_E);

  addp('trapped_s', null, iTRAPPED_S);
  addp('trapped_e', null, iTRAPPED_E);

  addp('n_att', null, iATT_N);
  addp('b_att', null, iATT_B);
  addp('r_att', null, iATT_R);
  addp('q_att', null, iATT_Q);

  addp('b_xray_s', null, iXRAY_BS);
  addp('b_xray_e', null, iXRAY_BE);
  addp('r_xray_s', null, iXRAY_RS);
  addp('r_xray_e', null, iXRAY_RE);
  addp('q_xray_s', null, iXRAY_QS);
  addp('q_xray_e', null, iXRAY_QE);
}

//}}}

//{{{  functions

//{{{  wbmap

function wbmap (sq) {
  var m = (143-sq)/12|0;
  return 12*m + sq%12;
}

//}}}
//{{{  getprob

function getprob (r) {
  if (r == '1/2-1/2')
    return 0.5;
  else if (r == '1-0')
    return 1.0;
  else if (r == '0-1')
    return 0.0;
  else if (r == '"1/2-1/2"')
    return 0.5;
  else if (r == '"1-0"')
    return 1.0;
  else if (r == '"0-1"')
    return 0.0;
  else
    console.log('unknown result',r);
}

//}}}
//{{{  findK

function findK () {

  console.log('computing k');

  var best = 0;
  var err  = 0;
  var dir  = '';

  for (var i=0; i < gKList.length; i++) {

    gK  = gKList[i]
    err = calcErr();

    if (i != 0) {
      if (err > best)
        dir = '+';
      else {
        dir = '-';
        best = err;
      }
    }
    else {
      best = err
    }

    console.log(gK,err,dir);
  }
}

//}}}
//{{{  addp

function addp (s,a,i) {

  var v0 = tweak(a,i,0);

  params.push({s: s, a: a, i: i, v0: v0, inc: 1});
}

//}}}
//{{{  sigmoid

function sigmoid (x) {
  return 1.0 / (1.0 + Math.pow(10.0,-gK*x/400.0));
}

//}}}
//{{{  calcErr

function calcErr () {

  //{{{  sync black stuff
  
  for (var i=0; i < 144; i++) {
    BPAWN_PSTS[wbmap(i)]   = WPAWN_PSTS[i];
    BPAWN_PSTE[wbmap(i)]   = WPAWN_PSTE[i];
    BKNIGHT_PSTS[wbmap(i)] = WKNIGHT_PSTS[i];
    BKNIGHT_PSTE[wbmap(i)] = WKNIGHT_PSTE[i];
    BBISHOP_PSTS[wbmap(i)] = WBISHOP_PSTS[i];
    BBISHOP_PSTE[wbmap(i)] = WBISHOP_PSTE[i];
    BROOK_PSTS[wbmap(i)]   = WROOK_PSTS[i];
    BROOK_PSTE[wbmap(i)]   = WROOK_PSTE[i];
    BQUEEN_PSTS[wbmap(i)]  = WQUEEN_PSTS[i];
    BQUEEN_PSTE[wbmap(i)]  = WQUEEN_PSTE[i];
    BKING_PSTS[wbmap(i)]   = WKING_PSTS[i];
    BKING_PSTE[wbmap(i)]   = WKING_PSTE[i];
    BOUTPOST[wbmap(i)]     = WOUTPOST[i];
  }
  
  //}}}

  var err = 0;

  for (var i=0; i < epds.length; i++) {

    var epd = epds[i];

    uci.spec.board    = epd.board;
    uci.spec.turn     = epd.turn;
    uci.spec.rights   = epd.rights;
    uci.spec.ep       = epd.ep;
    uci.spec.fmc      = 0;
    uci.spec.hmc      = 0;
    uci.spec.id       = '';
    uci.spec.moves    = [];

    lozza.position();

    var pr = epd.prob;
    var ev = board.evaluate(board.turn);

    if (board.turn == BLACK)
      ev = -ev;               // undo negamax.

    var sg = sigmoid(ev);

    if (isNaN(ev) || isNaN(pr) || isNaN(sg) || sg > 1.0 || pr > 1.0 || sg < 0.0 || pr < 0.0) {
      console.log('nan eek',pr,sg,ev);
      process.exit();
    }

    err += (pr-sg) * (pr-sg);
  }

  return err / epds.length;
}

//}}}
//{{{  loga

function loga (p,s) {

  var a = Array(p.length);

  for (var i=0; i < p.length; i++)
    a[i] = p[i];

  return 'const ' + s + ' = [' + a.toString() + '];\r\n';
}

//}}}
//{{{  logpst

function logpst (p,s,_myround) {

  var a = Array(p.length);

  for (var i=0; i < p.length; i++)
    a[i] = p[i];

  var o = 'const ';

  o = o + s + ' = [';

  for (var i=0; i < 144; i++) {
    if ((i % 12) == 0)
      o = o + '\r\n  ';
    o = o + a[i].toString().padStart(4,' ');
    if (i < 143)
      o = o + ', ';
  }

  o = o + '\r\n];\r\n\r\n';

  return o;
}

//}}}
//{{{  grunt

function grunt () {

  lozza.newGameInit();

  if (gCalcK) {
    findK();
    process.exit();
  }

  console.log('k =', gK);
  console.log('positions =',epds.length);

  createParams();
  console.log('params =',params.length);

  console.log('calculating initial loss...');

  var epoch    = 1;
  var err      = 0;
  var bestErr  = calcErr();
  var lastErr  = bestErr;
  var changes  = 1;

  console.log('initial loss =',bestErr);

  while (changes > 0) {

    changes = 0;

    for (var i=0; i < params.length; i++) {

      process.stdout.write(i+'\r');

      var p = params[i];

      tweak(p.a,p.i,p.inc);
      err = calcErr();
      if (err < bestErr) {
        saveparams(err,epoch);
        //{{{  show change
        
        var v0 = p.v0;
        var v  = tweak(p.a,p.i,0);
        
        console.log(epoch,p.s,v0,'-->',v);
        
        //}}}
        changes++;
        bestErr = err;
        continue;
      }
      else {
        tweak(p.a,p.i,-p.inc);
      }

      tweak(p.a,p.i,-p.inc);
      err = calcErr();
      if (err < bestErr) {
        p.inc = -p.inc;
        saveparams(err,epoch);
        //{{{  show change
        
        var v0 = p.v0;
        var v  = tweak(p.a,p.i,0);
        
        console.log(epoch,p.s,v0,'--<',v);
        
        //}}}
        changes++;
        bestErr = err;
        continue;
      }
      else {
        tweak(p.a,p.i,p.inc);
      }
    }

    console.log(epoch,bestErr,changes,lastErr-bestErr,'                ');
    lastErr = bestErr;
    epoch++;
  }
}

//}}}

//}}}

//{{{  load the epds

var data  = fs.readFileSync('data/' + gFile, 'utf8');
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

  epds.push({board:   parts[0],
             turn:    parts[1],
             rights:  parts[2],
             ep:      parts[3],
             prob:    getprob(parts[gWDLIndex])});
}

lines = [];

//}}}

grunt();

process.exit();

