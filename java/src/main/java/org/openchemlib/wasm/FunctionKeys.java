package org.openchemlib.wasm;

/**
 * The 512 stored function keys, in plane order: bit i of a molecule's function words is
 * set when any fragment of key i is a substructure of it (see {@link Functions}).
 *
 * <p>Generated from {@code src/functionKeys/dictionary.json} by {@code npm run build-function-keys};
 * never edit it by hand. Changing, adding or reordering a key changes every stored record, so the
 * list only ever changes in a major release.
 */
final class FunctionKeys {
  private FunctionKeys() {}

  static final String[][] IDCODES = {
    {"gFp@DiTvjhCYbKFuX}OKv|_WP"}, // 0 six-membered ring
    { // 1 carbocycle, 6 fragments
      "eO@HyjCWOWgP",
      "gBP@DiVj`MROSr}m@",
      "gKP@Di\\Zj@uh}OKv|]@",
      "gFp@DiTvjhCUct|o[q}]@",
      "gOp@DiUkjj`M^OSr}oGu|}@",
      "daD@@DiUVzjj`CTP}Gd}gb}Wf}v`",
    },
    {"fH@LjKTZF@"}, // 2 heterocycle
    {"fH@LjMSZ@"}, // 3 aliphatic ring
    {"fH@LjMSZcPp@"}, // 4 aliphatic heterocycle
    {"fH@Lk[P"}, // 5 fused ring system
    { // 6 cycloalkane ring, 6 fragments
      "eO@HyjCkFU\u007FGFU@",
      "gBP@DiVj`NbFJ\\\u007FbPqSd",
      "gKP@Di\\Zj@zhXirW|ZFJ\\e@",
      "gFp@DiTvjhCiabgIZ\u007FbpqSdmP",
      "gOp@DiUkjj`NnFJ\\ejw|^FJ\\ejt",
      "daD@@DiUVzjj`ChPXT\\RZV^_qDFEGDfegd",
    },
    {"gFp@DiTvjhCYbKFq`a`jqz^Wmx~o`"}, // 7 six-membered heterocycle
    {"gKP@Di\\Zj@vhbqcACAVct|o[q|"}, // 8 five-membered heterocycle
    {"eO@HyjC[IcDLE\\}^_@"}, // 9 three-membered heterocycle
    {"gBP@DiVj`MbHmFBFBiGiy^w`"}, // 10 four-membered heterocycle
    {"dcl@@DjYU_egZjjjh@uNMIkMEjmMkmCj]Kk]Gk|[AbRrJjZzFfVvN@"}, // 11 biphenyl
    {"det@@DjYUX^fjjj`CiPhdlbjfnaijzFhtfltVjtvntNitn`"}, // 12 naphthalene
    {"det@@DjYUX^fjjj`CU`tfbtvatnoqtJEKDjekdZUX"}, // 13 tetralin
    {"diT@@DjYVnXZjjh@zdJIKDjekdZkAjMYjm]j]_bRIKHh"}, // 14 indane
    {"fgA@@@LdbbbTVKIBMjuUUUUT@GS`TIEbITfWHUJUZcUjhPZaiFlZIjffZyhViZUkVcZmivoZ@"}, // 15 phenanthrene
    {"dk|@@LdbbbRQKauSjjjjj@NkBbRrJjZyFfVvNj\\ZSVZKUZ{PzgRzwUz_WxxBrZ"}, // 16 fluorene
    {"fgA@@@DjYU_VByHujjjjjh@Ng@hRKDRiLnPjTjuFkUP`uCRMXtSUMLusPmRtkVmFu[Sm^t"}, // 17 anthracene
    {"diT@@Di[WBxVjjh@zdFEKDjikhZkYhmUim]j]_bPLJHh"}, // 18 indene
    {"fgAA@@@ILsJkdYHvkMUUUUP@]N@pTVHeRY\\aTiUjMVoDP~GH{Gj[FbZiifnZEjVeZuhvgZ}kYDWEIVW|P`XJGDRiLnPjTjuFkKkt"}, // 19 fluorenone
    {"fH@Njm@"}, // 20 aromatic ring
    {"gFp@DiTvjhCibdkQkUXuMKVt]WP"}, // 21 benzene ring
    {"gC`@H}PGQEIVkDQZnFiiZ\u007FGBdh"}, // 22 fused aromatic rings
    {"eF@Hp]IUYKLWxp`"}, // 23 biaryl
    {"gO|@AbeLm]UTAjqjZVcjz^oqxiJrZs`"}, // 24 2-aminopyrimidine
    {"gOt@Adigkjj`MVMSVt]WSu~OEINcV\\"}, // 25 2-aminopyridine
    {"gFtHLPDISNmUPFmFiiZNkk|VJRlfl"}, // 26 2-aminothiazole
    {"gKT@Adi\\Zj@zhiJtZmFiiZvch"}, // 27 imidazole
    {"gKX@@eKcUPGUEIVcUhuMKVt]@"}, // 28 pyrrole
    {"gKPH@DIRxuTAuQRUhuZMSRumGP"}, // 29 thiophene
    {"gKT@ADi\\Zj@zhiJtZmFiiZvch"}, // 30 pyrazole
    {"gKXHL@aJWFj`NjJRmFkQjZVmhz@"}, // 31 thiazole
    {"gKQ@@eKcUPGUEIVcUhuMKVt]@"}, // 32 furan
    {"gK\\@ABeKcUPGUEIVcUhuMKVt]@"}, // 33 1,2,4-triazole
    {"gKY@LDi\\Zj@zhiJtZmFiiZvch"}, // 34 oxazole
    {"gKR@AEdi\\Zj@zhiJtZmFiiZvch"}, // 35 tetrazole
    {"gK\\@ADeKcUPGUEIVcUhuMKVt]@"}, // 36 1,2,3-triazole
    {"gKY@HDi\\Zj@zhiJtZmFiiZvch"}, // 37 isoxazole
    {"gKTHLPDIRxuTAuQRUhuZMSRumGP"}, // 38 1,3,4-thiadiazole
    {"gKU@HPeKcUPGUEIVcUhuMKVt]@"}, // 39 1,2,4-oxadiazole
    {"gKU@LPeKcUPGUEIVcUhuMKVt]@"}, // 40 1,3,4-oxadiazole
    {"gKU@H`eKcUPGUEIVcUhuMKVt]@"}, // 41 1,2,5-oxadiazole
    {"gKXHH@aJWFj`NjJRmFkQjZVmhz@"}, // 42 isothiazole
    {"diV@@@RfU|kajjj`CjPhdlbjfnajjFhtfltVjtvntNit"}, // 43 indole
    {"dev@@@rQQJHtpsUUUPAthTRVQUSWPtu]CTZSVZKUZ[WZGTzWP"}, // 44 quinoline
    {"diT`@@rnRfUjEnjjj`CjPhdlbjfnajjFhtfltVjtvntNit"}, // 45 purine
    {"diU@@@iJYWrnFjjj@NiBbRrJjZzFjhZcRZsQZkSZ{PzgP"}, // 46 benzimidazole
    {"diTD@@iJYWrnFjjj@NiAbQrJiZzF|dOcuYMYjmMkmSk^QT^W|UAaRrIjZzEf@"}, // 47 1,3-benzodioxole
    {"diV@@@RfU|kajjj`CjPXd\\bjVnajlfluVfuviu~I@pdb`"}, // 48 indoline
    {"detH@@rQQJHtpsUUTpAthLRNQUKOPtuVSVZ[WZGRz\u007FF`XRZYP"}, // 49 2H-chromene
    {"deu@@@kIEDhcSCMUUU@GRaQIYEUM]CSUtMQiMYhmUim]h]Si]@"}, // 50 quinazoline
    {"diV@`J@HRfU|kajjj`CjPhdlbjfnajjFhtfltVjtvntNit"}, // 51 benzothiazole
    {"diTH@@RfU|kajjj`CjPhdlbjfnajjFhtfltVjtvntNit"}, // 52 benzofuran
    {"dev@@@Re[TjFZjjj@NeBbRrJjZzFfkhZcRZsQZkSZ{PzgRz@"}, // 53 isoquinoline
    {"deu@@@[IEDhcSCMUUU@GRaQIYEUM]CSUtMQiMYhmUim]h]Si]@"}, // 54 quinoxaline
    {"fgA`@@@ISLrotyHvkUUUUUP@]NAPdVHeRY\\aTiUjMVjaAjFdZqhfjZYkfaZeiVmZMjvgZ}h"}, // 55 acridine
    {"dev@@@rQQJHtpsUUUPAthLRNQUKOPtuVSVZ[WZGRz\u007FF`XRZYP"}, // 56 1,2,3,4-tetrahydroquinoline
    {"diT@`@BDie_JxZjjh@zdJIKHjikhZjajMIkMEjmMkmCj]@"}, // 57 benzothiophene
    {"dk~@@@RfYU_JGUNjjjjh@zlJIKHjikhZY[XzoajMIkMEjmMkmCj]Kk]Gj}Oh"}, // 58 carbazole
    {"diU@@@aJVupnFjjj@NiBbRrJjZzFjhZcRZsQZkSZ{PzgP"}, // 59 indazole
    {"diVH@JAJYWrnFjjj@NiBbRrJjZzFjhZcRZsQZkSZ{PzgP"}, // 60 benzoxazole
    {"fgA`B@N@BDifYWz\\d[Ujjjjjh@Ng@XRKDRiLnHjTjuFkUSHucQMTusPmRtkVmFt{Wm_bPCAXvP"}, // 61 phenothiazine
    {"diU@@@qJYVkfFjjj@NiBbRrJjZzFjhZcRZsQZkSZ{PzgP"}, // 62 7-azaindole
    {"det`@@rnRfUnazZjjj@NeBbRrJjZzFfkhZcRZsQZkSZ{PzgRz@"}, // 63 pteridine
    {"diW@@@aDiUWBxZjjh@zdJIKHjikh[rXyOUPuFdufbuVfuvauNmieJ\u007FbhTRVQUSWPtp"}, // 64 benzotriazole
    {"diW@@@bdjV\\fxZjjh@zdJIKHjikhZjajMIkMEjmMkmCj]@"}, // 65 pyrazolo[1,5-a]pyrimidine
    {"diVH@HAJVupnFjjj@NiBbRrJjZzFjhZcRZsQZkSZ{PzgP"}, // 66 1,2-benzisoxazole
    {"fgAA@@@ISLrotyHvkUUUUUP@]N@pdVHeRY\\QTiUjMVoD`zGp}GjYFlZIjfnZEjVeZuhvgZ}k]HUEqZWc\u007FDHFBbqDjSGdJeJmQjrz}@"}, // 67 xanthene
    {"dk|H@@RfYU_JGUNjjjjh@zlJIKHjikhZY[XzoajMIkMEjmMkmCj]Kk]Gj}Oh"}, // 68 dibenzofuran
    {"fgAP@@@\\RfYe_irQmVjjjjj`@z\\BaHlQJdryBiRkTZmUBCTMHucQMTtsWMBuKRmZt[UmNu{P"}, // 69 phenazine
    {"deu@@@aJUURhYjjjh@zTJIKHjikhZZnajMIkMEjmMkmCj]Kh"}, // 70 phthalazine
    {"diV@@@RieZyajjj`CjPhdlbjfnajjFhtfltVjtvntNit"}, // 71 indolizine
    {"deu@@@qJYVzxYjjjh@zTJIKHjikhZZnajMIkMEjmMkmCj]Kh"}, // 72 1,8-naphthyridine
    { // 73 aromatic five-membered ring with two heteroatoms, 2 fragments
      "gKP@Di\\Zj@zhiJtZrDbaCAHXJtZfekZN`",
      "gKP@Di\\Zj@zhiJtZrFbaCAhXJtZfekZN`",
    },
    {"gKP@Di\\Zj@zhiJtZtDXHXJtZfekZN`"}, // 74 aromatic five-membered ring with one heteroatom
    { // 75 aromatic six-membered ring with two heteroatoms, 3 fragments
      "gFp@DiTvjhCibdkQkVPdTHXICAUcTtm[Qu]@",
      "gFp@DiTvjhCibdkQkVPtTHXMCAUcTtm[Qu]@",
      "gFp@DiTvjhCibdkQkVPlTHXKCAUcTtm[Qu]@",
    },
    { // 76 aromatic five-membered ring with three heteroatoms, 2 fragments
      "gKP@Di\\Zj@zhiJtZvDT\\HXIC@hXJtZfekZN`",
      "gKP@Di\\Zj@zhiJtZvDL\\HXIC@XXJtZfekZN`",
    },
    { // 77 aromatic six-membered ring with three heteroatoms, 3 fragments
      "gFp@DiTvjhCibdkQkVpbcaCAHXECAUcTtm[Qu]@",
      "gFp@DiTvjhCibdkQkVpacaCAHXCCAUcTtm[Qu]@",
      "gFp@DiTvjhCibdkQkVpqcaCAhXCCAUcTtm[Qu]@",
    },
    { // 78 pyridine-type aromatic nitrogen, 4 fragments
      "fJ@GU[k\u007FeP",
      "fJRPNjwX",
      "fJS`NjwL",
      "fJRPNjwT",
    },
    {"fJ@GU^kwO\u007FJ`"}, // 79 pyrrole-type aromatic NH
    {"gFx@@eJfuU@]LTeZMZkFiiZvcjz@"}, // 80 pyridine
    {"gFt@AdiTvjhCibdkQkUXuMKVt]WP"}, // 81 pyrimidine
    {"gFt@ATiTvjhCibdkQkUXuMKVt]WP"}, // 82 pyrazine
    {"dmv@B@BTif[zzjjj`CkPhdlbjfnaiekTSCJ~`GkhZcRZsQZkSZ{PzgRzw@W|]BbRrJjZzFfV{QLLj"}, // 83 pyridinium
    {"gF|@AbeJfuU@]LTeZMZkFiiZvcjz@"}, // 84 1,3,5-triazine
    {"gFt@ADiTvjhCibdkQkUXuMKVt]WP"}, // 85 pyridazine
    {"gF|@ABeJfuU@]LTeZMZkFiiZvcjz@"}, // 86 1,2,4-triazine
    { // 87 imidazol-2-one, 2 fragments
      "gFu@E`drfmT`]POxlLTyKT",
      "gFu@E`drfmU@]PMY]_bpqSdm`",
    },
    { // 88 pyrazolone, 2 fragments
      "gFu@DPdrfmS@]POxlLTyKT",
      "gFu@DPdrfmU@]PMX]_bpqSduP",
    },
    {"gF}@EbDfTujdCjA\u007FEabgIZ`"}, // 89 1,2,4-triazol-3-one
    {"deuH@DpDfUUJaejjj`Ck`RjfnaijmVfuvauNeu~M@phxd`"}, // 90 benzimidazolone
    { // 91 isothiazolinone, 2 fragments
      "gFyHIPDIRnMRpGTk~KCENRu@",
      "gFyHIPDIRnMTpGTkV[WxlLTzKT",
    },
    {"gKY@DDf\\Vj@zhXirW|ZFJ\\e@"}, // 92 beta-lactam
    {"diVH`LD@cIEDhRZnjjfPCzHo|UAaQqIiYyEe@"}, // 93 cephem
    {"dafH`Lx@cIEDceDuUSPA}DW~L`phxdtl|b`"}, // 94 penam
    {"dafH@DAIfwJ[fjZ`CzJo|YAaQqIiYyE@"}, // 95 carbapenem nucleus
    { // 96 4-pyrimidinone, 4 fragments
      "gOu@Dpdrm[TlAu@\u007FcpqSdmV`",
      "gOu@Dpdrm[ULAu@uau~OCENSUZ",
      "gOu@Dpdrm[RtAu@\u007FcpqSdmV`",
      "gOu@Dpdrm[STAu@uau~OCENSUZ",
    },
    { // 97 4-quinazolinone, 2 fragments
      "dmMH@DxDfVUzzUZjZj@NnArjZFfVjqZkWZGTzwWxlCBcbrj",
      "dmMH@DxDfVUzzUZZjj@NnArjZFfVjqZkWZGTzwWxlCBcbrj",
    },
    { // 98 3-pyridazinone, 2 fragments
      "gOu@DPdrm[TlAu@\u007FcpqSdmV`",
      "gOu@DPdrm[ULAu@uau~OCENSUZ",
    },
    { // 99 2-pyrazinone, 2 fragments
      "gOu@EPdrm[TlAu@\u007FcpqSdmV`",
      "gOu@EPdrm[TtAu@ueu~OCENRvZ",
    },
    {"gOu@E`drm[ULA\u007FGabgIZm@"}, // 100 3,4-dihydropyrimidin-2(1H)-one
    {"gFy@DDfTujhCiabgIZ\u007FbpqSdmP"}, // 101 gamma-lactam
    {"gFp`@dfTujhCiabgIZ\u007FbpqSdmP"}, // 102 gamma-lactone
    { // 103 butenolide, 4 fragments
      "gFp`@dfTujXChabduY__cPqSdh",
      "gOq`@fdrikTlAuPqRUlXtD@bl_OqxXirVk^q`",
      "gFp`@dfTujhChabduT]WwxtLTyL",
      "gOq`@fdrikULAuPqRUlXtD@bjNgs|^FJ\\fjwlX",
    },
    {"gFu@E`drfmU@]LLTyKW|VFJ\\ej"}, // 104 imidazolidin-2-one
    {"devH@DAIeURhYZjjh@uZmMkmCj]Kk|]AaQqIjZzFfV@"}, // 105 oxindole
    {"dmND@DCdfVUrjUZjZj@NeAarIjZyFfVjqZkWZGTzwWxlCBcbrj"}, // 106 phthalimide
    {"gOy@DDfUkZj`NnFJ\\ejw|^FJ\\ejt"}, // 107 delta-lactam
    {"gOx`DFdrikULAupqSdmV\u007FcpqSdmV`"}, // 108 succinimide
    {"gFx`LDdrfmU@]LLTyKW|VFJ\\ej"}, // 109 2-oxazolidinone
    {"gOt`E`tfUMZi`NnFJ\\ejw|^FJ\\ejt"}, // 110 hydantoin
    {"gOp`@dfUkZj`NnFJ\\ejw|^FJ\\ejt"}, // 111 delta-lactone
    { // 112 2,5-diketopiperazine, 3 fragments
      "daED@DhNRYWifjf@NbAaYy\u007FDPXT\\RZV^P",
      "daED@DhNRYWifjf@NbAaYykFZ\u007FDPXT\\bZV^P",
      "daED@DhNRYWifjf@NbAaYyjfZKWxbCBcdURsr",
    },
    {"dieL@DpFEIeYkfjY`CjPXT\\RZV^Q_qdFEGDfegdT"}, // 113 barbiturate
    {"gOxhCf@cIEDSZZXCkabgIZm\u007FGabgIZm@"}, // 114 2,4-thiazolidinedione
    {"gFyHMPDIR~MTpGSCENRu}@~uFg^C_xlLTyKT"}, // 115 4-thiazolidinone
    {"dmNH@DAIe[VfeVjjj`CUjtvntNiunoqLFEGDfikhZYWX"}, // 116 3,4-dihydroquinolin-2(1H)-one
    {"daFD@DCdfYRYje`C~H`phxdtl|`"}, // 117 N-substituted maleimide
    { // 118 4-pyranone, 3 fragments
      "gOp`@tfUkZV`NhG|^FJ\\ejt",
      "gOp`@tfUkZZ`NhFlNoqxXirZkP",
      "gOp`@tfUkZj`NhFjvck|^FJ]Fjt",
    },
    { // 119 chromone, 2 fragments
      "dmLD@@yIee^neVfjj`Ck`\\jfaiejlVjuvauNmu~K@phxlj`",
      "dmLD@@{HhheDVzUZjjj@NnARJjFfVkvZKUZ{PzgVz\u007FE`XTZfUP",
    },
    { // 120 2-pyranone, 4 fragments
      "gOp`@dfUkZe`NhG|^FJ\\ejt",
      "gOp`@dfUkZi`NhFlNoqxXirZkP",
      "gOp`@dfUkZf`NhFlnoqxXirVsP",
      "gOp`@dfUkZj`NhFjNkk|^FJ\\flt",
    },
    { // 121 coumarin, 2 fragments
      "dmLD@@QIe[VfeVijj`Ck`RfnaiejmVfuvauNmu~K@phxdj`",
      "dmLD@@QIe[VfeVjjj`Ck`Rfnaiej|VjtvntNiunoqXFEGDiT",
    },
    {"foQ@`@@BRYfYWvBUXsfjjjjj@CjpEEbITfWJTjuFkSjilZIjffZEjVeZuhvkZ}hNoqhA`h^Kd"}, // 122 xanthone
    { // 123 isocoumarin, 2 fragments
      "dmLD@@QIee^neVjfj`Ck`\\jfaiejlVjuvauNmu~K@phxlj`",
      "dmLD@@QIee^neVjjj`Ck`\\jfaiej|VjtvntNiunoqXFEGEiT",
    },
    { // 124 2-pyridone, 4 fragments
      "gOy@DDfUkZe`NhG|^FJ\\ejt",
      "gOy@DDfUkZi`NhFlNoqxXirZkP",
      "gOy@DDfUkZf`NhFlnoqxXirVsP",
      "gOy@DDfUkZj`NhFjNkk|^FJ\\flt",
    },
    { // 125 4-pyridone, 3 fragments
      "gOy@FDfUkZV`NhG|^FJ\\ejt",
      "gOy@FDfUkZZ`NhFlNoqxXirZkP",
      "gOy@FDfUkZj`NhFjvck|^FJ]Fjt",
    },
    { // 126 4-quinolone, 2 fragments
      "dmNH@NAIee^neVfjj`Ck`\\jfaiejlVjuvauNmu~K@phxlj`",
      "dmNH@NCHhheDVzUZjjj@NnARJjFfVkvZKUZ{PzgVz\u007FE`XTZfUP",
    },
    {"dg~L@E@YrJJJJIJlivuMMUT@]BCdutKl]]Yl[mNzmVftnmt^gu~O`phxduM\\brk[GVo@"}, // 127 quinolone antibacterial core
    { // 128 2-quinolone, 2 fragments
      "dmNH@DAIe[VfeVijj`Ck`RfnaiejmVfuvauNmu~K@phxdj`",
      "dmNH@DAIe[VfeVjjj`Ck`Rfnaiej|VjtvntNiunoqXFEGDiT",
    },
    { // 129 1-isoquinolone, 2 fragments
      "dmNH@DAIee^neVjfj`Ck`\\jfaiejlVjuvauNmu~K@phxlj`",
      "dmNH@DAIee^neVjjj`Ck`\\jfaiej|VjtvntNiunoqXFEGEiT",
    },
    {"foQa@@A@RYfYWvBUXsfjjjjj@CjpEEbITfWJTjuFkSjilZIjffZEjVeZuhvkZ}hNoqhA`h^Kd"}, // 130 acridone
    {"gFx@@eJfuU@]LLTyKW|VFJ\\ej"}, // 131 piperidine
    {"gKX@@eKcUPGUCENR\u007FcPqSdh"}, // 132 pyrrolidine
    {"gFq@@eJfuU@]LLTyKW|VFJ\\ej"}, // 133 tetrahydropyran
    {"gKQ@@eKcUPGUCENR\u007FcPqSdh"}, // 134 tetrahydrofuran
    {"gFt@ATiTvjhCiabgIZ\u007FbpqSdmP"}, // 135 piperazine
    {"gFy@JDiTvjhCiabgIZ\u007FbpqSdmP"}, // 136 morpholine
    {"dcm@@@UJfUWyYvjjjj@MVsQZ{PzWQz\u007FFpXT\\bjV^aiUmS`"}, // 137 arylpiperazine
    {"dcn@@@Re]eRi]jjjj`CUfuvauNet^oqlFEGDfekhZY[Tx"}, // 138 4-arylpiperidine
    {"dev@@@Re[TjFZjjj@NeAaQrIjZzFfjqZkSZ{PzWWxtCBccJ"}, // 139 1,2,3,4-tetrahydroisoquinoline
    {"detH@@rQQJHtpsUUUPAthLRNQUKOPtuVSVZ[WZGRz\u007FF`XRZYP"}, // 140 chromane
    {"gKT@Adi\\Zj@zhXirW|ZFJ\\e@"}, // 141 imidazolidine
    {"gOq@@eJm]UTAupqSdmV\u007FcpqSdmV`"}, // 142 oxepane
    {"gKP`Adi\\Zj@zhXirW|ZFJ\\e@"}, // 143 1,3-dioxolane
    {"diTH@@RfU|kajjj`CjPXd\\bjVnajlfluVfuviumD]O|RAaIE@"}, // 144 2,3-dihydrobenzofuran
    {"gOx@@eJm]UTA\u007FGabgIZm@"}, // 145 azepane
    {"gFp`AdiTvjhCiabgIZ\u007FbpqSdmP"}, // 146 1,3-dioxane
    {"daf@@@RfYIjzjjh@\u007FcHLJNIMKOHh"}, // 147 tropane skeleton
    {"daf@@@RiUkfzjjh@zDFEGDfegg|YAaQqIiYyE@"}, // 148 quinuclidine
    {"gKPH@DIRxuTAuPqSdoxtLTyJ"}, // 149 tetrahydrothiophene
    {"gOy`LB|dTQujY`NnFJ\\ejvJJB@PtD@c|^FJ\\ejwjK@"}, // 150 oxazolidine
    {"gFp`ATiTvjhCiabgIZ\u007FbpqSdmP"}, // 151 1,4-dioxane
    {"gFxHJ@aJUMjj@zXXirVoxlLTyKT"}, // 152 thiomorpholine
    {"eOHBNZ`zqe_qqeP"}, // 153 epoxide
    {"gBX@@eJuTAtPqSg|RFJ\\`"}, // 154 azetidine
    {"eO`BNZ`zqe_qqeP"}, // 155 aziridine
    {"gBQ@@eJuTAtPqSg|RFJ\\`"}, // 156 oxetane
    {"gOyDLpDHHRY\\ujf@zxXirVk_HNgna][\u007FGabgIZm@"}, // 157 rhodanine
    {"gKT@Adi\\Vj@zhXirW|ZFJ\\e@"}, // 158 2-imidazoline
    {"dmM@@@eJYY]iEZjjj`CihlbnaejkGdufb|vntOitomu~J@t`"}, // 159 1,4-benzodiazepine
    {"gKT@ADi\\Yj@zhXirW|ZFJ\\e@"}, // 160 2-pyrazoline
    { // 161 1,4-dihydropyridine, 3 fragments
      "gFx@@eJftm@]RnyW~KCENRu@",
      "gFx@@eJftu@]RmYm[e_xlLTzKT",
      "gFx@@eJfuU@]RmTm[VyW~KCEVbu@",
    },
    { // 162 2-oxazoline, 2 fragments
      "gOy`JBtieujU`NnFJ\\ejvJJB@PtD@cZUm\u007FrVqxXirVk^hl",
      "gOyaJB{JTrzuJpGWCENRu[EEA@HZB@QmJv\u007FcpqSdmV}QX",
    },
    {"deL@@DjUYkfEijjjj@NeAaQqIiYyEe\u007FDpXT\\RZV^QYU]P"}, // 163 adamantane
    {"dnD@@DjUJbZjj`Ck`XT\\RZV_qDFEGDfegd"}, // 164 norbornane
    { // 165 norbornene, 2 fragments
      "dnD@@DiYpjYjj`Cjd\\RZV]hEb\u007FbHLJNIMKOH",
      "dnD@@DjUJjZjj`Cj`T\\ZVZqfmiEJ\u007FbHLJNQMKOH",
    },
    {"dV{Y@@@@@JaBDHPaBDHPaBDHPaBDHPQBDHPaBDHPaBDHPaBDHH`bBHH`aDDHPaDDHPaBDHP`dDPQADDH`aBDH`aBDHPaBDDPcFDXHEBLXQ`b@hLCXHKdahV@qt[dqBWDU|UPHbDghzMVY~UdDNJuysObe~@RDsXPlQRuEkLQmqVpecRQLyKPT]YR\\M^tuSKVu]NstG_T\\CYtLWHu]UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUP@@]Mp@pB`N@dCPK@|BHL`jChI`vBxO`aCDJPyBTMPmCtHpsBlNpgC\\Kp\u007FBBLHhcbIHtbrOHbcJJhzbZMhnczHXqbfNXecVKX}bNLxkcnIxwb~Ox`SAJDxRQMDlSqHdrRiNdfSYKd~RELTiSeITuRuOTcSMJt{R]MtoS}HLprcNLdsSKL|rKLljskIlvr{OlasGJ\\yrWM\\\u007Fcl`C@J@xBPM@lCpH`rBhN`fCXK`~BDLPiCdIPuBtOPcCLJp{B\\MpoC|HHpbbNHdcRKH|bJLhjcjIhvbzOhacFJXybVMXmcvHxsbnNxgc^Kx\u007FbALDhSaIDtRqODbSIJdzRYMdnSyHTqReNTeSUKT}RMLtkSmItwR}Ot`sCJLxrSMLlssHlrrkNlfs[Kl~rGL\\isgI\\urwO\\csOJ|{r_M|os\u007FHBpJ`nBdKPkB|JHlbjKhibvJxobaKDjRyJTmRmKthrsJloSY@pBB`XN@PdECPLKAp|@bHRLahzAbXVM`xnGcxAHQDqBRdYNPTeERt]OPLcDsLKJql{Ar\\WMp|oGs|@hIBpbJbXnIRtcJr\\oHJbdkJJjijzajZVmhzngkzAhYFif[fEiYVucZv]oXNcd{NKjx"}, // 166 decalin
    {"gFp@DiTvjhCiabgIZ\u007FbpqSdmP"}, // 167 cyclohexane
    {"gKP@Di\\Zj@zhXirW|ZFJ\\e@"}, // 168 cyclopentane
    {"gFp@DiTujhCiabgIZ\u007FbpqSdmP"}, // 169 cyclohexene
    {"eO@HyjCkFU\u007FGFU@"}, // 170 cyclopropane
    {"gBP@DiVj`NbFJ\\\u007FbPqSd"}, // 171 cyclobutane
    { // 172 quinone, 6 fragments
      "daDD@@yIe^fZVX@zPGfiQiMUkm_bPNIKH",
      "daDD@@yIe^fZZX@zPGfmQiMEjm]k|RAqJY@",
      "daDD@@yIe^fZjX@zPGfkQiMYhmUkm_bPNQSH",
      "daDD@@IIf]nZYX@zPDfiQiMEkm_bPNMKH",
      "daDD@@IIf]nZYh@zPDfmQiMEim]k|RAqiZ@",
      "daDD@@IIf]nZZh@zPDfkQiMEjmMkm_bPNMSP",
    },
    {"f`i@`@@VRYfYU]`eNMyh@`AB@@H"}, // 173 anthraquinone
    {"dclD@@UIeeUkiuijij@MVKUZ{PzWQz\u007FFpXT\\Rjf^aiUmS`"}, // 174 1,4-naphthoquinone
    {"eF@Hh]Hs~LH"}, // 175 alkene
    {"eM@HvCkFV\u007FEFP"}, // 176 vinylarene
    {"gC`@Die@zHXis~NCEH"}, // 177 conjugated diene
    {"eF@Hh]HszM\u007FFD"}, // 178 terminal alkene
    {"gJP@DkVdCjabgI]tVUOTw|RFJ\\`"}, // 179 1,4-diene
    {"eF@Hx]Hs~LH"}, // 180 alkyne
    {"eF@Hx]HsyGg\u007FFD"}, // 181 internal alkyne
    {"eF@Hx]HszK\u007FFD"}, // 182 terminal alkyne
    {"gC`@Dky@zHXis~NCEH"}, // 183 enyne
    {"didD@@iIYgxVjj`CjPXTlbjVnaoQUuYMYjmMkmCkZQZ_~QUc`LIH"}, // 184 salicyloyl
    { // 185 benzoyl, 2 fragments
      "didH@@RYm^Ejjh@zDFEHjikhZtYyd\\kjvokFxqdBEVsQZkSZ{Pz\u007FFPXT\\bjfna`",
      "didD@@QInUxVjj`CjPXTlbjfnaoMce]Vu}XwUltVjtvntNoqdFEGHjikhX",
    },
    {"didH@@RYm^Ejjh@~cMjvZKUZ[WZGWxrCBcdUTutL"}, // 186 phenacyl
    {"gNq@@dsSUPGSCEIZmmM{Gks{|VFJ\\ej"}, // 187 pivaloyl
    {"dmtH@@RYvUeVfjjBLneAaQIjZzFfVmF^EKJz]kzqn[VzmVfuvauNeu~N`phxduM]CSK@"}, // 188 cinnamoyl
    { // 189 methacryloyl, 2 fragments
      "gGQ@@dsMLAuPqRVmioH{^cMCA~MCENR`",
      "gGQ@@dsMLAtpqShm_H{^\u007FFabgIP",
    },
    {"did@@Di[WaZjjB@ldAx_P`piEUM]CVcOHEq]VsQZkSZ{Pz\u007FG@XTP"}, // 190 styryl
    {"eM@HvCiF[SyKm\u007FEFP"}, // 191 vinyl group
    { // 192 allyl, 3 fragments
      "gC`@DkZ@zpXimM{ByjvLtLGxxLT`",
      "gC`@DkZ@zHXiu{Byjw|\\FJP",
      "gC`@DkZ@rfcQCEN_XWMV\u007Fc`qR",
    },
    {"gGQ@@eMUTAuPqrVmho[\\^o[`_~PVMCENR`"}, // 193 tert-butoxy
    {"gJQ@@eMU@]DL\\emE{R}q{|RFJ\\`"}, // 194 isopropoxy
    {"eF@Hp]Pvkt]~LH"}, // 195 methyl group
    {"eM@HzCiF[SyMn\u007FEFP"}, // 196 ethyl group
    {"gC`@Dij@zpXimM{CYj{|\\FJP"}, // 197 n-propyl
    {"gC`@H}PGVCEMioXWNW_c`qR"}, // 198 isopropyl
    {"gGP@DiVj`LfGci|y^oiabgIZ~XvZmvg[oxtLTyJ"}, // 199 long alkyl chain
    {"gJP@H~j@zHXisZGvgKmwxdLTy@"}, // 200 tert-butyl
    { // 201 n-butyl, 5 fragments
      "gJP@DiZhChabgMh_D[MV{hppp_bPqSd",
      "gJP@DiZhCjabgIoD[MV{oqHXir",
      "gJP@DiZhCjabgI_D[MVgmsS|RFJ\\`",
      "gJP@DiZhCJFMTLTyKxcYjw]~ICENP",
      "gJP@DiZhCjabgI_T[MVysvyg~ICENP",
    },
    { // 202 n-pentyl, 5 fragments
      "gGP@DiVj`NjFJ\\emKzcYjwZ^cKCA~MCENR`",
      "gGP@DiVj`NfFJ\\emzcYjwZ^\u007FFabgIP",
      "gGP@DiVj`NfFJ\\ekzcYjw[^wCOqhXirT",
      "gGP@DiVj`LiXtpqSdm_T[MV{SwxtLTyJ",
      "gGP@DiVj`NfFJ\\ekycYjwZWo[a_xtLTyJ",
    },
    { // 203 isobutyl, 5 fragments
      "gJP@DjZhChabgMh_DWMW[hppp_bPqSd",
      "gJP@DjZhCjabgIoDWMW[oqHXir",
      "gJP@DjZhCjabgI_DWMW[mps|RFJ\\`",
      "gJP@DjZhCJFMTLTyKxbyj{]~ICENP",
      "gJP@DjZhCjabgI_TWMW[b~xW~ICENP",
    },
    { // 204 n-octyl, 5 fragments
      "diD@@DiUVjj`ChPXT\\RZV^[POaCXuMsRvm[^zLCCA~H`phxdtl|`",
      "diD@@DiUVjj`CjPXT\\RZV^QoBFqj[femZv}wxbCBcbSRsr",
      "diD@@DiUVjj`CjPXT\\RZV^Q_BFqj[femZvcvxz_bHLJNIMKOH",
      "diD@@DiUVjj`CJAcT`phxdtl|b~DMcTwMKZum{oqDFEGDfegd",
      "diD@@DiUVjj`CjPXT\\RZV^Q_RFqj[femZv|x}nN_xbCBcbSRsr",
    },
    { // 205 n-hexyl, 5 fragments
      "gNp@DiUjj@zXXirVmh\u007FL[MV{SmzL\\LGxlLTyKT",
      "gNp@DiUjj@zxXirVkoL[MV{Sm{|VFJ\\ej",
      "gNp@DiUjj@zxXirVk_L[MV{Sk{\\l\u007FEabgIZ`",
      "gNp@DiUjj@rccWCENRu[ycYjwZ]o_bpqSdmP",
      "gNp@DiUjj@zxXirVk_\\[MV{Sm]}nU\u007FbpqSdmP",
    },
    { // 206 sec-butyl, 5 fragments
      "gJP@DjZhChabdmioDWMWGhsPp_bPqSd",
      "gJP@DjZhCjabgQ_DWMWGoqHXir",
      "gJP@DjZhCjabgI_DWMwGmqS|RFJ\\`",
      "gJP@DjZhCJZMTLTyKxbyjx}~ICENP",
      "gJP@DjZhCjabgI_TWMS{cvxg~ICENP",
    },
    { // 207 isopentyl, 5 fragments
      "gGP@LdbMU@]TLTyKZWuEsUvx{FVFC|ZFJ\\e@",
      "gGP@LdbMU@]LLTyK[uEsUvx{~MCENR`",
      "gGP@LdbMU@]LLTyKWuEsUvx{nV_cPqSdh",
      "gGP@LdbMU@YRqiabgIZ~hnZnwG_qhXirT",
      "gGP@LdbMU@]LLTyKWsEsUvx{WwJ\u007FqhXirT",
    },
    { // 208 neopentyl, 5 fragments
      "gGP@Djfj`NjFJ\\emKxsUvx}FVFC|ZFJ\\e@",
      "gGP@Djfj`NfFJ\\emxsUvx}~MCENR`",
      "gGP@Djfj`NfFJ\\ekxsUvx}nV_cPqSdh",
      "gGP@Djfj`LiXtpqSdm_FZnwGoqhXirT",
      "gGP@Djfj`NfFJ\\ekzsUvx}WwJ\u007FqhXirT",
    },
    { // 209 propargyl, 3 fragments
      "gC`@Dkz@zpXimMyRulYhXOqpXi@",
      "gC`@Dkz@zHXiuyRuoxxLT`",
      "gC`@Dkz@rfcQCEN_JVm\u007FGAbd",
    },
    { // 210 dimethylamino, 2 fragments
      "eM`BN`zqe_Msvx_~QXhr",
      "eM``fN`zqe_Msvxoxhr",
    },
    { // 211 diethylamino, 2 fragments
      "gJX@@eKU@]TLTyKxsUnx}nA\u007FyAXdLTy@",
      "gJXA@IRej`NjFJ\\e|Yjw\\^wA_qHXir",
    },
    {"daD@@DjUZzjj`Ck`hdlRjnkPwhsZlFhufbtvnu~JHt`"}, // 212 benzyl group
    {"gOp@DjWkjj`NfJRcV]Z[uejs]mwUcTumGUt}_cD`"}, // 213 phenyl group
    {"did@@DjU^njjj@Ldqv_PaQIXeUL}V`_IfmmVCTZsQZ[Pz\u007FGDZ^P"}, // 214 phenethyl
    {"didH@@Rge^Fjjh@zDFGHjikhZtI{hwGJzmkzqnkYhmUim]h]_cHLJNQUSWPp"}, // 215 benzyloxy
    {"gOx@@eJqmUTAtqRUhukQ~lmWgMvzlZfekZNgk|^JRmFjx"}, // 216 3-pyridyl
    {"gOx@@eLm]UTAtqRUjskP~l]WkmnzlZfehzngk|^JRlflx"}, // 217 2-pyridyl
    {"gOx@@eJymUTAtqRUhukQ~lmWkMuzlZfekZNgk|^JRmFjx"}, // 218 4-pyridyl
    {"daDH@@Rfu[jjj@NnAbrJjZzmB^ZGrrnkZ~nkIkMEjmMkm_bHLJVQUSWP"}, // 219 phenoxy
    {"gFq@@eLzuU@_P{VcTtmGUu~KEIVSV@"}, // 220 furfuryl
    {"deT@@DjY{[jjjh@zdJIKDikhVVtUzP^GR|xgY~l^gjlFhufjtviu~JaQHyDuM\\bs@"}, // 221 mesityl
    { // 222 sulfonyl halide, 2 fragments
      "gC`dH`DZPck@]DLTy}A\\YbdHcDkKp]\u007FGAbd",
      "gC`dH`DZPck@]DLTy}@|YbdHcDkKp^\u007FGAbd",
    },
    {"eMJAdDe`zqeXrTaDXeYnk~JL`"}, // 223 acyl halide
    {"eFBJPcAtcLZJPbLRlwC\u007FFD"}, // 224 alkyl halide
    {"eFBBPcAtcNt\\\u007F|bqa@"}, // 225 alkyl fluoride
    { // 226 alkyl chloride, 2 fragments
      "eFBBHcAtcOho]N|O\u007FFD",
      "eFBBHcAtcOh_]N|W\u007FFD",
    },
    { // 227 alkyl bromide, 2 fragments
      "eFBCDcAtcOho]N|O\u007FFD",
      "eFBCDcAtcOh_]N|W\u007FFD",
    },
    { // 228 benzyl halide, 2 fragments
      "eMBJHchNlYZt~bxudQbUfx_xhr",
      "eMBJHchNlYZt~cXudQbUfx_xhr",
    },
    { // 229 alkyl iodide, 2 fragments
      "eFBBlcAtcOho]N|O\u007FFD",
      "eFBBlcAtcOh_]N|W\u007FFD",
    },
    { // 230 allyl halide, 2 fragments
      "gC`HMDIVtAtPqSgtUqfrHqJs^EeS\u007FGAbd",
      "gC`HMDIVtAtPqSgtVqfrHqJs^EeS\u007FGAbd",
    },
    {"eFBBPcAtcTXJPbLRl\u007FFD"}, // 231 aryl halide
    {"eFBBHcAtcWxp`"}, // 232 aryl chloride
    {"eFBBPcAtcWxp`"}, // 233 aryl fluoride
    {"eFBCDcAtcUj\u007FFD"}, // 234 aryl bromide
    {"eFBBlcAtcWxp`"}, // 235 aryl iodide
    {"gC`LAHJPt`duPGQCEN]rO|\\FJP"}, // 236 trifluoromethyl
    {"dmtHpBBPRPrPrJPjIJUjjjh@uZmMkmCj]Kk|]AaQqIjZzFfV@"}, // 237 trifluoromethoxy
    {"gC`DAHJPRZhCkAbftwiK\u007FGAbd"}, // 238 difluoromethyl
    {"eFBBPcAuCFBdHcDkOqa@"}, // 239 organohalogen
    {"eFBBHcAuC~LH"}, // 240 chloro
    {"eFBBPcAuC~LH"}, // 241 fluoro
    {"eFBCDcAuC~LH"}, // 242 bromo
    {"eFBBlcAuC~LH"}, // 243 iodo
    {"eMBFPcXNlYVLeHQFIV_bcH"}, // 244 vinyl halide
    { // 245 heteroatom-bound halogen, 2 fragments
      "eFBBPcAuCZhuCAnG\u007FdVLH",
      "eFBBHcAuCZoP|TrHqJra`oE\u007Fqa@",
    },
    {"gGQ`AbeMuTAtPqrW\\cnao[\u007FFabgI^p`"}, // 246 acetal
    {"gC``Adij@zpXy}M^uGg^C_~SVNCEH"}, // 247 hemiacetal
    {"gNq`AbeMmUPGQCGI]rN~F}l{\u007FEabgIZ`"}, // 248 orthoester
    {"eMDARYCiE_Q\\Ys`D@c\\O\u007FHlTY{H"}, // 249 hydroxy group
    {"eFHBLGRL~b}hy\u007FyEcB"}, // 250 alcohol
    {"eFHBLGRL~Rz}hy\u007FyEcB"}, // 251 secondary alcohol
    { // 252 primary alcohol, 2 fragments
      "eFHBLGRL~R{]hy\u007FyEcB",
      "eFHBLGRL~R{mhy\u007FyEcB",
    },
    {"gC``Adej@zHXisyB}^rGFgg\u007FbEuc`qR"}, // 253 1,2-diol
    {"eFHBLGRL~Ry}hy\u007FyEcB"}, // 254 tertiary alcohol
    { // 255 benzylic alcohol, 3 fragments
      "deTLB@SL{HiCDdLuUUPAthLJNIUSWPtufJfxYjqZkSZ{PzgVxa\u007FbPLJNOTA@",
      "deTL@@SLbdLRPsUUU@GR`phxeUM]CSVXj[agtY]VKUZ[WZGTzwDO|RAaQqz`H",
      "deTLB@S@gHiCDdLuUUPAthLJNIUSWPtufJfxY}@[UbuVfuvauNmqC\u007FD`XT\\^hf@",
    },
    { // 256 allylic alcohol, 3 fragments
      "gGQa@mnrJPuRAtpqSdm]rO|ZFJ\\ez``",
      "gGQ`@mdTajdCiabgIZ~fo\\c\u007FFabgI^hH",
      "gGQa@lIrJPuRAtpqSdm_P[nQ\u007FcPqSdoTl",
    },
    {"gCa@@eMHGVCGMxM\u007Fc`qR"}, // 257 enol ether
    {"eMHAIdNlYWtWnG\u007FdVJL`"}, // 258 enol
    {"gJQ`AbeKR`]XNRqVs`D@`ypB@Q^C_xdLTyzlP"}, // 259 ether
    {"eMHBN`zqemt{qo|TY@"}, // 260 aryl alkyl ether
    {"gJQ`AbeKR`YXQHTZp\\ebmg@HAAs`D@b|F\u007FqHXisuX`"}, // 261 cyclic ether
    {"eMHBN`zqe]luwc_xhr"}, // 262 dialkyl ether
    {"gC``Adii@zpTy}EtYlxA@HoAo|\\FJ^s@"}, // 263 methoxy
    {"gCa@@eMPGVCGMhoS]_C\\wk\u007Fc`qR"}, // 264 ethoxy
    {"eMHBN`zqikqo|TY@"}, // 265 diaryl ether
    {"eFDBcAtcOhoZN_~IZqa@"}, // 266 hydroperoxide
    { // 267 p-methoxyphenyl, 2 fragments
      "didH@@Rfuvzjjh@zDFIGHjikjtC{h]NrrnkZ~^LC@aUdufbuVftNoqdFEKHjikdX",
      "didD@@EJ[W[jjj`CjPXd\\bjfnao]CivVUu[WsuYMYhmUimCk|YAaRrJjZyF@",
    },
    { // 268 3,4-dimethoxyphenyl, 7 fragments
      "dmtD@@iJ[eWijjjh@zTFIGHjekhVZtKxX]Nqrmkyqz[cBhpBEVSVZkSZGRz\u007FGPXTlbZfnQiU`",
      "dmtD@@iJ[eWijjjh@ztFIGHjekhVY[ppz]ce[WsctwUdufjtvatnoqtFEKHfikdZUX",
      "dmtD@@iJ[eWijjjh@zTFIGHjekhVZtKzX]Nqrmkyqz[ThpjL@aUdufjtvatnoqtFEKHfikdZUX",
      "dmtD@@iJ[eWijjjh@ztFIGHjekhVY[tpz]ce[WsctviUYMYjmMh]Kk|]AaRrIjZyFeV@",
      "dcLL@@yTee[]aZjjj@NcAaRrJjZyFeUu}LDcyYWSmXoO[uVSVZKUZ{Vz\u007FDpXTlbjf^aYU]np@",
      "dmtL@@iTinU^fjjj`CkPXd\\bjVnaYeoCCivNUm_NOS]VSVZkSZGRz\u007FGPXTlbZfnQiU`",
      "dmtL@@iTinU^fjjj`CkPXd\\bjVnaYeoSCivNUm_NOSZeUdufjtvatnoqtFEKHfikdZUX",
    },
    {"eFHBLGRM^b}p\u007F|bqa@"}, // 269 phenol
    { // 270 p-hydroxyphenyl, 6 fragments
      "daDH@@RYWijjj@NnAbRrJjZmG^xKatoKJzmgcGHpBEVcRZsQZkWZ\u007FDPXdlbjf^`",
      "daDH@@RYWijjj@NaAbRrJjZz}pWCi^VUu[OUhtfltVjuvoqDFIKHjigh",
      "daDH@@RYWijjj@NnAbRrJjZmG^DKatoKJzmgyHqtBEVcRZsQZkWZ\u007FDPXdlbjf^`",
      "dk\\D@@OIDhdeCnTUZiiih@zlFEKDjighZU[TwraZOee]Vu}XwMj}VsQZ[WZOUz\u007FEpXT\\bjVnaYU]SknuFSi`",
      "daDD@@yIe^fjjh@zDFIKHjikkwA\\NeyYWUl}VcRZsQZkWZ\u007FDPXdlbjf^`",
      "daDD@@yIe^fjjh@zDFIKHjikkpa\\NeyYWUl\u007FIUhtfltVjuvoqDFIKHjigh",
    },
    {"gJP`@TeZhCJJ}TLeZKZKrEfzjZVoqP\\`"}, // 271 resorcinol
    {"gC``Adej@zHYJsyB}]YM[P^_~HWVNCIH"}, // 272 catechol
    {"daDD@@yIe^fjjh@zDFIKHjikfqIaUy@okjtZSVZKUZ{WxhBr"}, // 273 hydroquinone
    {"dcLB@@E]RYmY~ejjjh@ztFEHjikhVYWVtYyd\\kjv_gezmfbuVftNmu~I`phyEUM\\cRj{@"}, // 274 galloyl
    { // 275 guaiacyl, 14 fragments
      "deTD@@iJ[g^Fjjj@NiAbQrJiZzFmD~FGSl\\kjvogFxqJL@aUdufjtvnuNoqTFEKHfikhVX",
      "deTD@@iJ[g^Fjjj@NiAbQrJiZzFmD~fGSl\\kjvogFyRLRc@HUYMYjmMkmSk|UAaRrIjZzEf@",
      "deTD@@iJ[g^Fjjj@NeAbQrJiZzFf|LNgXyWUm_NMuYMYjmMkmSk|UAaRrIjZzEf@",
      "deTD@@iJ[g^Fjjj@NeAbQrJiZzFf}LNgXyWUm_NMreVSVZkSZ{Tz\u007FEPXTlbZfnaY`",
      "deTD@@iJ[g^Fjjj@NiAbQrJiZzFmD~fGSl\\kjvogFyJLRc@HUYMYjmMkmSk|UAaRrIjZzEf@",
      "deTD@@iJ[g^Fjjj@NiAbQrJiZzFmD~fGSl\\kjvogFyZLRc@HUYMYjmMkmSk|UAaRrIjZzEf@",
      "deTD@@iJ[g^Fjjj@NeAbQrJiZzFf}LNgXyWUm_NMrUVSVZkSZ{Tz\u007FEPXTlbZfnaY`",
      "deTD@@iJ[g^Fjjj@NeAbQrJiZzFf}LNgXyWUm_NMruVSVZkSZ{Tz\u007FEPXTlbZfnaY`",
      "dmtL@@yTee[VEjjj`CkPXTlbjfnQiU_SCH~VUt{VKsrwUdufbuVntnoqtFEKHjighVU[l@",
      "fb}AP@@DU[NRQQJ[QJQJediFMEpYfjZeVej@ChhFBaqDZKGdJdj]Qjry|aXrWKztNp}KY_GE\\kU^kL{k}\\[jqfnZUkV`zkk|^`XJGBQhlnPfRjuF[KgrFbi\\iVluziAJLl{pTy@",
      "deTL@@jTin]xZjjh@zTFIGHjekhZ[ppz]ce]Vu|xwUdufjtvnuNoqTFEKHfikhVX",
      "deTL@@jTin]xZjjh@zTFIGHjekhZ[tpz]ce]Vu|xwJUYMYjmMkmSk|UAaRrIjZzEf@",
      "deTL@@jTin]xZjjh@zTFIGHjekhZ[tpz]ce]Vu|xwIUYMYjmMkmSk|UAaRrIjZzEf@",
      "deTL@@jTin]xZjjh@zTFIGHjekhZ[tpz]ce]Vu|xwKUYMYjmMkmSk|UAaRrIjZzEf@",
    },
    { // 276 ester, 2 fragments
      "gGQ`@jdsmRAtPqSVLn\\@`D[dmxm\u007FcPqSdoYP",
      "gJQ`@bdjt`]DLTe}IDX\\xA@HwI[q[\u007FDabgOXP",
    },
    { // 277 carboxylic acid or carboxylate, 2 fragments
      "eMDARVCkFU}M{Zk\u007Fr[EFP",
      "eMDa^RVCkFUvuW~JL`",
    },
    {"eMDARVCkFU}M{Zk\u007Fr[EFP"}, // 278 carboxylic acid
    { // 279 aliphatic carboxylic acid, 3 fragments
      "gC``@dfZ@zHXiszJ\u007FqpXi@",
      "gC`a@erSM@]DLTy\u007FGAbd",
      "gC`a@eJSM@]DLTy}EoxxLT`",
    },
    {"gJP`@dfVhCHrEF`qkAbg\\eoEo|RFJ\\`"}, // 280 lactone
    { // 281 methyl ester, 2 fragments
      "gJP`@dfVhChabdoh^wI[q[\u007FDabgH",
      "gC``@deZ@zHXisyRMvyK^K_xxLT`",
    },
    { // 282 aromatic carboxylic acid, 3 fragments
      "gC``@dfZ@zHXiuzJ\u007FqpXi@",
      "gC`a@erSM@]DLTz\u007FGAbd",
      "gC`a@eJSM@]DLTz}EoxxLT`",
    },
    {"gJP`@dfVhChabgOinwI[q[\u007FDabgH"}, // 283 acetate ester
    { // 284 ethyl ester, 2 fragments
      "gGP`@df]j`NjFJRu|cm{\\eoEo|ZFJ\\e@",
      "gJP`@deVhCjabgI_ZQmO[dmxm\u007FbPqSd",
    },
    {"gJP`@dfvdCjabgI_QWlbrzf\u007FyAXdLTy@"}, // 285 alpha,beta-unsaturated carboxylic acid
    {"eMDa^RVCkFUvuW~JL`"}, // 286 carboxylate
    {"gJP`@deVdCjabgI]sW|RFJ\\`"}, // 287 enol ester
    { // 288 alpha-hydroxy acid, 2 fragments
      "gJQ`@bdvu@]TLTyK{J}Ao^Ees\u007FrBqHXir",
      "gGQ`@bdwMTAuPqSdodkM{pln_~PVMCENR`",
    },
    {"gCa`@ldsPGQCEN]rVzV}o|\\FJP"}, // 289 carbonate ester
    {"gJQ`@bdjt`]TLTyKmRzwbw~ICENP"}, // 290 anhydride
    { // 291 alpha-keto acid, 6 fragments
      "gGQ`@bdwMLAuPqSdohk\u007FFabgIP",
      "gGQa@bnR[ff@zhXirW|ZFJ\\e@",
      "gGQa@biR[ff@zhXirWtV\u007FcPqSdh",
      "gJQ`@bdvt`]TLTyKyJ}GxdLTy@",
      "gJQa@bnR[ZPNjFJ\\e}MGxdLTy@",
      "gJQa@biR[ZPNjFJ\\e|enc|RFJ\\`",
    },
    { // 292 oxime ester, 4 fragments
      "gNx`LDdjsSPfnjFJ\\emKFUN@PwM_|flVFJ\\ej",
      "gNxaLEiRUYihSWUCENRve}M\\YTxAC\\u\u007FEabgIZ`",
      "gGX`LDdjmLIkjabgI[R~abLj\\@anZ\u007FyMXtLTyJ",
      "gGXaLEiRUVfDuuPqSdmi_KVXcJg@H[foxtLTyJ",
    },
    {"gCa@@dkHGQCEN]rW|\\FJP"}, // 293 alpha,beta-unsaturated carbonyl
    {"gCa@@dsPGRCG\\e\u007FGAbd"}, // 294 ketone
    {"gCa@@dsPGVCEVyK~NCEH"}, // 295 aryl ketone
    {"eMHAIXNlYWt}nk~JL`"}, // 296 acetyl group
    { // 297 aldehyde, 2 fragments
      "eMHAIXNdY}U{j\u007FbcH",
      "eFHBJGRL~k]u_qa@",
    },
    {"eMHAIXNlYWuWfj}[\u007FEFP"}, // 298 aliphatic aldehyde
    {"eMHAIXNlYZt~j|uWk_xhr"}, // 299 aromatic aldehyde
    { // 300 amide, 4 fragments
      "gCi@DDfZ@zpXiwaYT\u007F|Pjl\\FJP",
      "eMhDRVCkFU}T[ruW\u007FbUlTY@",
      "gCiADEJSM@]XLT{pljo~PVNCEH",
      "eMhdYRVCkFU}T[ru[\u007FdVJL`",
    },
    { // 301 secondary amide, 4 fragments
      "gCi@DDfZ@zpXi}E^|KJg\u007FbEUc`qR",
      "eMhDRVCkFU|tM{ruW\u007FbUlTY@",
      "gCiADEJSM@]XLT~bo^EeU\u007FrBqpXi@",
      "eMhdYRVCkFU|tM{ru[\u007FdVJL`",
    },
    { // 302 lactam, 2 fragments
      "eMhDRVCIhXucJ{Zk\u007Fr[EFP",
      "eMhdYRVCIhXucJ{Zm\u007FEFP",
    },
    { // 303 tertiary amide, 4 fragments
      "gCi@DDfZ@zpXi}D~|KJg\u007FbEUc`qR",
      "eMhDRVCkFU|tK{ruW\u007FbUlTY@",
      "gCiADEJSM@]XLT~b_^EeU\u007FrBqpXi@",
      "eMhdYRVCkFU|tK{ru[\u007FdVJL`",
    },
    { // 304 urea, 3 fragments
      "gCe@E`dsPGQCEN]dVUOO\u007FLJkkGAbd",
      "gCeAE`iRYhChabgNrKJkg\u007FbEuc`qR",
      "gCe@e`itiLtAtPqSgYEeUu\u007FrBqpXi@",
    },
    { // 305 peptide bond, 4 fragments
      "dayD@DhNRYWZjPChPXT\\RZV^]mEQxr]Mk\u007FbIZl^AaQqIiY@",
      "dayDBDhNRTfUvjd@zDFEGDfegg[QTnLgSZ\u007FyEVO@phxdtl`",
      "dayDBDhNjTfUvjd@zDFEGDfegg[QT^LgUZ\u007FyBVO@phxdtl`",
      "dayDADhNRZeIe]ji@NaAaQqIiYyvtUKcIuVox|CBcbSRr",
    },
    { // 306 imide, 2 fragments
      "gJX`DBdjt`]TLTyKoRiz\u007FyEXdLTy@",
      "gJXaDBiRUZPNjFJ\\ewiU]_qHXir",
    },
    { // 307 carbamate, 2 fragments
      "gJX`LDdru@]DLTyvQYT|\u007F|pjnlRFJ\\`",
      "gJXaLEiRYZ`NbFJ\\{Hlj^o~HUVICENP",
    },
    {"gJY@DDfVhChabgMh_S]_Sjwk\u007FbPqSd"}, // 308 acetamide
    { // 309 primary amide, 4 fragments
      "gCi@DDfZ@zpXi}En|KJg\u007FbEUc`qR",
      "eMhDRVCkFU|tN{ruW\u007FbUlTY@",
      "gCiADEJSM@]XLT~bw^EeU\u007FrBqpXi@",
      "eMhdYRVCkFU|tN{ru[\u007FdVJL`",
    },
    { // 310 acylhydrazone, 20 fragments
      "gJU@E`djt`]DLTy}EnrKJgk\u007FfEUubPqSd",
      "gJUAEaiRUZPNbFJ\\~bwYEeSv\u007FqBjqHXir",
      "gJUAE`iRUZPNbFJ\\~bwYEeUu\u007FqBzqHXir",
      "gJU@e`itiJmHGQCEN_Q[lbrj{_yAXdLTy@",
      "gGU@E`dlmRAtPqSgtU{Hlj^o~XUWVMCENR`",
      "gJU@E`djt`]DLTy}E^rKJgk\u007FfEUubPqSd",
      "gGUAEaiRVVi@zHXiszJ}dVUO[\u007FDJkFabgIP",
      "gJUAEaiRUZPNbFJ\\~boYEeSv\u007FqBjqHXir",
      "gGUAE`iRVVi@zHXiszJ}dVUWW\u007FDKkFabgIP",
      "gJUAE`iRUZPNbFJ\\~boYEeUu\u007FqBzqHXir",
      "gGU@e`itiKKT`]DLTy}E^rKJkm\u007FdEcPqSdh",
      "gJU@e`itiJmHGQCEN_QWlbrj{_yAXdLTy@",
      "gNu@E`dmKUHGQCEN_QOlbriz\u007FyaU]XlLTyKT",
      "gGU@E`dlmRAtPqSgtS{Hlj^o~XUWVMCENR`",
      "gNuAEaiRVejdChabgOhgvQYT}o|PjlVFJ\\ej",
      "gGUAEaiRVVi@zHXiszI}dVUO[\u007FDJkFabgIP",
      "gNuAE`iRVejdChabgOhgvQYU]_|PnlVFJ\\ej",
      "gGUAE`iRVVi@zHXiszI}dVUWW\u007FDKkFabgIP",
      "gNu@e`itiKRuRAtPqSgtS{Hljnw~PVKCENRu@",
      "gGU@e`itiKKT`]DLTy}D~rKJkm\u007FdEcPqSdh",
    },
    { // 311 hydrazide, 4 fragments
      "gCe@E`dkPGQCEN]zUOO\u007FDkkGAbd",
      "gCeAEaiRUhChabgN}Jgk\u007FdUc`qR",
      "gCeAE`iRUhChabgN}Jkg\u007Fduc`qR",
      "gCe@e`itiJtAtPqSg^eUu\u007FGAbd",
    },
    { // 312 hydroxamic acid, 2 fragments
      "gCh`DLdkPGQCEN_SWoRiy\u007Fxe]XxLT`",
      "gChaDLiRUhChabgOikwiU\\\u007F|fl\\FJP",
    },
    { // 313 thiourea, 3 fragments
      "gCdHE`DILtAtPqSgtC{tj^]xK\u007Fxe]XxLT`",
      "gCdIE`DJTfZ@zHXiszA}zUWN|E\u007F|fl\\FJP",
      "gCdHe`DJ]JSM@]DLTy}@~}Jkk^B\u007FxxLT`",
    },
    { // 314 semicarbazone, 8 fragments
      "gNs@EcPdrkUHGTCTsRumGVzKJgf[\u007FaEUuMb`u{J",
      "gNsAEcPiRY]jdCjAjYiZvck]EeUsm\u007FsBzvqPZ}a@",
      "gNsAEcPiRYUjdCjAjYiZvck]EeUsM\u007FsBzfqPZ}e@",
      "gNs@ecPitiLjuRAu@uLtm[Qunbrjzf\u007FxaSXhM^r`",
      "gNsAEcPYRYUjdCjAjYiZvck]EeSsN\u007FsBjzqPZ}e@",
      "gNs@ecPiliLnuRAu@uLtm[Qunbrjyw_xa]XhM^p`",
      "gNs@ecPiLiLjuRAu@uLtm[Qunbrjyg_xa]XhM^r`",
      "gNsAecPitfTfUZi@z`ZfZVmhzwQYU]So|`lTFoYP",
    },
    { // 315 semicarbazide, 8 fragments
      "gGS@EcPdrmTAu@uLtm[Qunbriyu\u007FxQU][XpOXP",
      "gGSAEcPiRYVj@z`ZfZVmhzwQYU\\z\u007F|pnmlXGlH",
      "gGSAEcPiRYVj@z`ZfZVmhzwQYU\\r\u007F|pnilXGlh",
      "gGS@ecPitiLkU@]PMSMKVt][hljnm_~HVvLCvD",
      "gGSAEcPYRYVj@z`ZfZVmhzwQYT|s_|pjnlXGlh",
      "gGS@ecPiliLkU@]PMSMKVt][hljn]o~HWVLCvD",
      "gGS@ecPiLiLkU@]PMSMKVt][hljnYo~HWVLCvT",
      "gGSAecPitfTfUj`NhFifekZNmtVUWTw\u007FHKFA{J",
    },
    { // 316 biuret, 6 fragments
      "gN|`EfJdssTpGRCVifekZnmtUONuo\u007FJJkkZ{EAJ",
      "gN|aEfKiRYyjXCiAkTsRumWVzJgkZw\u007FaEUm]b`e@",
      "gN|aEfJiRYyjXCiAkTsRumWVzJkgZw\u007FaEum]b`e@",
      "gN|`efJitiL|uLAt`ujYiZvkk]EUum[\u007FsBvnqPR`",
      "gN|`efKi\\iL|uLAt`ujYiZvkk]ESum]\u007FsBjvqPR`",
      "gN|aefJitnTf^Zf@zPZuLtm[Uunbjzvn\u007Fxa[XhIP",
    },
    { // 317 carbazate, 60 fragments
      "gJT`LPdfvhCjabgI_KZ]wQYT|r\u007F|HjnilRFJ\\`",
      "gJTaLPcJS[TAuPqSdoemN{hlj^Yo~XUWVICENP",
      "gGT`LPdfuj`NjFJ\\e|mio]EeSsK\u007FpbjzfqhXirT",
      "gGTaLPcJSZuPGUCENR~Vtwnbriyf\u007FyaU]XtLTyJ",
      "gNt`LPdfvZj@zhXirWrve}tVUOLo\u007FBJkj[EabgIZ`",
      "gNtaLPcJS[MU@]TLTyKy[R~zKJgf[\u007FfEUubpqSdmP",
      "gJTaLPmJS[TAuPqSdoemN{hlj^i_~XUTvICENP",
      "gJT`lPmIeImj@zhXirWrvg]tVUOTw\u007FDJkDabgH",
      "gGTaLPmJSZuPGUCENR~Vtwnbrize\u007FyaUSXtLTyJ",
      "gGT`lPmIeImZhCjabgI_KZ[wQYT}S_|PjlZFJ\\e@",
      "gNtaLPmJS[MU@]TLTyKy[R~zKJgjW\u007FfEUMbpqSdmP",
      "gNt`lPmIeImfj`NjFJ\\e|mi_]EeSuM\u007FqBjqXXirVh",
      "gGT`LPdfyj`NjFJ\\e|mYw]EeSsK\u007FpbjzfqhXirT",
      "gJT`LPdfvhCjabgI_KV]wQYT|r\u007F|HjnilRFJ\\`",
      "gGTaLPcJS\\uPGUCENR~Vl{nbriyf\u007FyaU]XtLTyJ",
      "gJTaLPcJS[TAuPqSdoekN{hlj^Yo~XUWVICENP",
      "gNt`LPdfyZj@zhXirWruf}tVUOLo\u007FBJkj[EabgIZ`",
      "gGT`LPdfuj`NjFJ\\e|mYo]EeSsK\u007FpbjzfqhXirT",
      "gNtaLPcJS\\mU@]TLTyKyZs^zKJgf[\u007FfEUubpqSdmP",
      "gGTaLPcJSZuPGUCENR~Vlwnbriyf\u007FyaU]XtLTyJ",
      "dayD@LHDR[fZj`Cj`XT\\R_Ied~zBqT^Lg\u007FaATnTkG`XT\\RZVP",
      "gNt`LPdfvZj@zhXirWrue}tVUOLo\u007FBJkj[EabgIZ`",
      "dayDBLHDJTfyfjh@zhFEGDgrYYOn`lUGcJ\u007Fy`UKecpLJNIMKH",
      "gNtaLPcJS[MU@]TLTyKyZr~zKJgf[\u007FfEUubpqSdmP",
      "gGTaLPmJS\\uPGUCENR~Vl{nbrize\u007FyaUSXtLTyJ",
      "gJTaLPmJS[TAuPqSdoekN{hlj^i_~XUTvICENP",
      "gGT`lPmIeInZhCjabgI_KV]wQYT}S_|PjlZFJ\\e@",
      "gJT`lPmIeImj@zhXirWrug]tVUOTw\u007FDJkDabgH",
      "gNtaLPmJS\\mU@]TLTyKyZs^zKJgjW\u007FfEUMbpqSdmP",
      "gGTaLPmJSZuPGUCENR~Vlwnbrize\u007FyaUSXtLTyJ",
      "gNt`lPmIeInVj`NjFJ\\e|mYo]EeSuM\u007FqBjqXXirVh",
      "gGT`lPmIeImZhCjabgI_KV[wQYT}S_|PjlZFJ\\e@",
      "dayDBLHDrTfyfjh@zhFEGDgrYYOn`lUGeI\u007Fy`UJUcpLJNIMKH",
      "gNtaLPmJS[MU@]TLTyKyZr~zKJgjW\u007FfEUMbpqSdmP",
      "dayDALHDrReInYjj@NjAaQqI|fVS{hKEQyRo~HERqxFEGDfed",
      "gNt`lPmIeImfj`NjFJ\\e|mY_]EeSuM\u007FqBjqXXirVh",
      "gNt`LPdfzZj@zhXirWrsg]tVUOLo\u007FBJkj[EabgIZ`",
      "gGT`LPdfyj`NjFJ\\e|lyw]EeSsK\u007FpbjzfqhXirT",
      "gNtaLPcJS]MU@]TLTyKyYsnzKJgf[\u007FfEUubpqSdmP",
      "gGTaLPcJS\\uPGUCENR~V\\{nbriyf\u007FyaU]XtLTyJ",
      "dayD@LHDR[iZj`Cj`XT\\R_Ice^zBqT^Lg\u007FaATnTkG`XT\\RZVP",
      "gNt`LPdfyZj@zhXirWrsf}tVUOLo\u007FBJkj[EabgIZ`",
      "dayDBLHDJTfzVjh@zhFEGDgrXyWn`lUGcJ\u007Fy`UKecpLJNIMKH",
      "gNtaLPcJS\\mU@]TLTyKyYs^zKJgf[\u007FfEUubpqSdmP",
      "diED@LHDR[ifjj@NjAaQqI|fNS{hKEQxr_~DERyRlQAaQqIiYy@",
      "dayD@LHDR[fZj`Cj`XT\\R_Icd~zBqT^Lg\u007FaATnTkG`XT\\RZVP",
      "diEDBLHDJTfzYjj`Cj`XT\\R_Icd~zBqT^Lk\u007FfATnVH`phxdtl|`",
      "dayDBLHDJTfyfjh@zhFEGDgrXyOn`lUGcJ\u007Fy`UKecpLJNIMKH",
      "gNtaLPmJS]MU@]TLTyKyYsnzKJgjW\u007FfEUMbpqSdmP",
      "gGTaLPmJS\\uPGUCENR~V\\{nbrize\u007FyaUSXtLTyJ",
      "gNt`lPmIeInfj`NjFJ\\e|lyw]EeSuM\u007FqBjqXXirVh",
      "gGT`lPmIeInZhCjabgI_KN]wQYT}S_|PjlZFJ\\e@",
      "dayDBLHDrTfzVjh@zhFEGDgrXyWn`lUGeI\u007Fy`UJUcpLJNIMKH",
      "gNtaLPmJS\\mU@]TLTyKyYs^zKJgjW\u007FfEUMbpqSdmP",
      "dayDALHDrReInejj@NjAaQqI|fNU{hKEQyRo~HERqxFEGDfed",
      "gNt`lPmIeInVj`NjFJ\\e|lyo]EeSuM\u007FqBjqXXirVh",
      "diEDBLHDrTfzYjj`Cj`XT\\R_Icd~zBqT^Tg\u007FfATiVH`phxdtl|`",
      "dayDBLHDrTfyfjh@zhFEGDgrXyOn`lUGeI\u007Fy`UJUcpLJNIMKH",
      "diEDALHDrReInfZjh@zhFEGDgrXyOn`lUGeJ\u007Fx`UKDPXT\\RZV^P",
      "dayDALHDrReInYjj@NjAaQqI|fNS{hKEQyRo~HERqxFEGDfed",
    },
    { // 318 Weinreb amide, 8 fragments
      "gNx`DBds[UPGSCEI[NwD\u007F|blVFJ\\ej",
      "dazD`D@nBDf[vjd@zxFEDfigfL]g@HAFxQ\u007FyBVO@phxdtl}c`",
      "dazD`D@nBDf[Vjd@zxFEDfekfL]g@HAFxQ\u007FyBVO@phxdtl}c`",
      "diFDPD@nBABDf[UjiPChPXTRZV^QXiv\\@`DCg@HAFxQ\u007FyBVH`phxdtl|}Sa@",
      "gGX`DLdlmTAtpqSduoRQnI\u007FyEXtLTyJ",
      "gNxhDLpaIYvjPNnFJ\\fjwtdQcs`D@c\\S\u007FrJqXXirVoXp",
      "gNxhDLpaIYVjPNnFJ\\elwtdQcs`D@c\\S\u007FrJqXXirVoXp",
      "dazDPDCFBNBDeeVjT@zDFEGDfeggtQDT[N@PBNs`D@c\\H\u007F|aKG`XT\\RZV^hw@",
    },
    {"eFHBJGRL{Ru\u007FrKFD"}, // 319 carbonyl
    {"gJP`@TeVdCjabgI]zUOW|RFJ\\`"}, // 320 1,3-dicarbonyl
    {"gC``AdeY@zHXismRj\u007Fc`qR"}, // 321 1,2-dicarbonyl
    { // 322 N-oxide, 2 fragments
      "eMdXZWde`zqe]r\u007FqQgl@",
      "eFhXNicAtcVx_xp`",
    },
    { // 323 nitrone, 3 fragments
      "gGY@hAteIffhCkAbfttYdxAC\\e\u007FFabgIP",
      "gJY@hAteIfZDeu`qSZ[tTQfS`DMrW|RFJ\\`",
      "gCi@hAteIi`NlFJ[S^brLr\\@anR\u007Fc`qR",
    },
    { // 324 amidine, 12 fragments
      "gCd@@dfZ@zpXiwaYT\u007F|Pjl\\FJP",
      "gCdA@eJSM@]XLT{pljo~PVNCEH",
      "gCdA@aJSM@]XLT{ptj_~QVNCEH",
      "gCd@`aJeIf`NlFJ]xZUW|\\FJP",
      "eMPARVCkFU}T[ruW\u007FbUlTY@",
      "eMPaYRVCkFU}T[ru[\u007FdVJL`",
      "eMPaIRVCkFU}T[sUW\u007FdvJL`",
      "eMPQIYRVCkFU}T[sU[~JL`",
      "gCdA@aJSM@]XLT{plj_~QVNCEH",
      "gCd@`aJeIf`NlFJ]xVUW|\\FJP",
      "eMPaIRVCkFU}T[ruW\u007FdvJL`",
      "eMPQIYRVCkFU}T[ru[~JL`",
    },
    { // 325 guanidine, 9 fragments
      "gCl@@ldsPGQCEN]dVUOO\u007FLJkkGAbd",
      "gClA@liRYhChabgNrKJkg\u007FbEuc`qR",
      "gClA@lIRYhChabgNrMJgg\u007FbUuc`qR",
      "gCl@`lITiLtAtPqSgYFeUs\u007FrZqpXi@",
      "gCl@`litiLtAtPqSgYEeUu\u007FrBqpXi@",
      "gClA`lITzTfZ@zHXislcRjz\u007Fc`qR",
      "gClA@lIRYhChabgNrKJgg\u007FbUuc`qR",
      "gCl@`lITiLtAtPqSgYEeUs\u007FrZqpXi@",
      "gClA`lITzTfZ@zHXislbrjz\u007Fc`qR",
    },
    { // 326 isourea, 20 fragments
      "gNu@LPeMmMPFvU\\\\hXKC@xXJtZfmhznmdNWTo\u007FLKj[FI{eV",
      "gNuALPYRfvfhC[JnNTLEa`\\LEZMSVt]WVrGKj[\u007FbEucD}rk@",
      "gGUAE`NRYYj@z`[HvJLLEa`kekZNmdNUWO\u007FDkkEAcuF`",
      "gGU@e`NtiLlu@]PMd[EFFBppUrumGVrGJkk\u007FdUb`qzcP",
      "gNuALQiRfvfhC[JnNTLEa`\\LEZMSVt]WVrGKlW\u007FbEMcD}rk@",
      "gNu@lQiLiS[STAmeWGJFBppNFBmFikZNkkYCevM\u007FrBqb^yU`",
      "gGU@e`NTiLlu@]PMd[EFFBppUrumGVrGJmg\u007Fdub`qzcP",
      "gGUAe`NTzTfVZ`NhFrMbcCAXXJyZvckYCeVu\u007FEAcuF`",
      "gNu@LPeMmUPFvU\\\\hXKC@xXJlZfekZNkkYCesM\u007FsBzfqfnyU`",
      "gNuALQiRfvjhC[JnNTLEa`\\LEVMSRumGUularzf\u007FxaSXsW\\jp",
      "gGUAE`NRYZj@z`[HvJLLEa`jYiZvckYCeSu\u007FqJzqPU]Qh",
      "gGU@e`NTiLmU@]PMd[EFFBppULtm[Qularjz\u007FyMXhJnht",
      "gNuALQiRfvjhC[JnNTLEa`\\LEVMSRumGUular{E\u007FxaSXqW\\jp",
      "gNu@lQiLiS[UTAmeWGJFBppNFBkFiiZvcjzvPy]So|`lYknUX",
      "gGU@e`NTiLmU@]PMd[EFFBppULtm[QularkY\u007FyMXhLnht",
      "gGUAe`NTzTfVj`NhFrMbcCAXXJfZVmhzvPyU]oqPU]Qh",
      "gNuALP^RfvjhC[JnNTLEa`\\LEVMSRumGUularye\u007Fxa]XsW\\jp",
      "gNu@lQiOIS[UTAmeWGJFBppNFBkFiiZvcjzvPy]R\u007F|`lYknUX",
      "gGU@e`NwILmU@]PMd[EFFBppULtm[Qulariy\u007FyEXhJnht",
      "gGUAe`NT{dfVj`NhFrMbcCAXXJfZVmhzvPyU\\\u007FqPU]Qh",
    },
    { // 327 N,O-acetal, 2 fragments
      "deed@BinFPqJZjjjj`CjPX\\RZV^QikPfxa\u007FcHLJNIMKOHoVpj[a@",
      "dcub@J[aePpmRfjjjjjj@NmAaqIiYyFfUumBQc\\xA@HwDO|]AaQqIiYyEeUzNES\\Lz",
    },
    { // 328 aminal, 3 fragments
      "eMPARZCkFUwcfo\u007FDkXhr",
      "eMPaIRZCkFUwefo\u007FIlTY@",
      "eMPQIYRZCkFUwefw|TY@",
    },
    { // 329 hemiaminal, 2 fragments
      "diEd@LJfxPQIjjjjh@zdFEGDfegh[tI^xa\u007FbHLJNIMKOOVCBin@",
      "dmUb@BinFPSERZjjjjj`CkPXT\\RZV^aiU_Qeqa\\xA@HwDO|UAaQqIiYyEezHHUMpj",
    },
    {"gCi@Adii@zP\\vbbeCAlxA@HkIs\\CoAC\u007FHKGAbgnbp"}, // 330 amine
    {"dmvD@@yTjj[XRjiUPCjPXT\\ZnQYU[ISQqhXNs`D@a\\xA@HkE\\v`NG\u007FdAXzCBcbSRsrKJkvTpj[aeP"}, // 331 aliphatic amine
    { // 332 cyclic amine, 2 fragments
      "gJY@@TjZdCJBMDL]EmEEJF@ypB@Q~ICEN^zH`",
      "gGX`@ZeRuJAeAFjFJRumMGZF@ypB@Q\\xA@H\u007FFabgI^fXt",
    },
    {"gCi@Adii@zP\\vb}@|ThXMg@HAEYN[`]xN\u007FyAXxLT}tV@"}, // 333 tertiary amine
    {"gGX`@ZeRuJAtPjKVtt]hXCg@HAEs`D@blWMpO\u007FHKFabgI^fXt"}, // 334 aromatic amine
    { // 335 tertiary aliphatic amine, 2 fragments
      "gJT@@TjZhCiAUYS^`^JtLAK`DO@HkM{\\C\u007FrBqpXizXlP",
      "gJTA@QJUMTAt`jlioPWEZF@epBG`DUf}nA\u007Fc`qStqX`",
    },
    {"gCi@Adii@zP\\vb}A\\ThXMg@HAEYN[`]xM\u007FyAXxLT}tV@"}, // 336 secondary amine
    {"gCi@Adii@zP\\vb}AlThXMg@HAEYN[`_~PVNCEO]E`"}, // 337 primary amine
    {"gCi@LDej@zHXiszB}jMO|\\FJP"}, // 338 1,2-amino alcohol
    { // 339 primary aliphatic amine, 2 fragments
      "gJT@@TjZhCiAUYS^`vJtLAK`DO@HkM{\\C\u007FrBqpXizXlP",
      "gJTA@QJUMTAt`jlioP]EZF@epBG`DUf}nA\u007Fc`qStqX`",
    },
    { // 340 secondary aliphatic amine, 2 fragments
      "gJT@@TjZhCiAUYS^`nJtLAK`DO@HkM{\\C\u007FrBqpXizXlP",
      "gJTA@QJUMTAt`jlioP[EZF@epBG`DUf}nA\u007Fc`qStqX`",
    },
    {"eF`BLGRM^c]p\u007F|bqa@"}, // 341 aniline
    { // 342 aminophenol, 18 fragments
      "gCi@LDej@zHYJsyB}eYM[f_~SVJBd",
      "gJY@LDeZhChadkOdKtUdunY\u007FyMXxJ\\`",
      "gGY@LDeZj`NbFRl~`nlfmsO\u007FIkDaSdh",
      "gCiALMJRu@]DLeY|a^rlfmsW|TEH",
      "gJYALMJRmTAtPrUgrEzJrZwM_qpTy@",
      "gGYALMJRmUPGQCIV_PWVSVyk~IBgIP",
      "gJY@BDeZhCJJ}TLeZKZKrEgJjZVmpo\u007FH[EAr",
      "gGY@BDeVj`LhkuPrUhmhoHVXjiiZwB\u007F|al\\GIP",
      "gNy@BDeVjj@rboUCIVbvb}A]UMKVxW\u007FdMbPyKT",
      "gJYABCJRmTAeE^jFRmEmEyBseUMKVx[~JCd",
      "gGYABCJRkUPFTUzhYJtVtWdKLUTtm[aoxxNR`",
      "gNyABCJRkUU@YQWjadkQ[Q^`njfek\\M\u007FDarVh",
      "daFH@NAIe^fjjh@zDFIKHjikfqIaUy@oljtZSVZKUZ{Vxy\u007FyGVJ@l`",
      "difH@NAIe]ijjj`ChPXdlbjfn[DfEWdB~bkQiMYhmUh][cg\u007Fd]XxBsr",
      "deVH@NAIe]jZjjj@NaAbRrJjZylRXU^`KjtZSVZKUZgVxy\u007FyGVI@l|b`",
      "daFHBNCiRYWijjj@NaAbRrJjZylRXU^PK{JmFdufbuVnunNoxhBr",
      "difHBNCiRYWZZjjh@zDFIKHjikfqIaUy@ohjtZSVZKUZGVxz\u007Fc`KOH",
      "deVHBNCiRYWZfjjj`ChPXdlbjfn[DfEWhBzmFdufbuViunNoxdBsrJ",
    },
    {"eF``fLGTMj}CqjFBl\\wC\u007FFGm@"}, // 343 quaternary ammonium
    {"fJRPNi}QnX"}, // 344 ammonium
    {"gCd@ADiZDEt`qvaY_|Pll\\FJP"}, // 345 azo
    { // 346 azide, 3 fragments
      "eMpRRWhuCkFUwfjw\u007FJlTY@",
      "eMprRZWhuCkFUwflw|TY@",
      "eMpRRWh~CkFUwflo\u007FJlTY@",
    },
    { // 347 triazene, 8 fragments
      "eMpBXvCkFUwejo\u007FLmVqQd",
      "eMpbZXvCkFUwelo\u007FDkXhr",
      "eMpbRXvCkFUwfjo\u007FFkXhr",
      "eMpRRZXvCkFUwflo\u007FIlTY@",
      "eMpbVXvCkFUwejw\u007FDmXhr",
      "eMpRZVXvCkFUwelw\u007FHlTY@",
      "eMpRRVXvCkFUwfjw\u007FJlTY@",
      "eMprRZVXvCkFUwflw|TY@",
    },
    {"eFPbIcatcNtuo|jqa@"}, // 348 diazonium
    { // 349 isothiocyanate, 2 fragments
      "eMbDBDePzqe_P~vs[q_\u007FIlTY@",
      "eMbdBFTePzqe_P~vskq_|TY@",
    },
    { // 350 thiocyanate, 2 fragments
      "eMbDBDfpzqe_Q^vskq_\u007FIlTY@",
      "eMbDBDfpzqe_P~vskqo\u007FIlTY@",
    },
    { // 351 hydrazine, 3 fragments
      "eFPBcAtcNt\\\u007F|RucB",
      "eFPbIcAtcNtl\u007F|jqa@",
      "eFPRIicAtcNtm_qa@",
    },
    {"eFhHcAtcOhoZN_~IZqa@"}, // 352 hydroxylamine
    { // 353 hydrazone, 2 fragments
      "eMPBcdNlYW^V[_|RubcH",
      "eMPbicdNlYW^Vk_|bqQd",
    },
    { // 354 imine, 2 fragments
      "gCd@AdiZ@zpXymEEJFCYpB@QmBr\u007FyAXxLT}Rp",
      "gCdAAaJTm@]XL\\vbbeCAlxA@Hvai_qpXize`",
    },
    {"gCi@HDii@zpXyw`y]_|Pll\\FJP"}, // 355 oxime ether
    {"eMhHRYCkFU}E{qu[\u007FbVlTY@"}, // 356 oxime
    {"gCdAAaJTt`]HL[QQRa`q\\@axAFtKK~NCEO]E`"}, // 357 iminium
    {"gCd@ADie@zHXis~NCEH"}, // 358 azine
    { // 359 imidate, 24 fragments
      "gCi@LDii@zHXjsyRMF|GKk\u007FbEuc`qR",
      "gCi@LDii@zpXy|iFcYCeRu\u007FqBzqpXi@",
      "dayDbLyB@Hr\\bdbkJr@]BCBcbSRss{@]hzHpR\\@amhjOLUZ}[pE\u007F|qJUzqxFEGDfegiAaT",
      "gJY@LDizXQWQCEV_RQoArz\u007Fxa]XdLTy@",
      "gJY@LDizXQWVCGOiHvPyTm_|PnlRFJ\\`",
      "diEDbLyB@Hr\\bdbjYVXHZzDFEGDfeggr@{QFBS`DMmEQybkWk^@o\u007FfIRoVH`phxdtl|}HLJ`",
      "gCiALMJTt`]DLUY|iFc^Cev\u007FrBqpXi@",
      "gCiALMJTt`]XL\\~TcQlari[_yAXxLT`",
      "dayDaLyB@Hr^gHiHjrl`GP`phxdtl|~pGZNbLDg@H[ZJcsEVoZ|A_\u007FDReX|CBcbSRst`pj@",
      "gJYALMJT}LHkhabkOiHw`y]o|`lRFJ\\`",
      "gJYALMJT}LHkkAcgtd[H\\jVw~PVICENP",
      "diEDaLyB@Hr^gHiHjfUfBFnaAaQqIiYy|`NtQ`dxAC[QT^Xju{W`K\u007FxbTkDPXT\\RZV^^dFEP",
      "gJY@LDijXChabkOihw`y]_|PnlRFJ\\`",
      "gJY@LDijXCkAcgtt[H\\jVo~HWVICENP",
      "diEDbLyB@Hr\\bdblYVX@zDFEGDfeggr@\u007FQFBS`DMmEQybkWk^@o\u007FfIRoVH`phxdtl|}HLJ`",
      "gGY@LDinfaE]DLUYw`y]_|PnlZFJ\\e@",
      "gGY@LDinfaE]XL\\{H\\jVo~HWVMCENR`",
      "deeDbLyB@Hr\\bdblSJsPPutHLJNIMKOOhAxpR\\@amhjOLUZ}[pE\u007F|qJUzqdFEGDfegdWiAaT",
      "gJYALMJTuLAtPqUgtt[p\\nw~PVICENP",
      "gJYALMJTuLAu`qszZMdNUK[\u007FHKDabgH",
      "diEDaLyB@Hr^gHiHkFUf@NaAaQqIiYy|`OtQ`dxAC[QT^Xju{W`K\u007FxbTkDPXT\\RZV^^dFEP",
      "gGYALMJTwSPbnbFJl{p\\nw~PVMCENR`",
      "gGYALMJTwSPbnlFN]dNUK[\u007FHKFabgIP",
      "deeDaLyB@Hr^gHiHkDrltDM]BCBcbSRssz@^LDg@H[ZJcsEVoZ|A_\u007FDReXrCBcbSRsrKt`pj@",
    },
    { // 360 amidoxime, 8 fragments
      "gJU@I`dmMBRzHXismRy\u007Fxi]XdLTy@",
      "gJUAIaiRVfaI]DLTyvi]_|dlRFJ\\`",
      "gJUAIaIRVfaI]DLTy}I^uKg\u007FdubPqSd",
      "gJU@iaItiKSPdnbFJ\\~doZeu\u007FDabgH",
      "gCe@I`dlpdnbFJ\\~bcZes\u007FqRzqpXi@",
      "gCeAIaiRVXRWQCEN_QQmRz\u007FyIXxLT`",
      "gCeAIaIRVXRWQCEN_JVhvi\\\u007F|fl\\FJP",
      "gCe@iaItiKLIKhabgOeKT[TnoxxLT`",
    },
    {"eF`BNGRL{SV\u007FrKFD"}, // 361 nitrile
    { // 362 cyanamide, 6 fragments
      "eMPAR^CiF_P~tuo|RmbcH",
      "eMPaIR^CiF_Q^tuo|fqQd",
      "eMPaYR^CiF_P~|uf_yEbcH",
      "eMPQIYR^CiF_Q^|uf_bcH",
      "eMPa^R^CiF_P~tuo|bqQd",
      "eMPQI^R^CiF_Q^tuoqQd",
    },
    {"gCi@LDek@zHXismQ{_yMXxLT`"}, // 363 cyanohydrin
    {"eMdXZWde`zqe]u_qQd"}, // 364 nitro group
    {"gCh`HDdsPGQCENoROVSe|Ksjo~NCEH"}, // 365 aromatic nitro
    {"gCh`HDdsPGQCEN_ROVSe|Ksjo~NCEH"}, // 366 aliphatic nitro
    { // 367 nitrosamine, 2 fragments
      "eMXIDe`zqe]mU\u007Fxu[EFP",
      "eMXiFTe`zqe]mV\u007FyUbcH",
    },
    {"gCi`hEiNyIf`NbFJ\\{Tj_~QVNCEH"}, // 368 nitrate ester
    {"gCd`i`iJyIf`NlFJ]rW|\\FJP"}, // 369 nitramine
    {"gJPhLPDIRthGVCdohGbmg@HAAs`D@b|F\u007FqHXisuX`"}, // 370 thioether
    {"gCaHL@aJZPNlEV_POF[N@PBKp[\u007FGAbglp"}, // 371 aryl thioether
    { // 372 dialkyl thioether, 3 fragments
      "eMB@HchNlYWt[mfn|O\u007FEFP",
      "eMB@HchNlYWtWmfn|W\u007FEFP",
      "eMB@HchNlYWtOmfn|[\u007FEFP",
    },
    {"eMB@HchNdY|cwWc_xhr"}, // 373 methylthio
    { // 374 N,S-acetal, 4 fragments
      "diE`PLJfxPBDBDfjjjj`CjPXT\\RZV^aoPe{bG^Do~H`phxdtl|}XLJfx",
      "dmUhpBinFU@HPHpHRZjjjjj`CkPXT\\RZV^aiU_Qeqa\\xA@HwDN|Y_|UAaQqIiYyEezHHUMpj",
      "diE`PLJfxPBDBDfjjjj`CjPXT\\RZV^aoPc{bG^Dw~H`phxdtl|}XLJfx",
      "dmUhpBinFU@HPHpHRZjjjjj`CkPXT\\RZV^aiU_Qcqa\\xA@HwDN|Yo|UAaQqIiYyEezHHUMpj",
    },
    { // 375 diaryl thioether, 3 fragments
      "eMB@HchNlZ[t[^G\u007FbcH",
      "eMB@HchNlZ[tW^K\u007FbcH",
      "eMB@HchNlZ[tO^M\u007FbcH",
    },
    {"gC`D@DPHRfhCiAcyAx}tMs_xxLT`"}, // 376 disulfide
    { // 377 thioacetal, 78 fragments
      "gJPD@DXHRgj`NjFJlf}`|wO]C^w~ICENP",
      "gJPD@DXHRgj`NjFJlf}`|wOnIWPwm\u007FbPqSd",
      "gGXDL@`aBToWPGSCENRv}`ztonQWPv]\u007FcPqSdoY`",
      "diEHrLJ`BDBNBBgHiHjfuj@NiAaQqIiYyF|PNcmoOFJS`DMyEKU[xEtwv\u007F|bkDPXT\\RZV^^dFEP",
      "gJPD@DXHRgj`NjFJlf}`|wOmIEWPwm\u007FbPqSd",
      "gGXDL@`aBToWPGSCENRv}`ztomQUWPv]\u007FcPqSdoY`",
      "diEHrLJ`BDBNBBgHiHjfuj@NiAaQqIiYyF|PNcmoOFJS`DMeEKUQU|Bz[{_~QUbHLJNIMKOORCBh",
      "gNtDLpDDHRevnlCkabgIZm}`ztomQUWPv]\u007FbpqSdm^kL",
      "degHrLJZ@HPHxHJ\\bdbjSZuXAthLJNIMKOHlobAt]myxqR\\@alhiZjJo`WS_[\u007FrJlYAaQqIiYyE{PXUR",
      "dkLdILI]hpBDBNBIBBgYrJRJiRQmZgT@zlFEGDfegdVUWTwu@zNv||oEJS`DCS`DMmEKUQnx{\\`nf~wM\u007F|Rj]bXLJNIMKOHljnoQCBjUtp",
      "gJQHL@aJ^j@zhXjr[rCs]sN|F\u007F|flRFJ\\`",
      "gJQHL@aJ^j@zhXjr[rCs]kLj|F\u007F|flRFJ\\`",
      "gGYHK`DISmU`]LLUYKWrCs]kLj|F\u007F|flZFJ\\e{J",
      "diEDRLIJ@HxHJ\\bdbj[Vh@zdFEGDfegd[v@{[sqbdxACYQTYZk]@ov\u007F|QKUbHLJNIMKOORCBh",
      "gJQHL@aJ^j@zhXjr[rCs]iKN|F\u007F|flRFJ\\`",
      "gJQHL@aJ^j@zhXjr[rCs]yKLj|F\u007F|flRFJ\\`",
      "gGYHK`DISmU`]LLUYKWrCs]yKLj|F\u007F|flZFJ\\e{J",
      "diEDRLIJ@HxHJ\\bdbj[Vh@zdFEGDfegd[v@{[sqbdxAC]QTYZjJn`W{_~HejqDFEGDfeggiAaT",
      "gGYHLPDIR}]@]LLTyK[rCk]jHn|F\u007F|alZFJ\\e{L",
      "gGYHLPDIR}]@]LLTyK[rCk]zHnj|F\u007F|alZFJ\\e{L",
      "gNuHLr@aJWZzpNnFJ\\ejwrCk]zHnj|F\u007F|alVFJ\\ekuY`",
      "degDRLJTh@c``irJRJiMkU`GR`phxdtl|br~pG[^^LTg@H[jJcKUQUtB\u007F[\u007FqDmVL`phxdtl|b}hLJi@",
      "diEDRLJn@HPHJ\\bdbj[Vh@zdFEGDfegd[v@zNvqbdxACYQRuWg]@nf\u007F|RkubHLJNIMKOORCBh",
      "diEDRLJn@HPHJ\\bdbj[Vh@zdFEGDfegd[v@zNvqbdxAC]QRuWfJn`WS_~IUzqDFEGDfeggiAaT",
      "degDRLJZx@a@`irJRJiMkU`GR`phxdtl|br~pGQvvLTg@H[jJVj|qUtBz[\u007FqJoVL`phxdtl|b}hLJi@",
      "dkLlqLI]kc@HPHdHJ]gHiHjeIFuj]PCjpXT\\RZV^QYU]S_DCh{[KqRdxA@txAC_QRuWfMwG[xEtwM\u007F|rkuNqLFEGDfegdVUWWhaaUJzX",
      "gGPD@DXHRfzj@zhXjs[vCr|}tM{_xtLTyJ",
      "gGPD@DXHRfzj@zhXjs[vCr|~xe]C^w~MCENR`",
      "gNxDL@`aBTmuu@]LLTyJ{vCjr~yE]CYw~KCENRu{L",
      "deeHrLJ`BDBNBBgHiHkDvmT@]RCBcbSRssMx`]GZ~^LTg@H[rJVjwpKiom\u007FyEVL`phxdtl|b}HLJ`",
      "gGPD@DXHRfzj@zhXjs[vCr|~teU]C^w~MCENR`",
      "gNxDL@`aBTmuu@]LLTyJ{vCjr~uDu]CYw~KCENRu{L",
      "deeHrLJ`BDBNBBgHiHkDvmT@]RCBcbSRssMx`]GZ~^LTg@H[JJVjrkxEtwv\u007F|bkFPXT\\RZV^Q^dFEP",
      "day@PLx@``aJV~nk@NnAaQqIYy}`Ned~taLkhFrw~O@phxdtl}SN@",
      "dmWHrLIZ@HPHxHJ\\bdblV[VjpCiPXT\\RZV^YU_DCh{WsqbdxACYQRuVU_@nf~w\u007FdUXjCBcbSRsrKKv`pjT",
      "dgldILKSjpBDBNBEBBdyrJRJqZRMkUNhAuXLJNIMKOLjnimojAt]kyu^JTg@HVg@H[ZJVjsSuvyA]M}m[\u007FxeV{FpXT\\RZV^QYU]S^bFERz]`",
      "gGQHL@aJ[jhCjabkMoHOKwL{p[\u007FrZqhXirT",
      "gGQHL@aJ[jhCjabkMoHOKvlzkp[\u007FrZqhXirT",
      "gNyHG`DIS_UVAtpqUfk_HOKvlzkp[\u007FrZqXXirVoXp",
      "deeDRLIJ@HxHJ\\bdblSZuPAuHLJNIMKOLwlAvogcEIpBFrbhruVzA_m\u007FxbVkFPXT\\RZV^Q^dFEP",
      "gGQHL@aJ[jhCjabkMoHOKvdl{p[\u007FrZqhXirT",
      "gGQHL@aJ[jhCjabkMoHOKwdlzkp[\u007FrZqhXirT",
      "gNyHG`DIS_UVAtpqUfk_HOKwdlzkp[\u007FrZqXXirVoXp",
      "deeDRLIJ@HxHJ\\bdblSZuPAuHLJNIMKOLwlAvogcEIpBFzbhruVU]@ov\u007F|QKUcHLJNIMKOHoRCBh",
      "gNyHLPDIRwWTAtpqSdkoHNkvhb{p[\u007FrFqXXirVoY`",
      "gNyHLPDIRwWTAtpqSdkoHNkwhbvkp[\u007FrFqXXirVoY`",
      "dayH`Lx`BDi[zzl@zxFEGDeggr@zWoHQMe^@w\u007FdEX|CBcbSRsuLx",
      "dmWDRLITh@c``irJRJqYmZk@NeAaQqIiYyeU}`Nu||XiN@PwTUFVjrkhE~w\u007FbIZlUAaQqIiYyEe{PXUJ",
      "deeDRLJn@HPHJ\\bdblSZuPAuHLJNIMKOLwlAt]kcEIpBFrbejoNzA]M\u007FxeWkFPXT\\RZV^Q^dFEP",
      "deeDRLJn@HPHJ\\bdblSZuPAuHLJNIMKOLwlAt]kcEIpBFzbejoNU]@nf\u007F|RkucHLJNIMKOHoRCBh",
      "dmWDRLIZx@a@`irJRJqYmZk@NeAaQqIiYyeU}`Ncm\\XiN@PwTTmUyrkhEtw\u007FbU^lUAaQqIiYyEe{PXUJ",
      "dgllqLKSkk@HPHTHJSgHiHkEiHvmTz`GU`phxdtl|rjzfv~HGQvmWbeIpBEipBF~bejoNZ^nwpKim[\u007FyeWk]cXLJNIMKOHljnioQCBi]Np",
      "gNpD@DXHRfnjhCjabkKoHOgwH{h[v\u007FqXXirVh",
      "gNpD@DXHRfnjhCjabkKoHOgvhtkh[v\u007FqXXirVh",
      "daz@PL@HHHRekkj`Ci`XT\\R^oHCd~taH{hFrw~O@phxdtl}c@",
      "dmUHrLJ`BDBNBBgHiHkHfujh@zdFEGDfege[v@zOsqbdxACYQRuUg_@nf~w\u007FdUXjCBcbSRsrKKt`pj@",
      "gNpD@DXHRfnjhCjabkKoHOgwhtfkh[v\u007FqXXirVh",
      "daz@PL@HHHRekkj`Ci`XT\\R^oHCd~|aH~UtCY[\u007FG`XT\\RZV^q`",
      "dmUHrLJ`BDBNBBgHiHkHfujh@zdFEGDfege[v@zOsqbdxAC]QRuUfjo`WS_[\u007FrJlUAaQqIiYyEezPXU@",
      "diE@PLD@``cIDiLZzk@NnAaQqIyE|`NS{rDcyWPMeo|QAaQqIiYyzfB",
      "dcwHrLKZ@HPHxHJ\\bdblbKZuU`GR`phxdtl|jz~pGQ~^LTg@H[jJVjluU|Bz[{_~QUchLJNIMKOHljoZCBkP",
      "do\\dILH{ipBDBNBMBBfyrJRJrHrQmZj]PCjpXT\\RZV^U]S[W_DCh\u007FOkqRdxAAtxAC_QRuUfmoO[dEtwv}o\u007FbUWlWAaQqIiYyEeUuMmzHXUZ]n",
      "gNqHL@aJZzj`NjFJln}@~uGg^C_~SVKCENRu@",
      "gNqHL@aJZzj`NjFJln}@~}Gfu^C_~SVKCENRu@",
      "dazH`Np@cIEIcUU`GS@piXl|~`GwdOFro@[\u007FrLl^AaQqIiY{G@",
      "dmUDRLIJ@HxHJ\\bdblb[Vj`CjPXT\\RZV^UoHC||XiN@PwTUFVjl{hE~w\u007FbIZlUAaQqIiYyEezPXU@",
      "gNqHL@aJZzj`NjFJln}@~}Feg^C_~SVKCENRu@",
      "gNqHL@aJZzj`NjFJln}@~sFefu^C_~SVKCENRu@",
      "dazH`Np@cIEIcUU`GS@piXl|~`GvTMEcYW`M\u007FyFVO@phxdtl}c`",
      "dmUDRLIJ@HxHJ\\bdblb[Vj`CjPXT\\RZV^UoHC||XiN@PvtUFVjluUtB\u007F[\u007FqDmVJ`phxdtl|br}HLJ`",
      "dazH`LH@aJVnnj@NfAaQqIz}@OoHRLg^@w\u007FdEX|CBcbSRsvL@",
      "dazH`LH@aJVnnj@NfAaQqIz}@OlhRLgro@[\u007FrBl^AaQqIiY{F@",
      "diEH`LD`BLdRdqkjl@zxFEGDgdWt@~raHr_J|Ao\u007FHJqDFEGDfeggjXH",
      "dcwDRLKTh@c``irJRJrHmkUV@]JCBcbSRsrkky@_gcEIpBFvbhruUfjn`W{_~HejqtFEGDfegdVUWmAaUh",
      "dmUDRLJn@HPHJ\\bdblb[Vj`CjPXT\\RZV^UoHCh|XiN@PwTTmUY|{hEtw\u007FbU^lUAaQqIiYyEezPXU@",
      "dmUDRLJn@HPHJ\\bdblb[Vj`CjPXT\\RZV^UoHCh|XiN@PvtTmUY|uUtBz[\u007FqJoVJ`phxdtl|br}HLJ`",
      "dcwDRLKZx@a@`irJRJrHmkUV@]JCBcbSRsrkky@]GcEIpBFvbejkOfjn`WS_~IUzqtFEGDfegdVUWmAaUh",
      "do\\lqLH{kg@HPHtHJ[gHiHkHcIFujiu@NkAaQqIiYyUuMm]}`Ncz|TiN@P]N@PvLTmUY|umy{_@nf}o\u007FfU^kvK`phxdtl|brjzfv}DLJmNw@",
    },
    { // 378 sulfenamide, 2 fragments
      "eMbHBHzCiF_P~z]xw\u007FeVJL`",
      "eMbhBJXzCiF_P~zmxw~JL`",
    },
    { // 379 sulfoxide, 2 fragments
      "gCaHH@bNtAt`q}@}xN\u007Fc`qR",
      "gCaHh@`SNcu@]HL_PO^CoxxLT`",
    },
    { // 380 sulfonyl group, 3 fragments
      "eMFI@bMPzqe_Qmxw~JL`",
      "eMFI@bMPzqe_Q]x{~JL`",
      "eMFI@bMPzqe_P}x}~JL`",
    },
    { // 381 sulfonamide, 4 fragments
      "gChhMD@bNlAtPqSgtE{f]xN\u007FyMXxLT`",
      "gChiMD@cSGV@zHXiszB}sV|G_qpXi@",
      "gChhMD@bNlAtPqSgtC{f]xO_yMXxLT`",
      "gChiMD@cSGV@zHXiszA}sV|GoqpXi@",
    },
    { // 382 sulfonic acid, 4 fragments
      "gCahHl@bNlAtPqSgrEz}sN|G_|fl\\FJP",
      "gCahHl@bNlAtPqSgrCz}sN|Go|fl\\FJP",
      "gCaiHl@c]GV@zHXiszB}sN|G_qpXi@",
      "gCaiHl@c]GV@zHXiszA}sN|GoqpXi@",
    },
    {"gJPhH`DQztAu`qSzA{p^\u007FDabgH"}, // 383 sulfone
    { // 384 methylsulfonyl, 15 fragments
      "gJPhH`DQztAtPqSftOdMwW`w~ICENP",
      "gJPhH`DQztAtPqSftOdKwW`{~ICENP",
      "gJPhH`DQztAtPqSftOdGwW`}~ICENP",
      "gJPhh`DBUt^u@]DLTymCyC]uxM\u007FbPqSd",
      "gC`hh`DBUt]hChabgOdMwW`w~NCEH",
      "gJPhh`DBUt^u@]DLTymCyB}uxN\u007FbPqSd",
      "gC`hh`DBUt]hChabgOdKwW`{~NCEH",
      "gJPhh`DBUt^u@]DLTymCyA}uxO_bPqSd",
      "gC`hh`DBUt]hChabgOdGwW`}~NCEH",
      "gJPih`DAYrzOj`NbFJ\\va|anz|F\u007FqHXir",
      "gC`ih`DAYrzOTAtPqSgrF{kp[\u007FGAbd",
      "gJPih`DAYrzOj`NbFJ\\va|a^z|G_qHXir",
      "gC`ih`DAYrzOTAtPqSgrE{kp]\u007FGAbd",
      "gJPih`DAYrzOj`NbFJ\\va|`~z|GoqHXir",
      "gC`ih`DAYrzOTAtPqSgrC{kp^\u007FGAbd",
    },
    {"gJXhMD@bOV`NbFJ\\vanQzWU}_|RFJ\\`"}, // 385 primary sulfonamide
    { // 386 sulfate, 2 fragments
      "gJPXHlPDQztAuPqSdohGvlr{p^\u007FqZfqHXir",
      "gJPYHlPDGh}Z@zhXirWtC{VY]xO_yMXdLTy@",
    },
    {"gGQhHl@cIIBmPGQCEN_POnYw`}\u007FducPqSdh"}, // 387 sulfonate ester
    {"gGXhMD@cIIBmPGUCENRve}CuzORzomf\u007FxtLTyJ"}, // 388 methanesulfonamide
    { // 389 sulfamide, 3 fragments
      "gJThLX`DQztAu`qSzA}fUWLn|Go|LjnilRFJ\\`",
      "gJTiLX`DZX}Z@zpXi}@~sJkjW^Cw~ZUTvICENP",
      "gJThlX`DZSL^m@]XLT~`_YeUuMoA{\u007FEJkDabgH",
    },
    { // 390 sulfamate, 180 fragments
      "gJYhCE`DQztAtPqSgtF{a]xM\u007FyCXdLTy@",
      "gJYhCE`DQztAtPqSgtE{a]xN\u007FyCXdLTy@",
      "gJYhCE`DQztAtPqSgtC{a]xO_yCXdLTy@",
      "gJYhcE`DB]t^u@]DLTy}AnxW^C_~PvICENP",
      "gChhmD@`Rncm@]XLT~`w\\soAo\u007FIkGAbd",
      "gJYhcE`DB]t^u@]DLTy}A^xW^Co~PvICENP",
      "gChhmD@`Rncm@]XLT~`o\\soAw\u007FIkGAbd",
      "gJYhcE`DB]t^u@]DLTy}@~xW^Cw~PvICENP",
      "gChhmD@`Rncm@]XLT~`_\\soA{\u007FIkGAbd",
      "gJYicE`DAUvzOj`NbFJ\\~`w\\KoAo\u007FH[DabgH",
      "gChimD@`KNWQz`NlFJ_P[nYw`w\u007Fduc`qR",
      "gJYicE`DAUvzOj`NbFJ\\~`o\\KoAw\u007FH[DabgH",
      "gChimD@`KNWQz`NlFJ_PWnYw`{\u007Fduc`qR",
      "gJYicE`DAUvzOj`NbFJ\\~`_\\KoA{\u007FH[DabgH",
      "gChimD@`KNWQz`NlFJ_POnYw`}\u007Fduc`qR",
      "gJYiCE`DFX}Z@zHXiszC]pv|F\u007FqHXir",
      "gJYiCE`DFX}Z@zHXiszB}pv|G_qHXir",
      "gJYiCE`DFX}Z@zHXiszA}pv|GoqHXir",
      "gJYicE`DB]qfOZ`NbFJ\\~`w\\MoAo|RFJ\\`",
      "gChimD@`Rntqv`NlFJ_P[nZw`w~NCEH",
      "gJYicE`DB]qfOZ`NbFJ\\~`o\\MoAw|RFJ\\`",
      "gChimD@`Rntqv`NlFJ_PWnZw`{~NCEH",
      "gJYicE`DB]qfOZ`NbFJ\\~`_\\MoA{|RFJ\\`",
      "gChimD@`Rntqv`NlFJ_POnZw`}~NCEH",
      "gJYhSE`DAUvxsGuPGQCEN_P[nFw`w~ICENP",
      "gChh]D@`KNWZX}PGVCEOhMwM[p[\u007FGAbd",
      "gJYhSE`DAUvxsGuPGQCEN_PWnFw`{~ICENP",
      "gChh]D@`KNWZX}PGVCEOhKwM[p]\u007FGAbd",
      "gJYhSE`DAUvxsGuPGQCEN_POnFw`}~ICENP",
      "gChh]D@`KNWZX}PGVCEOhGwM[p^\u007FGAbd",
      "gGYhCE`DYIIUi@zXXirVohMvc[[p[\u007FrFqhXirT",
      "gGYhCE`DYIIUi@zXXirVohKvc[[p]\u007FrFqhXirT",
      "gGYhCE`DYIIUi@zXXirVohGvc[[p^\u007FrFqhXirT",
      "gGYdCE`DWprRRkRAtpqSdm_H[^wC[h[m\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HW^wC[h]m\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HO^wC[h^m\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_H[]wC[h[n\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HW]wC[h]n\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HO]wC[h^n\u007F|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_H[[wC[h[o_|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HW[wC[h]o_|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HO[wC[h^o_|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_H[WwC[h[oo|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HWWwC[h]oo|alZFJ\\e@",
      "gGYdCE`DWprRRkRAtpqSdm_HOWwC[h^oo|alZFJ\\e@",
      "gGYiCE`DF\\ddjt`]LLTyKWtF{QumxM\u007FcPqSdh",
      "gGYiCE`DF\\ddjt`]LLTyKWtE{QumxN\u007FcPqSdh",
      "gGYiCE`DF\\ddjt`]LLTyKWtC{QumxO_cPqSdh",
      "gGYeCE`DWpLyIIUi@zXXirVodMo[autMv\u007FxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodKo[autNv\u007FxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodGo[autOV\u007FxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodMn{autMw_xtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodKn{autNw_xtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodGn{autOW_xtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodMm{autMwoxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodKm{autNwoxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodGm{autOWoxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodMk{autMwwxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodKk{autNwwxtLTyJ",
      "gGYeCE`DWpLyIIUi@zXXirVodGk{autOWwxtLTyJ",
      "gGYhcE`DB]vRRUjPNfFJ\\ekzC]hvv|F\u007F|alZFJ\\e@",
      "gJXhmD@`RnrREi@zhXirWtF{VimxM\u007FyMXdLTy@",
      "gGYhcE`DB]vRRUjPNfFJ\\ekzB}hvv|G_|alZFJ\\e@",
      "gJXhmD@`RnrREi@zhXirWtE{VimxN\u007FyMXdLTy@",
      "gGYhcE`DB]vRRUjPNfFJ\\ekzA}hvv|Go|alZFJ\\e@",
      "gJXhmD@`RnrREi@zhXirWtC{VimxO_yMXdLTy@",
      "gGYdcE`DWpD{lddkT`]LLTyKWrFwmpvzF{_\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodMO[fmtMf\u007F~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrEwmpvzG[_\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodKO[fmtNf\u007F~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrCwmpvzGk_\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodGO[fmtOF\u007F~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrFw]pvzF{o\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodMN{fmtMg_~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrEw]pvzG[o\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodKN{fmtNg_~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrCw]pvzGko\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodGN{fmtOG_~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrFv}pvzF{w\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodMM{fmtMgo~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrEv}pvzG[w\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodKM{fmtNgo~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrCv}pvzGkw\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodGM{fmtOGo~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrFu}pvzF{{\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodMK{fmtMgw~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrEu}pvzG[{\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodKK{fmtNgw~SVICENP",
      "gGYdcE`DWpD{lddkT`]LLTyKWrCu}pvzGk{\u007FH[FabgIP",
      "gJXdmD@`~@e]ddKRAuPqSdodGK{fmtOGw~SVICENP",
      "gGYicE`DB]qgIIJuHGSCENRu}Ant][^C_xtLTyJ",
      "gJXimD@`RntyIBt`]TLTyKzC]kXv|F\u007FqHXir",
      "gGYicE`DB]qgIIJuHGSCENRu}A^t][^CoxtLTyJ",
      "gJXimD@`RntyIBt`]TLTyKzB}kXv|G_qHXir",
      "gGYicE`DB]qgIIJuHGSCENRu}@~t][^CwxtLTyJ",
      "gJXimD@`RntyIBt`]TLTyKzA}kXv|GoqHXir",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyC[vx]]C]o~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrFgmsZzFs_|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyB{vx]]Cmo~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrEgmsZzGS_|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyA{vx]]Cuo~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrCgmsZzGc_|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyC[nx]]C]w~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrFg]sZzFso|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyB{nx]]Cmw~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrEg]sZzGSo|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyA{nx]]Cuw~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrCg]sZzGco|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyC[^x]]C]{~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrFf}sZzFsw|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyB{^x]]Cm{~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrEf}sZzGSw|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyA{^x]]Cu{~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrCf}sZzGcw|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyCZ~x]]C]}~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrFe}sZzFs{|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyBz~x]]Cm}~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrEe}sZzGS{|RFJ\\`",
      "gGYecE`DWpD{cNRRUjPNfFJ\\ekyAz~x]]Cu}~MCENR`",
      "gJXemD@`~@e]irREi@zhXirWrCe}sZzGc{|RFJ\\`",
      "gGYicE`DAUv{IIKUHGSCENRu}Ant[[^C_~PvMCENR`",
      "gJXimD@`KNWYICT`]TLTyKzC]kTv|F\u007F|flRFJ\\`",
      "gGYicE`DAUv{IIKUHGSCENRu}A^t[[^Co~PvMCENR`",
      "gJXimD@`KNWYICT`]TLTyKzB}kTv|G_|flRFJ\\`",
      "gGYicE`DAUv{IIKUHGSCENRu}@~t[[^Cw~PvMCENR`",
      "gJXimD@`KNWYICT`]TLTyKzA}kTv|Go|flRFJ\\`",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyC[vx[]C]o\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrFgmsVzFs_\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyB{vx[]Cmo\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrEgmsVzGS_\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyA{vx[]Cuo\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrCgmsVzGc_\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyC[nx[]C]w\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrFg]sVzFso\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyB{nx[]Cmw\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrEg]sVzGSo\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyA{nx[]Cuw\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrCg]sVzGco\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyC[^x[]C]{\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrFf}sVzFsw\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyB{^x[]Cm{\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrEf}sVzGSw\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyA{^x[]Cu{\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrCf}sVzGcw\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyCZ~x[]C]}\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrFe}sVzFs{\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyBz~x[]Cm}\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrEe}sVzGS{\u007FIkDabgH",
      "gGYecE`DWpBkmvRRVjPNfFJ\\ekyAz~x[]Cu}\u007FdMcPqSdh",
      "gJXemD@`~@V\\nrRFi@zhXirWrCe}sVzGc{\u007FIkDabgH",
      "gGYhSE`DAUvxsddejdCiabgIZ~`wZNmoAo|ZFJ\\e@",
      "gJXh]D@`KNWZ\\dajPNjFJ\\e}Anul[^C_xdLTy@",
      "gGYhSE`DAUvxsddejdCiabgIZ~`oZNmoAw|ZFJ\\e@",
      "gJXh]D@`KNWZ\\dajPNjFJ\\e}A^ul[^CoxdLTy@",
      "gGYhSE`DAUvxsddejdCiabgIZ~`_ZNmoA{|ZFJ\\e@",
      "gJXh]D@`KNWZ\\dajPNjFJ\\e}@~ul[^CwxdLTy@",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|am{\\Nnanw\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyCSvym]CYo~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|a]{\\Nnavw\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyBsvym]Cio~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|`}{\\Nnazw\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyAsvym]Cqo~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|amw\\Nnan{\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyCSnym]CYw~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|a]w\\Nnav{\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyBsnym]Ciw~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|`}w\\Nnaz{\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyAsnym]Cqw~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|amo\\Nnan}\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyCS^ym]CY{~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|a]o\\Nnav}\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyBs^ym]Ci{~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|`}o\\Nnaz}\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyAs^ym]Cq{~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|am_\\Nnan~\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyCR~ym]CY}~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|a]_\\Nnav~\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyBr~ym]Ci}~ICENP",
      "gGYdSE`DWpBkmqgIIKUHGSCENRu|`}_\\Nnaz~\u007FFabgIP",
      "gJXd]D@`~@V\\ntyICT`]TLTyKyAr~ym]Cq}~ICENP",
    },
    { // 391 sulfonylurea, 8 fragments
      "gNuhLxj@cIHUEi`NnFJ\\ejwtE{vYk]xN\u007FxmWXlLTyKT",
      "gNuiLxj@asddJbtpGWCENRu[zB}{Luv|G_|flVFJ\\ej",
      "gNuiLxj@cSddJbtpGWCENRu[zB}{Tun|G_|clVFJ\\ej",
      "gNuhlxj@cRyrREQZXCkabgIZm}A^}jZ{^CoxlLTyKT",
      "gNuhLxj@cIHUEi`NnFJ\\ejwtC{vYk]xO_xmWXlLTyKT",
      "gNuiLxj@asddJbtpGWCENRu[zA}{Luv|Go|flVFJ\\ej",
      "gNuiLxj@cSddJbtpGWCENRu[zA}{Tun|Go|clVFJ\\ej",
      "gNuhlxj@cRyrREQZXCkabgIZm}@~}jZ{^CwxlLTyKT",
    },
    { // 392 triflyl, 15 fragments
      "daxDHHP@biAiCiCIICHmU@GW@phxtl|v`oPFw`M\u007FcpLJNIMKH",
      "daxDHHP@biAiCiCIICHmU@GW@phxtl|v`oPEw`N\u007FcpLJNIMKH",
      "daxDHHP@biAiCiCIICHmU@GW@phxtl|v`oPCw`O_cpLJNIMKH",
      "daxDIHP@biAiCi@ISlddLcUT@]\\CBccRssZB}@[^@w~O@phxdtl`",
      "gNpbh`DFPl`y@RnrRFQjhCkabgIZm}AmxM\u007FbpqSdmP",
      "daxDIHP@biAiCi@ISlddLcUT@]\\CBccRssZB}@W^@{~O@phxdtl`",
      "gNpbh`DFPl`y@RnrRFQjhCkabgIZm}A]xN\u007FbpqSdmP",
      "daxDIHP@biAiCi@ISlddLcUT@]\\CBccRssZB}@O^@}~O@phxdtl`",
      "gNpbh`DFPl`y@RnrRFQjhCkabgIZm}@}xO_bpqSdmP",
      "daxDKHP@biAiCi@Ecd{IICIUU@GW@phxtl|v`oPFw`M\u007FcpLJNIMKH",
      "gNpch`DFPl`y@KNWYICIUTAupqSdmV~`v|F\u007FqXXirVh",
      "daxDKHP@biAiCi@Ecd{IICIUU@GW@phxtl|v`oPEw`N\u007FcpLJNIMKH",
      "gNpch`DFPl`y@KNWYICIUTAupqSdmV~`n|G_qXXirVh",
      "daxDKHP@biAiCi@Ecd{IICIUU@GW@phxtl|v`oPCw`O_cpLJNIMKH",
      "gNpch`DFPl`y@KNWYICIUTAupqSdmV~`^|GoqXXirVh",
    },
    { // 393 isothiourea, 30 fragments
      "gNtHLPDIS[STAmeWzBxyPpVFAppUhuM[Qu][tni]xK\u007FxmSXqO\\jp",
      "gNtILPDFTimij@vrk}A\\\\hXKC@xXJtZfmhznmzWTv|E\u007F|flXgnUX",
      "gNtHLPDIS[STAmeWzAxyPpVFAppUhuM[Qu][tni]xM\u007FxmSXqO\\jp",
      "gNtILPDFTimij@vrk}@|\\hXKC@xXJtZfmhznmzWTv|F\u007F|flXgnUX",
      "gGTIE`DCdfVZ`NhFrM}@|TXXKCAWKVt][tjn]xK\u007Fxe]XhL^ht",
      "gGTHe`DCmJSKMPGTCYF~`^JLLEa`kekZNmzUWV|E\u007F|blTFOTZ",
      "gNtILPDZTimij@vrk}A\\\\hXKC@xXJtZfmhznmzWXn|E\u007F|alXgnUX",
      "gNtHlPDZSJTvtu@[YU~`nNTLEa`\\LEZMSVt]WV}Kl[^B\u007FxqO\\jp",
      "gNtILPDZTimij@vrk}@|\\hXKC@xXJtZfmhznmzWXn|F\u007F|alXgnUX",
      "gNtHlPDZSJTvtu@[YU~`^NTLEa`\\LEZMSVt]WV}Kl[^C_xqO\\jp",
      "gGTHe`DCeJSKMPGTCYF~`^JLLEa`kekZNmzU[N|E\u007F|flTFOTZ",
      "gGTIe`DCeNeIefhCjAlc_POEFFBppUrumGV}Jmk^B\u007FxhL^ht",
      "gNtHLPDIS[UTAmeWzBxyPpVFAppUXuMKVt]WV}Kf[^B\u007F~KTvLuwJl",
      "gNtILPDZTimjj@vrk}A\\\\hXKC@xXJlZfekZNkk^euMoA_\u007FH[FZ{eV",
      "gNtHLPDIS[UTAmeWzAxyPpVFAppUXuMKVt]WV}Kf[^C_~KTvLuwJl",
      "gNtILPDZTimjj@vrk}@|\\hXKC@xXJlZfekZNkk^euMoAo\u007FH[FZ{eV",
      "gGTIE`DCdfVj`NhFrM}@|TXXKCATsRumGV}Jgk^B\u007F~IWVJBkjM@",
      "gGTHe`DCeJSKUPGTCYF~`^JLLEa`jYiZvck^eUuoA_\u007FIkEAUuF`",
      "gNtILPDZTimjj@vrk}A\\\\hXKC@xXJlZfekZNkk^evKoA_\u007FH[FJ{eV",
      "gNtHlPDZSJTvuU@[YU~`nNTLEa`\\LEVMSRumGUuoRzgW`o~LuwJl",
      "gNtILPDZTimjj@vrk}@|\\hXKC@xXJlZfekZNkk^evKoAo\u007FH[FJ{eV",
      "gNtHlPDZSJTvuU@[YU~`^NTLEa`\\LEVMSRumGUuoRzgW`w~LuwJl",
      "gGTHe`DCeJSKUPGTCYF~`^JLLEa`jYiZvck^eVsoA_\u007FIkEAeuF`",
      "gGTIe`DCeNeIejhCjAlc_POEFFBppULtm[QuoRj{W`o~JBkjM@",
      "gNtILPDGdimjj@vrk}A\\\\hXKC@xXJlZfekZNkk^esKoA_\u007FIkFZ{eV",
      "gNtHlPDZSrTvuU@[YU~`nNTLEa`\\LEVMSRumGUuoRzew`o~LuwJl",
      "gNtILPDGdimjj@vrk}@|\\hXKC@xXJlZfekZNkk^esKoAo\u007FIkFZ{eV",
      "gNtHlPDZSrTvuU@[YU~`^NTLEa`\\LEVMSRumGUuoRzew`w~LuwJl",
      "gGTHe`DCmrSKUPGTCYF~`^JLLEa`jYiZvck^eSsoA_\u007FHkEAUuF`",
      "gGTIe`DCeNyIejhCjAlc_POEFFBppULtm[QuoRjyw`o~JBkjM@",
    },
    {"eFB@HbatcOh_]V|W\u007FFD"}, // 394 thiocarbonyl
    { // 395 thioester, 2 fragments
      "gJQHL@aJZf@zpXy}@~yK^C_xdLTy@",
      "gCaHL@aJZPNlFN_HOHwI[p[\u007FGAbd",
    },
    { // 396 dithiocarbamate, 6 fragments
      "gChDL@aABSM@]DLTy|`zoZesna]W\u007FrZqpXi@",
      "gChDL@aABSM@]DLTy|`z_Zesna][\u007FrZqpXi@",
      "gChEL@aAByIf`NbFJ\\~P]OmRywPnk\u007FyMXxLT`",
      "gChEL@aAFeIf`NbFJ\\~P]WmRzwPnk\u007Fc`qR",
      "gChEL@aAFeIf`NbFJ\\~P]OmRzwPnm\u007Fc`qR",
      "gChDl@aAB{RdsPGQCEN_HNgvi][hWU\u007FqpXi@",
    },
    { // 397 thiocarbamate, 10 fragments
      "gCiHL`DIMLAu`qSzB}sN|E\u007F|fl\\FJP",
      "gCiHL`DIMLAu`qSzA}sN|F\u007F|fl\\FJP",
      "gCiIL`DZTff@zpXi}A^yk^B\u007FxxLT`",
      "gCiIL`DZTff@zpXi}@~yk^C_xxLT`",
      "gCiHL`DIMLAu`qSzB}sV|E\u007F|fl\\FJP",
      "gCiHL`DIMLAu`qSzA}sV|F\u007F|fl\\FJP",
      "gCiIL`DZTff@zpXi}A^ym^B\u007FxxLT`",
      "gCiIL`DZTff@zpXi}@~ym^C_xxLT`",
      "gCiIL`D[dff@zpXi}A^yg^B\u007FxxLT`",
      "gCiIL`D[dff@zpXi}@~yg^C_xxLT`",
    },
    { // 398 thioamide, 4 fragments
      "gChHD@aIf`NlFJ_POmRiw`o\u007FdUc`qR",
      "gChID@aRdsPGVCEOhGviU[pW\u007FGAbd",
      "eMbDBDe`zqe_H}Fvj{q_\u007FIlTY@",
      "eMbdBFTe`zqe_H}Fvk[q_|TY@",
    },
    { // 399 thiosemicarbazone, 8 fragments
      "gNrHEcPDILjuRAu@~`^ifekZNmfUOLv|E\u007F|rnilTFoYP",
      "gNrIEcPDJTfWZi@z`_POTsRumGVsJkg[^B\u007F~KVvJCWlH",
      "gNrIEcPDJTfUZi@z`_POTsRumGVsJkf[^B\u007F~KTvJCWlh",
      "gNrHecPDJ]JSJmT`]POhGjYiZvckYeUuMoA_\u007FH[EAkvT",
      "gNrIEcPDFTfUZi@z`_POTsRumGVsJgf]^B\u007F~IWVJCWlh",
      "gNrHecPDJ[JSKmT`]POhGjYiZvckYeUsnoA_\u007FIkEAkvD",
      "gNrHecPDJSJSJmT`]POhGjYiZvckYeUsNoA_\u007FIkEAkvT",
      "gNrIecPDJ]IeIeVjPNhGtCuLtm[QulrjzgW`o~JCWlh",
    },
    {"eFB@HcAuCzKoE\u007Fqa@"}, // 400 thiol
    { // 401 thiophenol, 2 fragments
      "eFB@HcAtcWho]V|W\u007FFD",
      "eFB`HNcAtcWh_]V|W\u007FFD",
    },
    { // 402 phosphate, 4 fragments
      "gJPXHlQxQ{TAuPqSdohGvYT|r{p^\u007FprjzfqHXir",
      "gJPYHlQxGh}j@zhXirWtC{Lj^Y]xO_yiU]XdLTy@",
      "gJPXhlQx[ct^u@]TLTyKzA}fUOLn|Go|TjlRFJ\\`",
      "gJPYhlQxKmqzOZ`NjFJ\\e}@~sJgfW^Cw~RVICENP",
    },
    { // 403 phosphodiester, 2 fragments
      "gJPXHlQxQ{TAuPqSdobGSys^sJgfW^Cw~FUWTvICENP",
      "gJPYHlQxGh}j@zhXirWvCi|~sJgfW^Cw~ZUWVICENP",
    },
    { // 404 phosphate monoester, 3 fragments
      "gJPXHlQxQ{TAuPqSdobGSzs^sJgfW^Cw~FUWTvICENP",
      "gJPYHlQxGh}j@zhXirWvCi}^sJgfW^Cw~ZUWVICENP",
      "gJPXhlQx[ct^u@]TLTyKyAt~sJgfW^Cw~JUVICENP",
    },
    { // 405 pyrophosphate, 6 fragments
      "gJQdHbOC^BUkRAuPqSdodMv{b]tM{_~QVICENP",
      "gJQdHbOC^BUkRAuPqSdodMu{b]tM{o~QVICENP",
      "gJQdHbOC^BUkRAuPqSdodMs{b]tM{w~QVICENP",
      "gJQdHbOC^BUkRAuPqSdodKu{b]tN{o~QVICENP",
      "gJQdHbOC^BUkRAuPqSdodKs{b]tN{w~QVICENP",
      "gJQdHbOC^BUkRAuPqSdodGs{b]tO[w~QVICENP",
    },
    { // 406 phosphoramide, 6 fragments
      "eMjFOBM`zqe_Qny]xw\u007FdvJL`",
      "eMjfOAfM`zqe_Qnymxw~JL`",
      "eMjFOBM`zqe_Q^y]x{\u007FdvJL`",
      "eMjfOAfM`zqe_Q^ymx{~JL`",
      "eMjFOBM`zqe_P~y]x}\u007FdvJL`",
      "eMjfOAfM`zqe_P~ymx}~JL`",
    },
    { // 407 thiophosphate, 4 fragments
      "eFA@HoBJGRL~Q{ki^o~LH",
      "eFA@HoBJGRL~Q{[i^w~LH",
      "eFA@HoBJGRL~Qz{i^{~LH",
      "eFA@HoBJGRL~Qy{i^}~LH",
    },
    {"gJPXHlQxQ{TAuPqSdobGSyr~sJgfW^Cw~FUWTvICENP"}, // 408 phosphate triester
    { // 409 phosphoramidate, 144 fragments
      "gNyhCEaxIUZuTAtPqSfrk}AvxW^B\u007F~PvKCENRu@",
      "gNyhCEaxIUZuTAtPqSfrk}AnxW^C_~PvKCENRu@",
      "gNyhCEaxIUZuTAtPqSfrk}A^xW^Co~PvKCENRu@",
      "gNyhCEaxIUZuTAtPqSfrk}@~xW^Cw~PvKCENRu@",
      "gNyiCEaxFTjmZj@zHXisYU~`{\\MoA_|VFJ\\ej",
      "gNyiCEaxFTjmZj@zHXisYU~`w\\MoAo|VFJ\\ej",
      "gNyiCEaxFTjmZj@zHXisYU~`o\\MoAw|VFJ\\ej",
      "gNyiCEaxFTjmZj@zHXisYU~`_\\MoA{|VFJ\\ej",
      "dazL`BaLCpRjuZjPCi`XT\\R^[IS^`NvaWk^@o\u007FdEX|CBcbSRr",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PN{mpUn`Wz\u007F~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PN{]pUn`W{_~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PNz}pUn`W{o~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PNy}pUn`W{w~PUcpLJNIMKH",
      "dazLbBaLCpJTjmVjd@zXFEGDgfrTwhCmhVzw`K\u007FcpLJNIMKH",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdCn{\\EkhE~o~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdCnw\\EkhE~w~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdCno\\EkhE~{~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdCn_\\EkhE~}~O@phxdtl`",
      "dazL`BaLCpRjuZjPCi`XT\\R^[IS^`MvaWk^@w\u007FdEX|CBcbSRr",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PM{mpUn`[z\u007F~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PM{]pUn`[{_~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PMz}pUn`[{o~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PMy}pUn`[{w~PUcpLJNIMKH",
      "dazLbBaLCpJTjmVjd@zXFEGDgfrTwhC]hVzw`M\u007FcpLJNIMKH",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdC^{\\EkhF~o~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdC^w\\EkhF~w~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdC^o\\EkhF~{~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdC^_\\EkhF~}~O@phxdtl`",
      "dazL`BaLCpRjuZjPCi`XT\\R^[IS^`KvaWk^@{\u007FdEX|CBcbSRr",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PK{mpUn`]z\u007F~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PK{]pUn`]{_~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PKz}pUn`]{o~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PKy}pUn`]{w~PUcpLJNIMKH",
      "dazLbBaLCpJTjmVjd@zXFEGDgfrTwhB}hVzw`N\u007FcpLJNIMKH",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdB~{\\EkhG^o~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdB~w\\EkhG^w~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdB~o\\EkhG^{~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdB~_\\EkhG^}~O@phxdtl`",
      "dazL`BaLCpRjuZjPCi`XT\\R^[IS^`GvaWk^@}\u007FdEX|CBcbSRr",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PG{mpUn`^z\u007F~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PG{]pUn`^{_~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PGz}pUn`^{o~PUcpLJNIMKH",
      "dazLPBaLCp{pRjuZjPCi`XT\\R^[IS^PGy}pUn`^{w~PUcpLJNIMKH",
      "dazLbBaLCpJTjmVjd@zXFEGDgfrTwhA}hVzw`O_cpLJNIMKH",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdA~{\\EkhGno~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdA~w\\EkhGnw~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdA~o\\EkhGn{~O@phxdtl`",
      "dazLRBaLCp{pJTjmVjd@zXFEGDgfrTwdA~_\\EkhGn}~O@phxdtl`",
      "gNyhcEaxB]rURuU@]DLTylj\u007FP]nEw`o\u007FdMbpqSdmP",
      "gGXhmDO@RnRiZj@zpXilc_P]nYw`o\u007FducPqSdh",
      "gNyhcEaxB]rURuU@]DLTylj\u007FP[nEw`w\u007FdMbpqSdmP",
      "gGXhmDO@RnRiZj@zpXilc_P[nYw`w\u007FducPqSdh",
      "gNyhcEaxB]rURuU@]DLTylj\u007FPWnEw`{\u007FdMbpqSdmP",
      "gGXhmDO@RnRiZj@zpXilc_PWnYw`{\u007FducPqSdh",
      "gNyhcEaxB]rURuU@]DLTylj\u007FPOnEw`}\u007FdMbpqSdmP",
      "gGXhmDO@RnRiZj@zpXilc_POnYw`}\u007FducPqSdh",
      "gNyicEaxB]qeJiZj`NbFJ\\vU_hNwC[pW\u007FEabgIZ`",
      "gGXimDO@RntiTmU@]XLTvQohNwM[pW\u007FFabgIP",
      "gNyicEaxB]qeJiZj`NbFJ\\vU_hMwC[p[\u007FEabgIZ`",
      "gGXimDO@RntiTmU@]XLTvQohMwM[p[\u007FFabgIP",
      "gNyicEaxB]qeJiZj`NbFJ\\vU_hKwC[p]\u007FEabgIZ`",
      "gGXimDO@RntiTmU@]XLTvQohKwM[p]\u007FFabgIP",
      "gNyicEaxB]qeJiZj`NbFJ\\vU_hGwC[p^\u007FEabgIZ`",
      "gGXimDO@RntiTmU@]XLTvQohGwM[p^\u007FFabgIP",
      "dazLaBaLCpB\\yJi^ji@NfAaQqIyleMz@{ZE^mxB\u007F~PUcpLJNIMKH",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@yNwDVzA]K\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@uNwDVzAmK\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@mNwDVzAuK\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@]NwDVzAyK\u007FyDVO@phxdtl`",
      "dazLcBaLCpB\\xiRjWjjPCi`XT\\R^[IS^`Nva[k^@o~O@phxdtl`",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PNSmqFn`WR\u007Fx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PMSmqFn`[R\u007Fx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PKSmqFn`]R\u007Fx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PGSmqFn`^R\u007Fx|CBcbSRr",
      "gNxhmDO@RnRiVjdCjabgK[HwtG[VkmxK\u007FyMXlLTyKT",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dNW[dmtKj\u007F~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dMW[dmtMj\u007F~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dKW[dmtNj\u007F~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dGW[dmtOJ\u007F~RVKCENRu@",
      "gNximDO@RntiTkURAuPqSemd[zCmkYv|E\u007FqXXirVh",
      "gNxeibOA^DeR^RVUjhCjabgI[JorGKmrZzEu_|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorFkmrZzFu_|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorEkmrZzGU_|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorCkmrZzGe_|VFJ\\ej",
      "dazLaBaLCpB\\yJi^ji@NfAaQqIyleMz@wZE^mxC_~PUcpLJNIMKH",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@yMwDVzA]M\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@uMwDVzAmM\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@mMwDVzAuM\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@]MwDVzAyM\u007FyDVO@phxdtl`",
      "dazLcBaLCpB\\xiRjWjjPCi`XT\\R^[IS^`Mva[k^@w~O@phxdtl`",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PNS]qFn`WS_x|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PMS]qFn`[S_x|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PKS]qFn`]S_x|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PGS]qFn`^S_x|CBcbSRr",
      "gNxhmDO@RnRiVjdCjabgK[HwtF{VkmxM\u007FyMXlLTyKT",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dNV{dmtKk_~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dMV{dmtMk_~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dKV{dmtNk_~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dGV{dmtOK_~RVKCENRu@",
      "gNximDO@RntiTkURAuPqSemd[zC]kYv|F\u007FqXXirVh",
      "gNxeibOA^DeR^RVUjhCjabgI[JorGK]rZzEuo|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorFk]rZzFuo|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorEk]rZzGUo|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorCk]rZzGeo|VFJ\\ej",
      "dazLaBaLCpB\\yJi^ji@NfAaQqIyleMz@oZE^mxCo~PUcpLJNIMKH",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@yKwDVzA]N\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@uKwDVzAmN\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@mKwDVzAuN\u007FyDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@]KwDVzAyN\u007FyDVO@phxdtl`",
      "dazLcBaLCpB\\xiRjWjjPCi`XT\\R^[IS^`Kva[k^@{~O@phxdtl`",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PNR}qFn`WSox|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PMR}qFn`[Sox|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PKR}qFn`]Sox|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PGR}qFn`^Sox|CBcbSRr",
      "gNxhmDO@RnRiVjdCjabgK[HwtE{VkmxN\u007FyMXlLTyKT",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dNU{dmtKko~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dMU{dmtMko~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dKU{dmtNko~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dGU{dmtOKo~RVKCENRu@",
      "gNximDO@RntiTkURAuPqSemd[zB}kYv|G_qXXirVh",
      "gNxeibOA^DeR^RVUjhCjabgI[JorGJ}rZzEuw|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorFj}rZzFuw|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorEj}rZzGUw|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorCj}rZzGew|VFJ\\ej",
      "dazLaBaLCpB\\yJi^ji@NfAaQqIyleMz@_ZE^mxCw~PUcpLJNIMKH",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@yGwDVzA]O_yDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@uGwDVzAmO_yDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@mGwDVzAuO_yDVO@phxdtl`",
      "dazLQHpjCpSpRZyIZUjj@NfAaQqIilc]y@]GwDVzAyO_yDVO@phxdtl`",
      "dazLcBaLCpB\\xiRjWjjPCi`XT\\R^[IS^`Gva[k^@}~O@phxdtl`",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PNQ}qFn`WSwx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PMQ}qFn`[Swx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PKQ}qFn`]Swx|CBcbSRr",
      "dazLSHpjCpSpbTfnRVeZj`Ci`XT\\RZ[Hw^PGQ}qFn`^Swx|CBcbSRr",
      "gNxhmDO@RnRiVjdCjabgK[HwtC{VkmxO_yMXlLTyKT",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dNS{dmtKkw~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dMS{dmtMkw~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dKS{dmtNkw~RVKCENRu@",
      "gNxdibOA^Bd|dlkUPGUCENRvU_dGS{dmtOKw~RVKCENRu@",
      "gNximDO@RntiTkURAuPqSemd[zA}kYv|GoqXXirVh",
      "gNxeibOA^DeR^RVUjhCjabgI[JorGI}rZzEu{|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorFi}rZzFu{|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorEi}rZzGU{|VFJ\\ej",
      "gNxeibOA^DeR^RVUjhCjabgI[JorCi}rZzGe{|VFJ\\ej",
    },
    { // 410 phosphonium, 5 fragments
      "fHw`dCj_WWg`",
      "fHw`dCj_WWk`",
      "fHw`dCj_Vwm`",
      "fHw`dCj_Uwn`",
      "fHw`dCj_Swo@",
    },
    { // 411 phosphine, 3 fragments
      "eMJH|HzCiF_QlZ{`DI@HbLRlkGKq_\u007FHlTY{P",
      "eMJH|HzCiF_Q\\Z{`DI@HbLRlkGKqo\u007FHlTY{P",
      "eMJH|HzCiF_P|Z{`DI@HbLRlkGKqw\u007FHlTY{P",
    },
    {"gJQHHOBOZ`NdFOhGoA{|RFJ\\`"}, // 412 phosphine oxide
    { // 413 phosphonate, 3 fragments
      "gJQhHlOBOZ`NbFJ\\~`_^eSsoA{\u007FMJkkDabgH",
      "gJQiHlOC]GmPGQCEN_POoRiyw`}\u007FbeUbPqSd",
      "gJQhhlOA]ncvhChabgOhGwiT|{p^\u007FrRqHXir",
    },
    {"gNqhHlOAJkVj`NbFJ\\~`_ZSsoA{\u007FDkkEabgIZ`"}, // 414 phosphonate diester
    { // 415 phosphinate, 2 fragments
      "gJPhHaxQ{TAu`qSzA}jUN|Go|TjlRFJ\\`",
      "gJPiHaxKh}j@zpXi}@~uJg^Cw~RVICENP",
    },
    {"eFBJ`cA\u007FFD"}, // 416 organoboron
    {"gC`h@iPIMTAu`qSyBu^|GFg\u007FfEeUc`qR"}, // 417 boronic acid
    {"eFBApcAuC~LH"}, // 418 organosilicon
    {"eMJH\\Df`zQg]O\u007FJlTY@"}, // 419 silyl ether
    {"gC`H@xQz`NbFJ\\~ty]n\u007FGAbd"}, // 420 trimethylsilyl
    { // 421 metal, 5 fragments
      "fHf@AuL[|@`tCBprBcxiFRLSNp\\b`",
      "fHbTAuL[zahzAbXVM`xnGcdEIQJr`",
      "fHbhAuL[uSTMKQt}@pRdeKRLkIr|`",
      "fH`TAuL[yq\\wCq|\u007F@JBPlHbhfKbB`",
      "fHbtAuLYEhz@",
    },
    { // 422 transition metal, 2 fragments
      "fHePAuL[zahzAbXVM`xnGcdEIQTu@",
      "fHahAuLYsRt]OPLDiIRtcJr\\oHJ@",
    },
    {"fHf@AuLZlCPrJSl@"}, // 423 alkali metal
    { // 424 organometallic, 2 fragments
      "eFBC@cAuCFOpM@plLahzAbXVM`xnG`TkGOqa@",
      "eFBATcAuCFOUCRt]OPLSEKRLkIr|`iJkGOqa@",
    },
    {"fHa@AuLZb@pJFP\\@"}, // 425 alkaline earth metal
    {"eFBALcAuCVN_cB"}, // 426 organotin
    {"fHd`AuLXiBHqJp"}, // 427 contains halogen
    {"fJ@GuDYN@P@"}, // 428 hydrogen bond donor
    { // 429 indolizidine, 32 fragments
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNpNIq~J`phxdtl|br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNpNIq~J`phxduL|br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNpNIu~J`phxdtl|bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNpNIu~J`phxduL|bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNtNIq~J`phxdtl}Br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNtNIq~J`phxduL}Br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNtNIu~J`phxdtl}Bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNtNIu~J`phxduL}Bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNpNiq~J`phxdtl|cR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNpNiq~J`phxduL|cR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNpNiu~J`phxdtl|cS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNpNiu~J`phxduL|cS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNtNiq~J`phxdtl}CR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNtNiq~J`phxduL}CR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvNtNiu~J`phxdtl}CS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvNtNiu~J`phxduL}CS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvnpNIq~J`phxdtm\\br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvnpNIq~J`phxduM\\br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvnpNIu~J`phxdtm\\bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvnpNIu~J`phxduM\\bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvntNIq~J`phxdtm]Br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvntNIq~J`phxduM]Br`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvntNIu~J`phxdtm]Bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvntNIu~J`phxduM]Bs@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvnpNiq~J`phxdtm\\cR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvnpNiq~J`phxduM\\cR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvnpNiu~J`phxdtm\\cS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvnpNiu~J`phxduM\\cS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvntNiq~J`phxdtm]CR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvntNiq~J`phxduM]CR`",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJpvntNiu~J`phxdtm]CS@",
      "diV@@@RieZyajjj`Ci@XZjFHpfLpVJtvntNiu~J`phxduM]CS@",
    },
    { // 430 quinolizidine, 36 fragments
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@xgBx\u007FGPXT\\RZV^QYUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@xgBx\u007FGPXT\\RZVnQYUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@xgBz\u007FGPXT\\RZV^QYU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@xgBz\u007FGPXT\\RZVnQYU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@zgBx\u007FGPXT\\RZV^QiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@zgBx\u007FGPXT\\RZVnQiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@zgBz\u007FGPXT\\RZV^QiU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@zgBz\u007FGPXT\\RZVnQiU`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{@zgBx\u007FGPXT\\RZVnQiUP",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCX{@zgBz\u007FGPXT\\RZV^QiU`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{@zgBz\u007FGPXT\\RZVnQiU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{PzgBx\u007FGPXT\\RZV^aiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{PzgBx\u007FGPXT\\RZVnaiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{PzgBz\u007FGPXT\\RZV^aiU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{PzgBz\u007FGPXT\\RZVnaiU`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{@xgRx\u007FGPXT\\RZVnQYeP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@xgRz\u007FGPXT\\RZV^QYe`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@xgRz\u007FGPXT\\RZVnQYe`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@zgRx\u007FGPXT\\RZVnQieP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{@zgRz\u007FGPXT\\RZV^Qie`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{@zgRz\u007FGPXT\\RZVnQie`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{@zgRx\u007FGPXT\\RZVnQieP",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{@zgRz\u007FGPXT\\RZVnQie`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkCZ{PzgRx\u007FGPXT\\RZVnaieP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCX{PzgRz\u007FGPXT\\RZV^aie`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkCZ{PzgRz\u007FGPXT\\RZVnaie`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@xgBx\u007FGPXT\\RZfnQYUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@xgBz\u007FGPXT\\RZfnQYU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@zgBx\u007FGPXT\\RZfnQiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@zgBz\u007FGPXT\\RZfnQiU`",
      "dev@@@RieUixZjjj@NdAakhXcBXsAXkSZ{@zgBz\u007FGPXT\\RZfnQiU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{PzgBx\u007FGPXT\\RZfnaiUP",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{PzgBz\u007FGPXT\\RZfnaiU`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@xgRz\u007FGPXT\\RZfnQYe`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{@zgRz\u007FGPXT\\RZfnQie`",
      "dev@@@RieUazZjjj@NdAakhXcBXsAXkSZ{PzgRz\u007FGPXT\\RZfnaie`",
    },
    { // 431 morphinan, 64 fragments
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBlZt[UlNu{T]IqgWxn@pTNDcQX|QLeSYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJqkQmVp{WmQtgF]_bxCAPxRMEcrDrUMdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBmZt[UlNu{T]IqgWxn@pTNDcQX|QLeUYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJukQmVp{WmQtgF]_bxCAPxRMEcrDrUUdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBlZt[UlNu{T]IugWxn@pTNDcQX|QLeSYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJqkQmVp{WmQtgV]_bxCAPxRMEcrDrUMdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBmZt[UlNu{T]IugWxn@pTNDcQX|QLeUYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJukQmVp{WmQtgV]_bxCAPxRMEcrDrUUdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBlZt[UmNu{T]IqgWxn@pTNDcQX|QLeSZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJqkQmVt{WmQtgF]_bxCAPxRMEcrDrUMhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBmZt[UmNu{T]IqgWxn@pTNDcQX|QLeUZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJukQmVt{WmQtgF]_bxCAPxRMEcrDrUUhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBlZt[UmNu{T]IugWxn@pTNDcQX|QLeSZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJqkQmVt{WmQtgV]_bxCAPxRMEcrDrUMhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSBmZt[UmNu{T]IugWxn@pTNDcQX|QLeUZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSGMJukQmVt{WmQtgV]_bxCAPxRMEcrDrUUhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRlZt[UlNu{T]IqgWxn@pTNDeQX|QLeSYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJqkQmVp{WmQtgF]_bxCAPxRUEcrDrUMdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRmZt[UlNu{T]IqgWxn@pTNDeQX|QLeUYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJukQmVp{WmQtgF]_bxCAPxRUEcrDrUUdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRlZt[UlNu{T]IugWxn@pTNDeQX|QLeSYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJqkQmVp{WmQtgV]_bxCAPxRUEcrDrUMdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRmZt[UlNu{T]IugWxn@pTNDeQX|QLeUYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJukQmVp{WmQtgV]_bxCAPxRUEcrDrUUdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRlZt[UmNu{T]IqgWxn@pTNDeQX|QLeSZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJqkQmVt{WmQtgF]_bxCAPxRUEcrDrUMhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRmZt[UmNu{T]IqgWxn@pTNDeQX|QLeUZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJukQmVt{WmQtgF]_bxCAPxRUEcrDrUUhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRlZt[UmNu{T]IugWxn@pTNDeQX|QLeSZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJqkQmVt{WmQtgV]_bxCAPxRUEcrDrUMhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PpSRmZt[UmNu{T]IugWxn@pTNDeQX|QLeUZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPpSWMJukQmVt{WmQtgV]_bxCAPxRUEcrDrUUhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBlZt[UlNu{T]IqgWxn@pdNDcQX|QLeSYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJqkQmVp{WmQtgF]_bxCBPxRMEcrDrUMdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBmZt[UlNu{T]IqgWxn@pdNDcQX|QLeUYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJukQmVp{WmQtgF]_bxCBPxRMEcrDrUUdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBlZt[UlNu{T]IugWxn@pdNDcQX|QLeSYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJqkQmVp{WmQtgV]_bxCBPxRMEcrDrUMdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBmZt[UlNu{T]IugWxn@pdNDcQX|QLeUYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJukQmVp{WmQtgV]_bxCBPxRMEcrDrUUdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBlZt[UmNu{T]IqgWxn@pdNDcQX|QLeSZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJqkQmVt{WmQtgF]_bxCBPxRMEcrDrUMhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBmZt[UmNu{T]IqgWxn@pdNDcQX|QLeUZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJukQmVt{WmQtgF]_bxCBPxRMEcrDrUUhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBlZt[UmNu{T]IugWxn@pdNDcQX|QLeSZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJqkQmVt{WmQtgV]_bxCBPxRMEcrDrUMhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSBmZt[UmNu{T]IugWxn@pdNDcQX|QLeUZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSGMJukQmVt{WmQtgV]_bxCBPxRMEcrDrUUhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRlZt[UlNu{T]IqgWxn@pdNDeQX|QLeSYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJqkQmVp{WmQtgF]_bxCBPxRUEcrDrUMdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRmZt[UlNu{T]IqgWxn@pdNDeQX|QLeUYBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJukQmVp{WmQtgF]_bxCBPxRUEcrDrUUdJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRlZt[UlNu{T]IugWxn@pdNDeQX|QLeSYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJqkQmVp{WmQtgV]_bxCBPxRUEcrDrUMdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRmZt[UlNu{T]IugWxn@pdNDeQX|QLeUYBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJukQmVp{WmQtgV]_bxCBPxRUEcrDrUUdJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRlZt[UmNu{T]IqgWxn@pdNDeQX|QLeSZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJqkQmVt{WmQtgF]_bxCBPxRUEcrDrUMhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRmZt[UmNu{T]IqgWxn@pdNDeQX|QLeUZBiP",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJukQmVt{WmQtgF]_bxCBPxRUEcrDrUUhJe@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRlZt[UmNu{T]IugWxn@pdNDeQX|QLeSZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJqkQmVt{WmQtgV]_bxCBPxRUEcrDrUMhJf@",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`u]PtSRmZt[UmNu{T]IugWxn@pdNDeQX|QLeUZBi`",
      "fhe`@@@ISKOJntXJVg^CUUUUUUP@]R`xVHjTZm^`uSPtSWMJukQmVt{WmQtgV]_bxCBPxRUEcrDrUUhJf@",
    },
    { // 432 ergoline, 4 fragments
      "f`yP@@@NRfV^uVgARLzwjjjjjjh@Nk@XNDbrEReVhuZ]^jqAbFDXq`fFXEjVeZuhvkZ]kv@zciNoqdA`h\\IFbqx~P",
      "f`yP@@@NRfV^uVgARLzwjjjjjjh@Nk@XNDbrEReVhuZ]^jqAbFDXq`fFXEjVeZuhvkZ]kv`zciNoqdA`h\\IFbqx~`",
      "f`yP@@@NRfV^uVgARLzwjjjjjjh@Nk@XNDbrEReVhuZ]^jqAbFDXq`ffXEjVeZuhvkZ]kv@zciNoqdA`h\\IJbqx~P",
      "f`yP@@@NRfV^uVgARLzwjjjjjjh@Nk@XNDbrEReVhuZ]^jqAbFDXq`ffXEjVeZuhvkZ]kv`zciNoqdA`h\\IJbqx~`",
    },
    {"fhe`@@@ISKOJntxJVg^CUUUUUUP@]^@h\\UEerEReVhuZ]^`uPh}cuMLuspoRtkVmFu[Sm^uGR]Yu~I@LDbE@"}, // 433 aporphine
    {"dknD@B@|bbaTRVWVjjjh@zLFEDfekhZY[XvtYyDnmcFPpUYm]h]Si]Gk|[AaQqIiZzFfVuN{A`"}, // 434 phenylalanine residue
    { // 435 alpha-amino acid, 6 fragments
      "devB@JCNgIEDdbUTruKM@GR`phxdtl|br~cKvTWFSi\u007FxfVkGPXT\\RZV^QYU^tc\\L`",
      "devBBJCNgNrQQIHeULmRsPAthLJNIMKOHlnrbxr]O\u007FHjqtFEGDfegdVUWmHwCH",
      "devBBJCNfirQQIHeULmRsPAthLJNIMKOHlohr}eEqdzo~QechLJNIMKOHljoZQnFP",
      "devBAJCNgNj\\dTRRIUSKTlt@]JCBcbSRsrKKlhnLgU\u007FGPXT\\RZV^QYU^tc\\L`",
      "gJXaBDYR[Z`NjFJ\\e}E^sJgfW\u007FdUbPqSd",
      "gJX`bDnLiMmPGUCENR{Lj^Y_xdLTy@",
    },
    {"diFH@BCHhhUFjj@NaAaQIiYyEmF^iKkVonGhqdLGxbCBcbSRsr"}, // 436 leucine residue
    {"dazH@BCHhhXuU@GW@phdtl|vcODeu[]wQcHXOqxFEGDfed"}, // 437 valine residue
    {"gGY@BDfYj`NjFJRumMyJ{tYhXOqhXirT"}, // 438 alanine residue
    {"dknD@B@|bbaTRVWVjjjh@zLFEDfekhZY[XvtYyDnmcFPpUYm]h]Si]Gk|[AaQqIiZzFfVuN@"}, // 439 tyrosine residue
    {"daFH@BAIfunZjh@zxFEDfegftYxdnm[^vLYCA~H`phxdtl|`"}, // 440 proline residue
    {"dcth@BE]CHhhTdhuUUPAuhLJIMKOHljnmhsuI]Zv}loFLa`k`|gb|wDw|]AaQqIiYyEeU@"}, // 441 arginine residue
    {"gNx`BGdTTKUPGSCEIZmmMyJ{lYhXOqXXirVh"}, // 442 serine residue
    { // 443 lysine residue, 2 fragments
      "deeH@BdLbbaRSUUPAuHLJIMKOHluhsuI]Zv}h{FLa`\u007FFPXT\\RZV^QP",
      "fdip`@DT\\@NQQJIJJiSPTfjijjf`@zbA`h\\IFbqxbYJgRYln_HVtH~UbrZr~ZJyZkmZ[[WFDXXOqRA`h\\IFbqxbYJgRYln_HVKtPHXhpTe@",
    },
    {"gNyHMPDIK]ULAtpqSdm[Q~TuWFNFC|VFJ\\ej"}, // 444 cysteine residue
    {"foAQ@@BZAdTTJbbRtmV\\uUUUU@AtxCAPdZKKdJeJmQjtzmCGdHnfqabFBjfZyhViZUkVcZmivoZ\u007FDHFBapdZKKdJeJmQjtz}@"}, // 445 tryptophan residue
    {"deeD@DXAR[VyjjX@zdFEGDfegdVtS{LtmjxqLLGxrCBcbSRsrJ"}, // 446 glutamine residue
    {"dazD@BAlbbacUT@]\\CBbSRssZL}bWU}tXrFC|^AaQqIiY@"}, // 447 threonine residue
    {"diFH@BCHhhXfjj@NaAaQIiYyEmF^iKjvwnGhqdLGxbCBcbSRsr"}, // 448 isoleucine residue
    {"defL@FAAR[VyjjX@zdFEGDfegdVtS{LtmjxqLLGxrCBcbSRsrJ"}, // 449 glutamic acid residue
    {"diFL@JANR[[fjf@NaAaQqIiYym@~SMJxpLLGxbCBcbSRsr"}, // 450 aspartic acid residue
    {"diED@DhNR[[fjf@NaAaQqIiYym@~SMJxpLLGxbCBcbSRsr"}, // 451 asparagine residue
    {"dmwH@ByPrJJEQJUZjjh@zTFEDfekhZYZtYxdnmFynLYCAVfuvauNeu~N`phxdtm]CSK@"}, // 452 histidine residue
    {"diFH`Jx@aJ]njjX@zDFEGDfegftCxhuNsRnLCCA~H`phxdtl|`"}, // 453 methionine residue
    {"difD@B@Tf[]nZjj@NaAaQIiYyEmF^IKkVwkcFPp_cHLJNIMKOHh"}, // 454 4-hydroxyproline residue
    {"deTJ@@qaeJYyzzjjj@LfBHaHJJchthLJNIMKOHlnuApt^LgSY|q\\o\u007FJByVhv[EPXT\\RZV^QYP"}, // 455 pyranose
    { // 456 pyranoside, 7 fragments
      "deTB@@XYRfV~njjj`CjPXT\\ZV^QY[PWjbtwKj~nLECA~J`phxdtl|br`",
      "dcLJ@@zUwIEEEDcPuUUU@GV`phxdt|brjzvaoMEi^VVuXwFFa`\u007FDpXT\\RZV^QYU]P",
      "dmLJ@@siWIEEMD\\Zajjjj@NmAaQqIiYyEeU|tVee]Vvc_xfCBcbSRsrKJkj",
      "dmLB@@zURigoSFFjjjh@zTFEGDegdVUVtUyhmKsRmkFxqTLGxfCBcbSRsrKJkj",
      "dmLB@@zUrQQQSFaZZjjj`CiPXT\\ZV^QYU[PWfbtoKjvt[cAPp_bXLJNIMKOHljnh",
      "dmLB@@zURfYmhQVjjjh@zTFEGFegdVUVtEyhmKrzmmFxpTLGxfCBcbSRsrKJkj",
      "dmLB@@zUrQQQQVajZjjj`CiPXT\\RZ^QYU[PwfbtoKKZl[cCPp_bXLJNIMKOHljnh",
    },
    {"daDL@@[dig\\jjj`CJ`bHRLbhtHLJNIMKONqApt^LgSY|\u007F|pJuzqDFEGDfegd"}, // 457 furanose
    { // 458 furanoside, 6 fragments
      "deTB@@xYRfYWJjjj`CjPXT\\RZ^QY[PwjbtoKKZnLMCA~J`phxdtl|br`",
      "dcLJ@@xUwIEEDhkeUUUU@GV`phxdt|brjzvaoMEi^VUu\\{FFa`\u007FDpXT\\RZV^QYU]P",
      "dmLJ@@siWIEDeDZYajjjj@NmAaQqIiYyEeU|tVfe]Vuc_xfCBcbSRsrKJkj",
      "dmLB@@FURif}sbZjjjh@zTFEGDegdVUVtUyhmKsRmkzxqTLGxfCBcbSRsrKJkj",
      "dmLB@@xURfYYrnfjjjh@zTFEGDfgdVUVtMyhmKrrnkgXptLGxfCBcbSRsrKJkj",
      "dmLB@@XURfVYknFjjjh@zTFEGDfegdUVtSyhmMrrnkzxqLLGxfCBcbSRsrKJkj",
    },
    {"dcLF@@IaWTfYn\u007Fijjjj@NcAaQqIiYyEeUu|tVey]Wus_xfCBcbSRsrKJkj"}, // 459 inositol
    {"dcLJ@@zUwIEEEDcPuUUU@GV`phxdt|brjz~ZKR|lmjqo|SAaQqIiYyEeUu@"}, // 460 C-glycoside
    {"f`iA@@@ISLrj\u007FRVgV}UUUUUT@GSLWHTZm^jqAzGl^IzgfZyhWi^U{VcZmyvo^CzNoq`a@"}, // 461 flavonoid skeleton
    {"fhy@`@@\\RYYeywiqUoAZZjjjj`@zlAqTfPjTjuFkSktFjXfjZEjVeZuhvkZ]kvhzSk|^@XJGBqxaP"}, // 462 flavone
    {"fle@P@@\\\\eIfVWyWyZCEhFB@`H@PiP"}, // 463 chalcone
    {"fj}@p@@DEiI\\bbbfbTtQRQXHwhyZdJH@BJ@@H"}, // 464 flavonol
    {"fhy@`@@JRYfYU_XhwgAZd@`@H@@`"}, // 465 isoflavone
    {"fbmAP@@\\e{NQQQJJKFIKYgEFbehJH`HB`@CzCH@"}, // 466 flavanone
    {"fbmAP@@Fm{NRJJJIQJYIy`iNbf`h`JHB`@CyBHY@"}, // 467 flavan-3-ol
    {"gGQ`@ZdruTAtpqSdm_ZVmv\u007FcPqSdh"}, // 468 glycerol unit
    { // 469 phosphatidyl, 16 fragments
      "f`~@J@HHpSbmNAxYIIbhdhcFjjii`@z\\A`h\\IFbqxbYJgSY\\~HCjZrq[^@K\u007FcxCAPxRMEcqDrUNdsY\\`",
      "f`~@J@HHpSbmNAxYIIbhdhcFjjii`@z\\A`h\\IFbqxbYJgSY\\~HCZZrq[^@M\u007FcxCAPxRMEcqDrUNdsY\\`",
      "f`~@J@HHpSbmNAxYIIbhdhcFjjii`@z\\A`h\\IFbqxbYJgSY\\~HBzZrq[^@N\u007FcxCAPxRMEcqDrUNdsY\\`",
      "f`~@J@HHpSbmNAxYIIbhdhcFjjii`@z\\A`h\\IFbqxbYJgSY\\~HAzZrq[^@O_cxCAPxRMEcqDrUNdsY\\`",
      "f`~@JBHHpSbmNAx@dgYIHjhdhcJjjii`@z\\A`h\\IFbqxbYJgSY\\~HCjZrq[^@K\u007FcxCAPxRMEcqDrUNdsY\\`",
      "do\\NaHSFe[CpB\\{IHbhdhcJjjff@NkAaQqIiYyEeUMm|P\\Vu_[^@o~K`phxdtl|brjzfv`",
      "do\\NaHSFe[CpBX{IHbhdhcJjjff@NkAaQqIiYyEeUMm|P\\Vu_[^@o~K`phxdtl|brjzfv`",
      "f`~@JBHHpSbmNAx@dgYIHjhdhcJjjii`@z\\A`h\\IFbqxbYJgSY\\~HCZZrq[^@M\u007FcxCAPxRMEcqDrUNdsY\\`",
      "do\\NaHSFe[CpB\\{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PZVu_[^@w~K`phxdtl|brjzfv`",
      "do\\NaHSFe[CpBX{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PZVu_[^@w~K`phxdtl|brjzfv`",
      "f`~@JBHHpSbmNAx@dgYIHjhdhcJjjii`@z\\A`h\\IFbqxbYJgSY\\~HBzZrq[^@N\u007FcxCAPxRMEcqDrUNdsY\\`",
      "do\\NaHSFe[CpB\\{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PVVu_[^@{~K`phxdtl|brjzfv`",
      "do\\NaHSFe[CpBX{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PVVu_[^@{~K`phxdtl|brjzfv`",
      "f`~@JBHHpSbmNAx@dgYIHjhdhcJjjii`@z\\A`h\\IFbqxbYJgSY\\~HAzZrq[^@O_cxCAPxRMEcqDrUNdsY\\`",
      "do\\NaHSFe[CpB\\{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PNVu_[^@}~K`phxdtl|brjzfv`",
      "do\\NaHSFe[CpBX{IHbhdhcJjjff@NkAaQqIiYyEeUMm|PNVu_[^@}~K`phxdtl|brjzfv`",
    },
    { // 470 fatty acid, 2 fragments
      "daxD@@QImUjj@Ljqr^gY~_P`phxdtl|~YKsRvm[^wZQT_~PecpLJNIMKH",
      "daxDB@QNR[UZj`CJl\\giv_gtHLJNIMKOOjsRvm[^wZQT_x|CBcbSRr",
    },
    {"gNyALMJRmUU@]\\LTyKUokMVgks{|VFJ\\ej"}, // 471 choline
    {"fdqA@@@ILzjjjkUUUUU@AuDCAPdZKGbIdj]Ifry|aXmhX}yFdvflwfbvVjwVfvvnwvavO_cDCAPxRMEcqDrUNdsY\\~Ph"}, // 472 palmitoyl
    {"fbyA@@@ILzjjjjmUUUUUP@]Y@pTIFbqxbYJgRYln_HVJervactTZSZZs^ZKYZk]Z[[Z{_ZGXzg\\}~NPLECaHtVODSITzSMesyBqTh"}, // 473 stearoyl
    {"fbyA@@@ILzjjjjmUUSUUPHJnl`XJDcQX|QLeSiLvWOdKERy[PqzJMImMYoMElmU^kMmm]omCl]Sn^\u007FGHFBapdZKGbIdj]Ifry|aXjT"}, // 474 oleoyl
    {"do\\F@@Savtf^UVYjjjY`ChpXTRZV^QYU][_XUuk[~K`phxdtl|brjzfv`"}, // 475 triglyceride
    {"fje``@J@DdrsnjjjuMUUUUTBFKjhFBapdZKGbIdj]Ifry|aXjWJU|fEhoEdmf|vVjwVfvvnwvavNiwNe{|R`XJGBQhl^HfRitf[KgrEbi\\h"}, // 476 sphingosine
    {"daED@DpFRYVkfjY@NdAY\u007FDPXT\\RZV^P"}, // 477 uracil
    {"dev`@@rfeJY{ZxYjjjh@zTJIKDjikhZZjajMYhmUim]h]Si]_cBH"}, // 478 adenine
    {"dieD@DpFrJIJFnZii@NlAYE}@}~L`phxdtl|b`"}, // 479 thymine
    {"dmLd@DpYAdfUgZzUZijj@NnAjYzFfVkWZGTzWVz\u007FDpXT\\RZV^aiem`"}, // 480 xanthine
    { // 481 cytosine, 2 fragments
      "daGH@Dq`RYVkffi@NhA\u007FDPXT\\RZV^P",
      "daGH@Ds`RYUiffi@NhA\u007FDPXT\\RZV^P",
    },
    { // 482 guanine, 2 fragments
      "dmNh@DkaTDfVYVzUZjZj@NfArjZfVkQZkPzgVz\u007FDpXT\\Rjf^Qie]`",
      "dmNh@DkaTDfVYVzUZZjj@NfArjZfVkQZkPzgVz\u007FDpXT\\Rjf^Qie]`",
    },
    {"fdei`@LZlFHIJrQQQSIQEYDhZw`uUUPHEP@D"}, // 483 deoxyadenosine
    {"f`qQP@DX@ISoILrl{jsfcMUMMUT@D"}, // 484 deoxyuridine
    {"fhiQP@DX@IW`yEEDeDdbdsakMUMMUU@A@"}, // 485 thymidine
    {"f`qpP@DXxBSoYEDhihTdjBtYijjji`@`"}, // 486 deoxycytidine
    {"dg|@@DjU_eZx{BAH@@BJh"}, // 487 stilbene
    {"fhe@@@LdbbbTReryHQmN|Fjjjjjj`@uJCtOH}cqOT|swOB}KroZ|[uoN}{p_Q|gv_@"}, // 488 steroid
    {"flm@@@LddTTVbvebyjUcNBfjjjjjjj@C{DHiBh@"}, // 489 androstane
    {"fjc@@@LddTTVbvebQyjUcNBfjjjjjjjh@OlPbdJ`"}, // 490 pregnane
    {"fa{@@@LddTTVbvebQbwMRlYpTuUUUUUUUU@A}bDTaT@"}, // 491 cholane
    {"fmo@@@LddTTVbvebQbrTyjUcNBfjjjjjjjjjh@H"}, // 492 cholesterol core
    {"fmo@@@LddTTVbvebQbrTyjUcNBfjjjjjjjjjh@OlPbdJ`"}, // 493 cholestane
    {"gdKD@@@@BbHbHaHbHaHaHZHRFRDRLbDQBIDbHaHPXabbHaHSHabQGARILZOCWh]njjjjjjjjjjjjjjjjjjjjjjj`@CUb@}@|`}`|P}P|p}p|H}H|h}h|X}X|x}x|D}D|d}d|T}T|t}t|L}L|l}l|\\}\\||}||B}B|b}b|R}R|r}r|J}J|j}j|Z}Z|z}z|F}F|f}f|V}V|v}v|N}N|n}n|^}^|~}~|A}A|a}a|Q}Q}\u007FiHaPX\\EF`qXR]AbsYBQXbUIdJeJmUitfKUfwZ\\n__`LD"}, // 494 oleanane
    { // 495 geranyl, 2 fragments
      "ded@@LdbQRcUSPPEthLJNIMKOHloabtwNHjukGi{|YAaQqIiYyE@",
      "do\\@@LdbQRbrTZjZihHZz|FEGDfegdVUWTvuwvqZ[gUkVNsr{mws}~K`phxdtl|brjzfv}hHSB@",
    },
    {"fby@@@LdbVRRbbqRcUUKUTtC@HUJzJA`h\\IFbqxbYJgRYln_HVJer~}Bt[cb[SV[ruWkc[[oZFt}goqrA`h\\IFbqxbYJgRYln_HVJe@"}, // 496 geranylgeranyl
    { // 497 farnesyl, 2 fragments
      "do\\@@DjWUYejjej`PJ[kpXT\\RZV^QYU]S[W_GEin\\Vuk[uk^|_Wse~K`phxdtl|brjzfv`",
      "fby@@@LdbQRbrTVRcUSUMTtACKUtTCAPxRMEcqDrUNdsY\\~PlUKe}zEhwGTuebvWJwUvuw^tMi{O_cdCAPxRMEcqDrUNdsY\\~PlUKv`HHpP",
    },
    {"dmvD@LADf]eYUjjj`CiPXTRZfnaiehqb\\@aUjtvntNitnoqhFEGDd"}, // 498 Cbz
    {"dazD@LADf^fjh@zxFEDfeggvUs]wQcDxAC|^AaQqIiY@"}, // 499 Boc
    { // 500 methoxymethyl, 4 fragments
      "gCa@@eMPGVCEMioJZncMCA~NCEH",
      "gCa@@eMPGQCENoJZn\u007FGAbd",
      "gCa@@eMPGQCEN_JZnwMOqpXi@",
      "gCa@@eMPFTtZHXisySUwxxLT`",
    },
    {"dmvDAHAHeNR[e]xVjjj@NeAaQrJjZzFemB~b]jvZKUZ[WZWWxtCBbKJ"}, // 501 p-nitrobenzyl
    {"fbm@@@DjfYmUWsQ\\dNZjjjjjjh@Nl`XRKERY\\aTiUjMVgWhMFSYkPI{HG`zGp}KY_KE\\kU^kM]k]_kC\\[S^[jdfjZYkfaZeiVmZMjvgZ}hNhzSkNbzkk\\@O|V`XJGBRiLnPjTjuFkSktFcIlqZl"}, // 502 trityl
    {"gNpH@xITuUTAupqSdmV~j{\\^oOoqXXirVh"}, // 503 TBS
    {"dmtD`HP@cIICLeaeZjj`CiPXT\\jfnaie[PWhWjlVjtvntNeu~M@phxr`"}, // 504 tosyl
    {"gJX@@dksBJ\u007FbPqSd"}, // 505 alpha,beta-unsaturated nitrile
    {"gGP`@dfUjPNjFJ\\u}Kntgk\u007FdUcPqSdh"}, // 506 acrylate ester
    {"gJYHCaDIKTpG|RFJ\\`"}, // 507 alpha-chloroacetamide
    {"gJQHLHaIZf@\u007FbPqSd"}, // 508 alpha-chloroketone
    { // 509 acrylamide, 2 fragments
      "gJY@DDfvdCjabgI_P{mIz\u007FyEXdLTy@",
      "gJYADEJS[RAuPqSdoh]ve]_qHXir",
    },
    {"gNu@DpdwKTxG|VFJ\\ej"}, // 510 2-cyanoacrylamide
    {"gC`dE`DRPcr`_qpXi@"}, // 511 sulfonyl fluoride
  };
}
