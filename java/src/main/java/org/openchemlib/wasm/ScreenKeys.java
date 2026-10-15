package org.openchemlib.wasm;

/**
 * The 512 key fragments of the substructure screen, as idcodes: bit i of a screen is set when key i
 * is a substructure of the molecule (see {@link Screen}).
 *
 * <p>The list was chosen greedily on 1 M PubChem molecules and 5,200 training queries, then frozen.
 * Next to FragFp it removes 84% of FragFp's false candidates (98% for rare queries), and no true
 * match was rejected over 23 M true pairs and 170 M generated ones. Keys are elements, element
 * classes, atom lists, any-atoms and bond classes on small subgraphs, rings, disjoint
 * copies, atom counts, paths between atom pairs, and atom ring sizes.
 *
 * <p>Changing, adding or reordering a key changes every stored screen, so the list only ever changes
 * in a major release.
 */
final class ScreenKeys {
  private ScreenKeys() {}

  static final String[] IDCODES = {
    "fH`PAcXDHaX", // 0 count: 1 x K4
    "fH@MkK@", // 1 count: 1 x pos
    "fHdPA@", // 2 count: 1 x Z17
    "eO@HyjC[Ikg{{yYvx", // 3 ringT: 3 atoms 3 bonds
    "fH@MkI`", // 4 count: 1 x neg
    "gBP@DiVj`MbHmTc|~o{rHykv", // 5 ringT: 4 atoms 4 bonds
    "gOp@DiUkjj`MnHlZz|_gu_O{}~WGM^sw^", // 6 ringT: 7 atoms 7 bonds
    "eDA@H``@qS@aDKK@aDK@", // 7 count: 2 x K4
    "fH@MjM|@p\\@aH^@QDPbIbYaYVYP", // 8 count: 1 x K8
    "gKP@Di\\Zj@vhbqkQ~_W}|~UGM^s`", // 9 ringT: 5 atoms 5 bonds
    "eDABHh`@`", // 10 count: 2 x Z17
    "fHd`A@", // 11 count: 1 x Z9
    "fHg`A@", // 12 count: 1 x Z15
    "fHfHA@", // 13 count: 1 x Z35
    "gBB@AE`@`", // 14 count: 4 x K2
    "eDA@H``@`", // 15 count: 2 x Z16
    "eDABPi@@qRiBHqJrjjdHcDkJh", // 16 count: 2 x K5
    "fHeXA@", // 17 count: 1 x Z53
    "deT@@LdRAbVDLuUUPAlhPfES\\LuTOq}Oy|ou}o}|_syJGFgfWVwvON", // 18 FT:ringCount: 452
    "eLpBPB", // 19 count: 3 x K2
    "eDACDlP@`", // 20 count: 2 x Z35
    "eLLBPB", // 21 count: 3 x K3
    "eLCBPiAd@CGJdHcDkJjjPbLRljfiBHqJrj@", // 22 count: 3 x K5
    "gJJ@AEb@D", // 23 count: 5 x K2
    "eLC@H`aB@CGLBDPllBDPl\\BDPl@", // 24 count: 3 x K4
    "fH@LkkP", // 25 count: 1 x rb4
    "gB@PAE`@`", // 26 count: 4 x K3
    "eDABPi@@`", // 27 count: 2 x Z9
    "gB@BAHRPTai@@H", // 28 count: 4 x Z9
    "fHbXA@", // 29 count: 1 x Z50
    "fH@Mj}x", // 30 count: 1 x deg4
    "eD@@CYJz^o@", // 31 count: 2 x deg4
    "eLCBPiAd@B", // 32 count: 3 x Z9
    "gJAPAEb@D", // 33 count: 5 x K3
    "gJ@JAHRPTai@r@@P", // 34 count: 5 x Z9
    "fHc`A@", // 35 count: 1 x Z14
    "fHe@A@", // 36 count: 1 x Z5
    "gB@BADRHTQh`@H", // 37 count: 4 x Z17
    "dcL@@LdRPLRQTnuUUU@FqaBXUMprnuLOq}Oy|ou}o}|_s}_{yFGFgfWVwvONon", // 38 FT:ringCount: 490
    "eLCBHhab@B", // 39 count: 3 x Z17
    "eD@@CYKD\\p", // 40 count: 2 x neg
    "eDACpo@@qPoBDsLjKpaLsJ@", // 41 count: 2 x K6
    "fH@NjmQhX@", // 42 count: 1 x aromNotC
    "eF`BLGUUX|hp", // 43 pair: 4:0:2:2:1
    "eF@Hp[IQPfC`D@bI`xA@HkGeF", // 44 FT:NP: 510
    "eFHBLGUUX|hp", // 45 pair: 4:0:2:3:1
    "fH@Mk}z@", // 46 ringAtom: generic 0 mask 1
    "fH@Mk}y@", // 47 ringAtom: mask 2
    "fH@Mk}x`", // 48 ringAtom: mask 4
    "fH@Mk}xP", // 49 ringAtom: mask 8
    "fH@Mk}xH", // 50 ringAtom: mask 10
    "fH@Mk}xD", // 51 ringAtom: mask 20
    "fH@Mk}xB", // 52 ringAtom: generic 0 mask 40
    "fH@Mk|K@", // 53 ringLegacy: smallest 3
    "fH@Mk|H`", // 54 ringLegacy: generic 0 smallest 4
    "fH@Mk|J`", // 55 ringLegacy: smallest 5
    "fH@Mk|I`", // 56 ringLegacy: smallest 6
    "fH@Mk|K`", // 57 ringLegacy: smallest 7
    "gC`@H}PFnBhiJ@", // 58 K: 4 atoms 3 bonds
    "gC`@Dij@uPUE@", // 59 K: 4 atoms 3 bonds
    "gJT@@TeZhCTc|~o{rHykv", // 60 B: 5 atoms 4 bonds
    "gC`@Dij@uTTe@", // 61 E: 4 atoms 3 bonds
    "eFPBcAkGeF", // 62 pair: 2:2:2:2:1
    "eMBHHchLZpHQBp", // 63 K: 3 atoms 2 bonds
    "gC`@Dij@vRtThXMCAVAP", // 64 Q: 4 atoms 3 bonds
    "gJP@DiZhCUATT", // 65 Q: 5 atoms 4 bonds
    "gGT@ATeVj`MZOszogrhykv\\", // 66 B: 6 atoms 5 bonds
    "gJP@DizhCZBLDLETeYP", // 67 Q: 5 atoms 4 bonds
    "gCh@@dmPFlR`", // 68 E: 4 atoms 3 bonds
    "gCd@Adej@upOkrpyk@", // 69 B: 4 atoms 3 bonds
    "gC`HEHISTAcETaDXeYUU`T", // 70 K: 4 atoms 3 bonds
    "eMHAIhMZT", // 71 E: 3 atoms 2 bonds
    "eMBJPchLZjPbLRlj`", // 72 K: 3 atoms 2 bonds
    "eM`AIhMXT", // 73 E: 3 atoms 2 bonds
    "gGP@DiVj`M\\EQRT", // 74 K: 6 atoms 5 bonds
    "gC`H@DIKTAjhiJ@", // 75 E: 4 atoms 3 bonds
    "gKP@Di\\Zj@uhOk~~_JcfoYp", // 76 B: 5 atoms 5 bonds
    "eMbDBDf`vjj_oINp", // 77 path: 1:7:16:2
    "eM@HzCYfKPpLLETUJ@", // 78 Q: 3 atoms 2 bonds
    "eFhHcAkGeF", // 79 pair: 2:2:2:3:1
    "gGP@DjZj`MZOszogrhykv\\", // 80 B: 6 atoms 5 bonds
    "gJXHB@aIVj@uHOk~|bNZ}`", // 81 B: 5 atoms 4 bonds
    "gJP`@TeZhC[QZiGy}_wdQsWl", // 82 path: 1:8:8:4
    "gNt@@teUjj@uXOk~~_wrXykv^x", // 83 B: 7 atoms 6 bonds
    "gJP@DiZhCZZLtLETEQP", // 84 Q: 5 atoms 4 bonds
    "gJP@DiZhCUIVT", // 85 K: 5 atoms 4 bonds
    "gJX@@eKU@ZqJ@", // 86 E: 5 atoms 4 bonds
    "eF@Hp[IQRFBa`kB`", // 87 Q: 2 atoms 1 bonds
    "gC`@Dij@vPtTHXMCAUQRT", // 88 Q: 4 atoms 3 bonds
    "eM@HzC[IcdLEC@pp@", // 89 Q: 3 atoms 2 bonds
    "gGP@DiVj`MhXpppUpUEIP", // 90 Q: 6 atoms 5 bonds
    "gGXHJ@aIUjhCVc|~o{y|jNZ}g@", // 91 B: 6 atoms 5 bonds
    "gChHAiAIZ`MeEFZiBHqJrjka~_WeasV", // 92 path: 2:2:5:3
    "gCaHL@aIZ`MeEWC|~oKCfl", // 93 path: 1:8:16:3
    "gNx@@eLuUPFkGy}_ws~~SGM^sw@", // 94 B: 7 atoms 6 bonds
    "gJP@DiZhCZZLtLE]EIVT", // 95 Q: 5 atoms 4 bonds
    "gGP@DiVj`Md[EFFBppUpUEIP", // 96 Q: 6 atoms 5 bonds
    "gCi@LDej@vTU\\Osz|lNZp", // 97 path: 1:7:8:3
    "gFx@@eJfuU@Zl_gu_O{yL\\u{O\\", // 98 B: 6 atoms 6 bonds
    "gJP@DiZhCYBQPa`dL@", // 99 Q: 5 atoms 4 bonds
    "gJP@DiZhCYXqVa`LLETEQP", // 100 Q: 5 atoms 4 bonds
    "gKX@@eKcUPFmGy}_wsyT\\u{N", // 101 B: 5 atoms 5 bonds
    "gJP@DizhCYAQPa`TLEXe@", // 102 Q: 5 atoms 4 bonds
    "gJP@DiZhCYCQPa`tLE\\EQVT", // 103 Q: 5 atoms 4 bonds
    "gC`@H}PFrDbaCAHXJpJ@", // 104 Q: 4 atoms 3 bonds
    "gCh@@duPFjbdh", // 105 K: 4 atoms 3 bonds
    "gNq@@eJmUPFkGy}_ws~~SGM^sw@", // 106 B: 7 atoms 6 bonds
    "gC`HDDISTAcE`PbEeXe@", // 107 K: 4 atoms 3 bonds
    "gC`HDDISTAcE`PbEeXE@", // 108 K: 4 atoms 3 bonds
    "gJY@BDeZhCTc|~o{rHykv", // 109 B: 5 atoms 4 bonds
    "gJ\\@AbeKU@ZdJbdkJ@", // 110 K: 5 atoms 4 bonds
    "gJXHH@aIVj@uHOk~|bNZ}`", // 111 B: 5 atoms 4 bonds
    "gJP@DizhC[AZNDLBa`tLEXE@", // 112 Q: 5 atoms 4 bonds
    "gGP`ATeVj`MZOszogrhykv\\", // 113 B: 6 atoms 5 bonds
    "eMBBPRZCVe@", // 114 E: 3 atoms 2 bonds
    "gC``Adej@vTU\\Osz|lNZp", // 115 path: 1:8:8:3
    "eM@HzCZHqCAVE@", // 116 Q: 3 atoms 2 bonds
    "gCaHAiAIZ`MeEFZiBHqJrjka~_WeasV", // 117 path: 2:3:5:3
    "gNp@LdbLjj@uXOk~~_wrXykv^x", // 118 B: 7 atoms 6 bonds
    "gGX@@dkUTAkQ~_W}|~UGM^s`", // 119 B: 6 atoms 5 bonds
    "gJP@DjZhCZFLLLEUEIP", // 120 Q: 5 atoms 4 bonds
    "gJXH@YAIVj@vtVcCTaDXeYUUHOk~|bNZ}`", // 121 path: 2:2:5:4
    "gJT@@TjZhCTc|~o{rHykv", // 122 B: 5 atoms 4 bonds
    "gGP@DiVj`MUEIP", // 123 K: 6 atoms 5 bonds
    "gGP@DiVj`MhHpPpUrUeEP", // 124 Q: 6 atoms 5 bonds
    "daX@@LdPLUUPA@", // 125 copies: 2 x E 3 bonds
    "eM@H~CVBJL", // 126 Q: 3 atoms 2 bonds
    "gGXHAYAIUjhCXqXqejPbLRljjt_gu_OeQsWlx", // 127 path: 2:2:5:5
    "gNy@FDeUjj@uXOk~~_wrXykv^x", // 128 B: 7 atoms 6 bonds
    "gNx@@dsMUPFkGy}_ws~~SGM^sw@", // 129 B: 7 atoms 6 bonds
    "gJY@DDeZhCUAVT", // 130 K: 5 atoms 4 bonds
    "gChHL@aIZ`H", // 131 E: 4 atoms 3 bonds
    "gNy@LDeVjj@uXOk~~_wrXykv^x", // 132 B: 7 atoms 6 bonds
    "eMJAdDf`vjLuHQFIVUUT_~R]`", // 133 path: 2:3:5:2
    "gGP@DiVj`MhHpPpUVTU@", // 134 Q: 6 atoms 5 bonds
    "gGP@LdbMU@ZfJRlhj@", // 135 Q: 6 atoms 5 bonds
    "gGP@DiVj`MhHpPpUfT", // 136 Q: 6 atoms 5 bonds
    "gCh@@dmPFlB`", // 137 K: 4 atoms 3 bonds
    "gJQH@PaIVj@vtVcC`PbEeROszoHcfoX", // 138 path: 2:3:4:4
    "gNt@@|dbJjj@uXOk~~_wrXykv^x", // 139 B: 7 atoms 6 bonds
    "gCh@@duPFlb`", // 140 E: 4 atoms 3 bonds
    "gC`@Dij@vPTTHXECAVQP", // 141 Q: 4 atoms 3 bonds
    "eMDARZB", // 142 K: 3 atoms 2 bonds
    "gGY@JDeVj`MZOszogrhykv\\", // 143 B: 6 atoms 5 bonds
    "gNp@LdbLjj@uXUEIVTUUP", // 144 E: 7 atoms 6 bonds
    "gGPH@DIJuU@Zt_gu_OeQsWlx", // 145 B: 6 atoms 5 bonds
    "gCd@Adej@upUEIP", // 146 K: 4 atoms 3 bonds
    "gC`H@DIMTAka~_WeasV", // 147 B: 4 atoms 3 bonds
    "gGP@DiVj`MdCEBF@ppUVTU@", // 148 Q: 6 atoms 5 bonds
    "gGP`@Tivj`MZOszogrhykv\\", // 149 B: 6 atoms 5 bonds
    "gJT@@TeZhB", // 150 E: 5 atoms 4 bonds
    "gCh@@dmPFjBhh", // 151 E: 4 atoms 3 bonds
    "gNq@@djuUPFkGy}_ws~~SGM^sw@", // 152 B: 7 atoms 6 bonds
    "gGPHCHIRmU@XpuHQFIVUU\\EQRT", // 153 K: 6 atoms 5 bonds
    "eFbHBHpP", // 154 E: 2 atoms 1 bonds
    "gGT@Adifj`MZOszogrhykv\\", // 155 B: 6 atoms 5 bonds
    "gNp@DiUjj@v`cACAVEP", // 156 Q: 7 atoms 6 bonds
    "gJP@DjZhCZBLDLEYe@", // 157 Q: 5 atoms 4 bonds
    "gNp@LdbJjj@uLTeEUT", // 158 Q: 7 atoms 6 bonds
    "gCh@@dmPFjBdh", // 159 E: 4 atoms 3 bonds
    "gGP@DjVj`MmEhzPpJFCPpUbT", // 160 Q: 6 atoms 5 bonds
    "gJP@DiZhCZZLtLETeYP", // 161 Q: 5 atoms 4 bonds
    "gGP@DiVj`MUeEP", // 162 E: 6 atoms 5 bonds
    "gJP@DiZhC[BZNDLDa`tLETeYP", // 163 Q: 5 atoms 4 bonds
    "gGQHAYAIUjhCXqXqejPbLRljjt_gu_OeQsWlx", // 164 path: 2:3:5:5
    "gC`@Dij@vpVcaC@hXMCAVIP", // 165 Q: 4 atoms 3 bonds
    "gFp@DiTvjhB", // 166 K: 6 atoms 6 bonds
    "gCa@@dmPFlb`", // 167 K: 4 atoms 3 bonds
    "gC`DEHZPRfhCYBQRjPbLRljmTaDXeYUUpOkrpyk@", // 168 path: 2:5:5:3
    "gCh@@dmPFlb`", // 169 K: 4 atoms 3 bonds
    "gGPD@DTHRUZj@vLVMZOszogrhykv\\", // 170 path: 1:16:16:5
    "gNx@@djuUPFkGy}_ws~~SGM^sw@", // 171 B: 7 atoms 6 bonds
    "gJ\\@AbeMU@Zd_gu_~QGM^p", // 172 B: 5 atoms 4 bonds
    "gNp@DiWjj@vPlTHXKCAVYP", // 173 Q: 7 atoms 6 bonds
    "gFP@LdAeTA@", // 174 copies: 2 x E 2 bonds
    "gJP@DjZhCUATT", // 175 E: 5 atoms 4 bonds
    "gGY@DDfzj`MZOszogrhykv\\", // 176 B: 6 atoms 5 bonds
    "gJP@DiZhCZZLtLE\\EQRT", // 177 Q: 5 atoms 4 bonds
    "gJX@@eKU@ZxJbdh", // 178 E: 5 atoms 4 bonds
    "eMJABDf`vjLxDHaYUOwdgX", // 179 path: 2:3:4:2
    "gNp@DiUjj@uXUEIVTUUP", // 180 Q: 7 atoms 6 bonds
    "gNp@Diujj@vPTTHXECATqRUeEP", // 181 Q: 7 atoms 6 bonds
    "gNy@DDeVjj@uXOk~~_wrXykv^x", // 182 B: 7 atoms 6 bonds
    "gJT@AdiZhCVIP", // 183 K: 5 atoms 4 bonds
    "gGP@DjVj`MihsPpUbT", // 184 Q: 6 atoms 5 bonds
    "fH@MjMCA~|`@", // 185 ringAtom: mask 2
    "gFT@Addvj@`", // 186 copies: 2 x E 2 bonds
    "gC`HEHISTAcETaDXeYUUPTe@", // 187 K: 4 atoms 3 bonds
    "gJY@LDejhCTc|~o{rHykv", // 188 B: 5 atoms 4 bonds
    "eMPARZCZji~|d{@", // 189 path: 1:7:7:2
    "gJQH@YAIVj@vtVcCTaDXeYUUHOk~|bNZ}`", // 190 path: 2:3:5:4
    "gCa@@dmPFjBdh", // 191 E: 4 atoms 3 bonds
    "gGP@LdbMU@[RQda`jhiJ@", // 192 Q: 6 atoms 5 bonds
    "eM@HzCYfKPpLL@", // 193 Q: 3 atoms 2 bonds
    "gCi@LDij@upOkrpyk@", // 194 B: 4 atoms 3 bonds
    "dnD@@DjUJbZjj`C[`aLJfjH_cz_sy_k{_{rDNMOLnmol", // 195 pairT: 7 atoms 8 bonds
    "gCh@@dmPFjbdh", // 196 K: 4 atoms 3 bonds
    "gGX@@druTAkQ~_W}|~UGM^s`", // 197 B: 6 atoms 5 bonds
    "gJP@DiZhCUART", // 198 Q: 5 atoms 4 bonds
    "gGT@@TfVj`MZOszogrhykv\\", // 199 B: 6 atoms 5 bonds
    "eMbAdDf`qfiBHqJrjkB`", // 200 K: 3 atoms 2 bonds
    "gC`HDDISTAcE`PbE`", // 201 K: 4 atoms 3 bonds
    "gCh@AGj@upOkrpyk@", // 202 B: 4 atoms 3 bonds
    "gGQ@@dsUTAkQ~_W}|~UGM^s`", // 203 B: 6 atoms 5 bonds
    "gNq`AVeJmUPFkGy}_ws~~SGM^sw@", // 204 B: 7 atoms 6 bonds
    "gNp@LdbJjj@vdcICATqRTUUP", // 205 Q: 7 atoms 6 bonds
    "gFP@LdAeTAj`iJ@", // 206 copies: 2 x E 2 bonds
    "daD@@DiUVzjj`B", // 207 bigE: 8 atoms 8 bonds
    "gJP@DiZhCYXqVa`LLEXE@", // 208 Q: 5 atoms 4 bonds
    "gNp@LdbJjj@vccGCATqRUeUP", // 209 Q: 7 atoms 6 bonds
    "gJPD@DDHRUj`MmEjd_gu_~QGM^p", // 210 path: 1:16:16:4
    "gC`@Dij@vPdTHXICAVAP", // 211 Q: 4 atoms 3 bonds
    "gNp@DiWjj@v`cACAUIQT", // 212 Q: 7 atoms 6 bonds
    "gNx@@dlmUPFkGy}_ws~~SGM^sw@", // 213 B: 7 atoms 6 bonds
    "gJT@AdiZhCVAP", // 214 E: 5 atoms 4 bonds
    "gC`@H}PFtdYHXJxJbdh", // 215 Q: 4 atoms 3 bonds
    "gNpHADIJmUTAjq~_W}|odqsWl}p", // 216 B: 7 atoms 6 bonds
    "gNp@LdbJjj@vrqceCAhXCCAUQUT", // 217 Q: 7 atoms 6 bonds
    "gGQHJ@aIUjhCXqXuhOk~~_JcfoYp", // 218 path: 1:8:16:5
    "gFt@ATiTvjhCUc|~o{y_IcfoY{`", // 219 B: 6 atoms 6 bonds
    "gGX@@eNuTAjlhj@", // 220 E: 6 atoms 5 bonds
    "gFq@@eJfuU@Zl_gu_O{yL\\u{O\\", // 221 B: 6 atoms 6 bonds
    "eMB@HchMT_~R]`", // 222 B: 3 atoms 2 bonds
    "gJX@@dkU@ZsJ@", // 223 E: 5 atoms 4 bonds
    "gJU@DPdkU@ZhJr`", // 224 K: 5 atoms 4 bonds
    "gGXHJHaIUjhCXqXuhOk~~_JcfoYp", // 225 path: 1:7:17:5
    "gC`@Dij@vPTTHXEC@", // 226 Q: 4 atoms 3 bonds
    "gCa@@duPFjbdh", // 227 E: 4 atoms 3 bonds
    "gGP@DiVj`Md[EFFBpp@", // 228 Q: 6 atoms 5 bonds
    "gNxHF@aIUZj`MVOszog}|fNZ}gn", // 229 B: 7 atoms 6 bonds
    "gNy@BDeZjj@uXOk~~_wrXykv^x", // 230 B: 7 atoms 6 bonds
    "gGP@DiVj`M\\EYQT", // 231 K: 6 atoms 5 bonds
    "gNx@@dsuUPD", // 232 E: 7 atoms 6 bonds
    "gNp@DiUjj@v`cACAUEUT", // 233 Q: 7 atoms 6 bonds
    "gNx@AdbbMUPFkGy}_ws~~SGM^sw@", // 234 B: 7 atoms 6 bonds
    "gGP@DjVj`MmcX{PpFFBpp@", // 235 Q: 6 atoms 5 bonds
    "gGP`ATeVj`McEcVc|~o{y|jNZ}g@", // 236 path: 1:8:8:5
    "gGP@DiVj`MhXpppUPUE@", // 237 Q: 6 atoms 5 bonds
    "gC`@H}PFtdYHXJpJ@", // 238 Q: 4 atoms 3 bonds
    "gCd@Adej@udT", // 239 K: 4 atoms 3 bonds
    "gNp@DiUjj@vPlTHXKCAVEP", // 240 Q: 7 atoms 6 bonds
    "gGY@JDiVj`MZOszogrhykv\\", // 241 B: 6 atoms 5 bonds
    "gJPHAHIKUPFiGy}_wdQsWl", // 242 B: 5 atoms 4 bonds
    "gGPDADTHRUZj@vLVMZOszogrhykv\\", // 243 path: 1:16:17:5
    "gJP@DjZhCZFLLLEUEYP", // 244 Q: 5 atoms 4 bonds
    "gNp@DjYjj@vccGCAVaTTeYQT", // 245 Q: 7 atoms 6 bonds
    "gC`@Dij@vPdTHXICAWATTe@", // 246 Q: 4 atoms 3 bonds
    "gNu@E`dsuUPFkGy}_ws~~SGM^sw@", // 247 B: 7 atoms 6 bonds
    "gC`@H}PFjBhh", // 248 Q: 4 atoms 3 bonds
    "gKX@@eNmUPD", // 249 E: 5 atoms 5 bonds
    "gJ\\@AbeKU@Zd_gu_~QGM^p", // 250 B: 5 atoms 4 bonds
    "gGP@DjVj`MYe@", // 251 E: 6 atoms 5 bonds
    "gNp@DjWjj@vecKCAUQVT", // 252 Q: 7 atoms 6 bonds
    "gNx@@eMMUPFkGy}_ws~~SGM^sw@", // 253 B: 7 atoms 6 bonds
    "gC`D@DXHRVhCYQUpOkrpyk@", // 254 path: 1:16:16:3
    "gJY@BDeZhC[QZiGy}_wdQsWl", // 255 path: 1:7:8:4
    "gGX@@djuTAkBh", // 256 E: 6 atoms 5 bonds
    "gJQ@@dkU@ZiJr`", // 257 K: 5 atoms 4 bonds
    "gJX`BDdwU@Zd_gu_~QGM^p", // 258 B: 5 atoms 4 bonds
    "gJPHAbIKUPFiGy}_wdQsWl", // 259 B: 5 atoms 4 bonds
    "gNxHH@aIVZj`MVOszog}|fNZ}gn", // 260 B: 7 atoms 6 bonds
    "gJP@DizhCZBLDLEYE@", // 261 Q: 5 atoms 4 bonds
    "deDD@@kID`XeUUPAjbJYP", // 262 FT:mult: 321
    "daX@@Ld`leUPA@", // 263 copies: 2 x E 3 bonds
    "gC`HADIMTA@", // 264 E: 4 atoms 3 bonds
    "gNp@Djejj@uXOk~~_wrXykv^x", // 265 B: 7 atoms 6 bonds
    "eFBCpcAcA^DIfYUX|hp", // 266 pair: 2:1:2:6:1
    "gGP@DiVj`MXE@", // 267 Q: 6 atoms 5 bonds
    "gGP@DiVj`MdCEBF@ppUfT", // 268 Q: 6 atoms 5 bonds
    "gNp@DiWjj@vPtTHXMCAVYP", // 269 Q: 7 atoms 6 bonds
    "gNp@LdbJjj@vecKCAVAP", // 270 Q: 7 atoms 6 bonds
    "fI@G}xP", // 271 ringAtom: mask 8
    "gNpDEHNPrRHjjhCEJiBHqJrj]RDQbUeUTaRUeEP", // 272 K: 7 atoms 6 bonds
    "gJP@DiZhCWARUe@", // 273 Q: 5 atoms 4 bonds
    "gJP`@TfZhCUQRT", // 274 E: 5 atoms 4 bonds
    "gNp@LdbJjj@uTTe@", // 275 Q: 7 atoms 6 bonds
    "daY@@@KHhBiUT@ZeBdTRjT", // 276 copies: 2 x E 3 bonds
    "gNt@ATiujj@uXOk~~_wrXykv^x", // 277 B: 7 atoms 6 bonds
    "gGQ@@eJuTAjdhj@", // 278 E: 6 atoms 5 bonds
    "gJT@@TeZhC[QZiGy}_wdQsWl", // 279 path: 1:7:7:4
    "daD@@DiUVzjj`CV@T", // 280 bigE: 8 atoms 8 bonds
    "gGP@LdbMU@[IZJTLFa`jhkJ@", // 281 Q: 6 atoms 5 bonds
    "gKP@LdabjhCZFLLL@", // 282 Q: 5 atoms 5 bonds
    "gC`HHDQz`LYLBDPl@", // 283 K: 4 atoms 3 bonds
    "gJX@@eKU@ZhJb`", // 284 K: 5 atoms 4 bonds
    "eMbABDf`qg@aDKJth", // 285 K: 3 atoms 2 bonds
    "gGPD@DVPRUZj@vLVMZOszogrhykv\\", // 286 path: 1:9:16:5
    "eMPBchMXT", // 287 K: 3 atoms 2 bonds
    "eMA@HPaIhMjjg{rSl", // 288 path: 1:16:16:2
    "gGP@DjZj`H", // 289 Q: 6 atoms 5 bonds
    "daX@@Ld`leUPAj`JqP", // 290 copies: 2 x E 3 bonds
    "gNy@DDf]jj@uXOk~~_wrXykv^x", // 291 B: 7 atoms 6 bonds
    "gGT@@Tivj`MZOszogrhykv\\", // 292 B: 6 atoms 5 bonds
    "gNp@DjUjj@uXOk~~_wrXykv^x", // 293 B: 7 atoms 6 bonds
    "gNp@DjWjj@vVLUhXCC@", // 294 Q: 7 atoms 6 bonds
    "gJP@DizhCZBLDLE]EIVT", // 295 Q: 5 atoms 4 bonds
    "gC`@Dij@vRtThXMCAUATT", // 296 Q: 4 atoms 3 bonds
    "gJP@Dk^hCZRLdLE\\BiVU|hL", // 297 Q: 5 atoms 4 bonds
    "gChHL@aIZ`MeEWC|~oKCfl", // 298 path: 1:7:16:3
    "gJP@DiZhCYXqVa`LLEXe@", // 299 Q: 5 atoms 4 bonds
    "gGY@BDfZj`MXE@", // 300 E: 6 atoms 5 bonds
    "gJPDMHFPRej`LUjdHcDkJhuHQFIVUUTEQP", // 301 K: 5 atoms 4 bonds
    "gGP@DiVj`MdMEBFCPpURTU@", // 302 Q: 6 atoms 5 bonds
    "gCaHA`aIZ`LYlBDPl@", // 303 K: 4 atoms 3 bonds
    "gJXHH@aIZj@uHOk~|bNZ}`", // 304 B: 5 atoms 4 bonds
    "gJT@@TeZhCUQRT", // 305 K: 5 atoms 4 bonds
    "gNpHAHIJkUTAjXiJrbh", // 306 E: 7 atoms 6 bonds
    "gC`HEHISTAcETaDXeYU@", // 307 K: 4 atoms 3 bonds
    "gGQ@@djuTAjlhj@", // 308 K: 6 atoms 5 bonds
    "gJXHBLQIVj@vtVjQ~_W}yD\\u{@", // 309 path: 1:7:35:4
    "gNp@LdbJjj@vacCCAWQRUU@", // 310 Q: 7 atoms 6 bonds
    "gGP@DiVj`MdKEBFBppUbT", // 311 Q: 6 atoms 5 bonds
    "gJP@DizhC[AFNDLBa`LL@", // 312 Q: 5 atoms 4 bonds
    "gC`@Dij@vbcECAWATTe@", // 313 Q: 4 atoms 3 bonds
    "gGU@LPdluTAkQ~_W}|~UGM^s`", // 314 B: 6 atoms 5 bonds
    "det@@DjYUX^fjjj`B", // 315 pairE: 10 atoms 11 bonds
    "gNp@DiUjj@uQUU@", // 316 E: 7 atoms 6 bonds
    "eMBBHRZCVe@", // 317 E: 3 atoms 2 bonds
    "eMBCDRZB", // 318 E: 3 atoms 2 bonds
    "gC`@Dkz@vfcMCAU@jU|hL", // 319 Q: 4 atoms 3 bonds
    "gNp@Diujj@v`cACAWIVTU@", // 320 Q: 7 atoms 6 bonds
    "gFp@LdbJMUPFkGy}_ws~~SGM^sw@", // 321 B: 6 atoms 6 bonds
    "eMB@HRZCVe@", // 322 E: 3 atoms 2 bonds
    "gNp`@teUjj@uXOk~~_wrXykv^x", // 323 B: 7 atoms 6 bonds
    "gNp@DiUjj@vecKCAWATTe@", // 324 Q: 7 atoms 6 bonds
    "gFR@@mTdvj@uPTe@", // 325 copies: 2 x E 2 bonds
    "gJP@Dk^lCYPqTa`LLETBxorP}`", // 326 Q: 5 atoms 4 bonds
    "gNt@@tf[jj@uXOk~~_wrXykv^x", // 327 B: 7 atoms 6 bonds
    "gGX@@eSUTAkQ~_W}|~UGM^s`", // 328 B: 6 atoms 5 bonds
    "gNy@FDiWjj@uXOk~~_wrXykv^x", // 329 B: 7 atoms 6 bonds
    "gCd@Adej@vTU\\Osz|lNZp", // 330 path: 1:7:7:3
    "gNy@DDeejj@uXOk~~_wrXykv^x", // 331 B: 7 atoms 6 bonds
    "gNp@LdbJjj@utTeYP", // 332 E: 7 atoms 6 bonds
    "gC`HAbIKTAjhiJ@", // 333 E: 4 atoms 3 bonds
    "gGP@DjVj`MTEQP", // 334 E: 6 atoms 5 bonds
    "daY@@@KIHKIUT@P", // 335 copies: 2 x E 3 bonds
    "gGT@ADi^j`MUEEP", // 336 E: 6 atoms 5 bonds
    "gNp@DjYjj@u`T", // 337 Q: 7 atoms 6 bonds
    "gKX@@eMcUPFmGy}_wsyT\\u{N", // 338 B: 5 atoms 5 bonds
    "gFy@JDiTvjhCUc|~o{y_IcfoY{`", // 339 B: 6 atoms 6 bonds
    "diX@@LdA`Ljj@MVATJQVJIUJ@", // 340 copies: 3 x E 2 bonds
    "gNp@DiWjj@vPLTHXCCAVYP", // 341 Q: 7 atoms 6 bonds
    "gNp@DiUjj@vPlTHXKCAVYP", // 342 Q: 7 atoms 6 bonds
    "gKP@Di\\Zj@vPtTHXMC@", // 343 Q: 5 atoms 5 bonds
    "gGP@DiVj`M\\EQQT", // 344 E: 6 atoms 5 bonds
    "gFp@DjTvjhCYXqVa`LL@", // 345 Q: 6 atoms 6 bonds
    "gChHLHaIZ`MYE@", // 346 E: 4 atoms 3 bonds
    "gCdHE`DIMTAka~_WeasV", // 347 B: 4 atoms 3 bonds
    "gC`@Diz@u`K|hL", // 348 Q: 4 atoms 3 bonds
    "gJP@DiZhCZZLtLE\\EIVT", // 349 Q: 5 atoms 4 bonds
    "gGP@LdbMU@ZpJ@", // 350 Q: 6 atoms 5 bonds
    "gNx@@djmUPFnRlhj@", // 351 K: 7 atoms 6 bonds
    "gNyHFLDIJkUTAcM`PbEeXE@", // 352 K: 7 atoms 6 bonds
    "gNy@FDf]jj@uXOk~~_wrXykv^x", // 353 B: 7 atoms 6 bonds
    "gC`@H}PFtdYHXJjJR`", // 354 Q: 4 atoms 3 bonds
    "gNp@DjWjj@vecKC@", // 355 Q: 7 atoms 6 bonds
    "gNp@LdbJjj@vdcICAUQRT", // 356 Q: 7 atoms 6 bonds
    "gJPHLDIRuPFLvABHVUPUE@", // 357 K: 5 atoms 4 bonds
    "gNx@@eJuUPFjJjh", // 358 K: 7 atoms 6 bonds
    "gGX@@dj}TAk`WJJoeA`", // 359 E: 6 atoms 5 bonds
    "daY@@@IISVjh@uQETh", // 360 copies: 2 x E 3 bonds
    "gGY@JDiVjpMXRJG@", // 361 K: 6 atoms 5 bonds
    "gNu@EPdjuUPFkGy}_ws~~SGM^sw@", // 362 B: 7 atoms 6 bonds
    "eOHBNZ``", // 363 K: 3 atoms 3 bonds
    "eFJHBHpP", // 364 E: 2 atoms 1 bonds
    "eMJHBHzCUOwdgX", // 365 B: 3 atoms 2 bonds
    "gNq`AVeNuUPD", // 366 K: 7 atoms 6 bonds
    "gNq@@eNmUPFkGy}_ws~~SGM^sw@", // 367 B: 7 atoms 6 bonds
    "gKQ@@eKcUPFmGy}_wsyT\\u{N", // 368 B: 5 atoms 5 bonds
    "gNp@Diujj@vPTTHXECAWIVTU@", // 369 Q: 7 atoms 6 bonds
    "gGP@DiVj`Md[EFFBppUpUEYP", // 370 Q: 6 atoms 5 bonds
    "gNp@Diujj@vP\\THXGCAUIVT", // 371 Q: 7 atoms 6 bonds
    "gJP@DiZhC[BZNDLDa`tLEXe@", // 372 Q: 5 atoms 4 bonds
    "gC`@Diz@vbcECAV@or`p", // 373 Q: 4 atoms 3 bonds
    "gGXHL@aIUjhCVc|~o{y|jNZ}g@", // 374 B: 6 atoms 5 bonds
    "gC`HEHISTAcETaDXeYUUbT", // 375 K: 4 atoms 3 bonds
    "gC`DEHXHRfhCYBQRjPbLRljm`PbEe\\Osz|lNZp", // 376 path: 2:4:5:3
    "gJQHLIAIZj@uHOk~|bNZ}`", // 377 B: 5 atoms 4 bonds
    "eMDARZCZji~|d{@", // 378 path: 1:8:8:2
    "gFP`AldAeTA@", // 379 copies: 2 x E 2 bonds
    "gFp`ATiTvjhCUc|~o{y_IcfoY{`", // 380 B: 6 atoms 6 bonds
    "gN|@AfeKmUPFkGy}_ws~~SGM^sw@", // 381 B: 7 atoms 6 bonds
    "gJX@@eOU@ZqJ@", // 382 K: 5 atoms 4 bonds
    "gGP@DjZj`MlCXxPpFFBppUfT", // 383 Q: 6 atoms 5 bonds
    "eM@HzC[IbwpCApBDaxADQBHfIfEeYeOpCApBDaxADQBHfIfEeYeUS}yIv", // 384 path: 2:8:8:2
    "gGP@Divj`MdEEBFAPp@", // 385 Q: 6 atoms 5 bonds
    "gFq@@drfuU@ZpJ@", // 386 K: 6 atoms 6 bonds
    "det@@DjYUX^fjjj`CVIT", // 387 pairE: 10 atoms 11 bonds
    "gFu@LPeLzuU@Zl_gu_O{yL\\u{O\\", // 388 B: 6 atoms 6 bonds
    "fH`TA@", // 389 count: 1 x Z80
    "gJQ@@duU@Zd_gu_~QGM^p", // 390 B: 5 atoms 4 bonds
    "gCe@E`dmPFnGy}_~VGMX", // 391 B: 4 atoms 3 bonds
    "gJY@LDiZhCVYP", // 392 K: 5 atoms 4 bonds
    "gNpHAHIJmUTAjq~_W}|odqsWl}p", // 393 B: 7 atoms 6 bonds
    "gCh@@doPFlA_eA`", // 394 K: 4 atoms 3 bonds
    "gC`@H}PFrbbiC@hXJqJ@", // 395 Q: 4 atoms 3 bonds
    "gJT@@dfzhCUAVT", // 396 E: 5 atoms 4 bonds
    "gNpH@DIJkUTAjq~_W}|odqsWl}p", // 397 B: 7 atoms 6 bonds
    "gNp@LdbLjj@vPLTHXCC@", // 398 Q: 7 atoms 6 bonds
    "gJP@DjZhC[QZNdLBa`tLEUEIP", // 399 Q: 5 atoms 4 bonds
    "gNp@LdbJjj@uhUEIVTU@", // 400 E: 7 atoms 6 bonds
    "gJPHMHIRuPFLuRDQbUeUUATT", // 401 K: 5 atoms 4 bonds
    "gNq@@eLuUPFkGy}_ws~~SGM^sw@", // 402 B: 7 atoms 6 bonds
    "gGTHDPDIJmU@Zt_gu_OeQsWlx", // 403 B: 6 atoms 5 bonds
    "gGY@DDfVj`MZOszogrhykv\\", // 404 B: 6 atoms 5 bonds
    "gCd@Adej@u`T", // 405 K: 4 atoms 3 bonds
    "gNt@@TjUjj@ufT", // 406 E: 7 atoms 6 bonds
    "gNt@A\\dbLjj@uXOk~~_wrXykv^x", // 407 B: 7 atoms 6 bonds
    "gJP@DiZhCZZLtLEXE@", // 408 Q: 5 atoms 4 bonds
    "gNp@Diujj@v`cAC@", // 409 Q: 7 atoms 6 bonds
    "gGP@DiVj`MTEQP", // 410 E: 6 atoms 5 bonds
    "gNq`AjeKmUPFkGy}_ws~~SGM^sw@", // 411 B: 7 atoms 6 bonds
    "gNx@@dsmUPFibdkJJ`", // 412 E: 7 atoms 6 bonds
    "gNu@JpeJmUPD", // 413 K: 7 atoms 6 bonds
    "gJT@ADiZhCVQP", // 414 K: 5 atoms 4 bonds
    "gGP@DiVj`MhXpppUVTU@", // 415 Q: 6 atoms 5 bonds
    "gJQHB@aIVj@uHOk~|bNZ}`", // 416 B: 5 atoms 4 bonds
    "gNy@LDeUjj@uXOk~~_wrXykv^x", // 417 B: 7 atoms 6 bonds
    "gNp@DiUjj@uRUe@", // 418 K: 7 atoms 6 bonds
    "gNp@DiUjj@vecKCATaTUeEP", // 419 Q: 7 atoms 6 bonds
    "gNt@ADkejj@uXOk~~_wrXykv^x", // 420 B: 7 atoms 6 bonds
    "gOx@@eJm]UTA@", // 421 ringE: 7 atoms 7 bonds
    "gJP@DjZhB", // 422 Q: 5 atoms 4 bonds
    "gGP@DjVj`MTEIP", // 423 K: 6 atoms 5 bonds
    "gNp@DiUjj@vU\\UXXGCAWATTe@", // 424 Q: 7 atoms 6 bonds
    "gNqDBHaqFQQPuU@ZzJRbh", // 425 E: 7 atoms 6 bonds
    "gN|@AVeJmUPFkGy}_ws~~SGM^sw@", // 426 B: 7 atoms 6 bonds
    "gGP@DiVj`MhXpppUHUEIVT", // 427 Q: 6 atoms 5 bonds
    "gGTHHPDIJuU@Zt_gu_OeQsWlx", // 428 B: 6 atoms 5 bonds
    "gGY@DDeVj`MZOszogrhykv\\", // 429 B: 6 atoms 5 bonds
    "gGP@Divj`MdEEBFAPpU`T", // 430 Q: 6 atoms 5 bonds
    "gJXH@`aIVj@qbpHQBp", // 431 K: 5 atoms 4 bonds
    "gNx`DFdjmUPFkGy}_ws~~SGM^sw@", // 432 B: 7 atoms 6 bonds
    "gNt@ATiVjj@uhUEYQUU@", // 433 K: 7 atoms 6 bonds
    "gNq@@eJuUPFkGy}_ws~~SGM^sw@", // 434 B: 7 atoms 6 bonds
    "gGP@DiVj`MdCEBF@pp@", // 435 Q: 6 atoms 5 bonds
    "gGP`@dfzj`MZOszogrhykv\\", // 436 B: 6 atoms 5 bonds
    "gNx@@dl}UPFiBdkJJ`", // 437 E: 7 atoms 6 bonds
    "gJQ@@dkU@ZjJR`", // 438 E: 5 atoms 4 bonds
    "gGP@DjVj`MihsPpUPUE@", // 439 Q: 6 atoms 5 bonds
    "gJPDAHFPRUj`MmEjd_gu_~QGM^p", // 440 path: 1:9:9:4
    "gNp@DjUjj@`", // 441 K: 7 atoms 6 bonds
    "gGP@Divj`MdEEBFAPpUVTU@", // 442 Q: 6 atoms 5 bonds
    "gC`@H}PFrbbiC@hXJhJb`", // 443 Q: 4 atoms 3 bonds
    "gGXHJLQIUjhCVc|~o{y|jNZ}g@", // 444 B: 6 atoms 5 bonds
    "gJP@DjZhCZFLLLEYE@", // 445 Q: 5 atoms 4 bonds
    "gNx@@dsmUPFkGy}_ws~~SGM^sw@", // 446 B: 7 atoms 6 bonds
    "gNx@@eJuUPD", // 447 K: 7 atoms 6 bonds
    "gNt@A\\dTQjj@urUeEP", // 448 E: 7 atoms 6 bonds
    "gNp@DiWjj@v`cACAUIUT", // 449 Q: 7 atoms 6 bonds
    "gGT@ATeVj`McEcVc|~o{y|jNZ}g@", // 450 path: 1:7:7:5
    "gNp@DkUzj@vdcICAU@iU|hL", // 451 Q: 7 atoms 6 bonds
    "gGXHAPaIUjhCXqXqepHQBrmGy}_wsyT\\u{N", // 452 path: 2:2:4:5
    "gNq@@djmUPFkGy}_ws~~SGM^sw@", // 453 B: 7 atoms 6 bonds
    "gGP@DjVj`MeMERFCPp@", // 454 Q: 6 atoms 5 bonds
    "diT@@DjYVnXZjjh@vdHSBinFja~OiOe~omoc~_IPxt|rzv~qyp", // 455 pairT: 9 atoms 10 bonds
    "gNp`ATf^jj@uXOk~~_wrXykv^x", // 456 B: 7 atoms 6 bonds
    "gFPP@mTdvj@uPTe@", // 457 copies: 2 x E 2 bonds
    "gNq@@eNuUPFlJ`", // 458 K: 7 atoms 6 bonds
    "gJP@DjZhCYPqTa`LL@", // 459 Q: 5 atoms 4 bonds
    "eMHBN`uS}yIv", // 460 B: 3 atoms 2 bonds
    "gGU@MPdjuTAkQ~_W}|~UGM^s`", // 461 B: 6 atoms 5 bonds
    "gJY@BDeZhCVAP", // 462 E: 5 atoms 4 bonds
    "gNp@DiWjj@v`cACAVYP", // 463 Q: 7 atoms 6 bonds
    "gJP@DiZhCYXqVa`LLETEYP", // 464 Q: 5 atoms 4 bonds
    "gGP@Djfj`Mbl[DjFCPpFFBppUaT", // 465 Q: 6 atoms 5 bonds
    "gJP@DizhCZBLDLEUEIP", // 466 Q: 5 atoms 4 bonds
    "gKP@DjTZj@`", // 467 E: 5 atoms 5 bonds
    "eMBJPchMhcURDQbUeUUOwdgX", // 468 path: 2:1:5:2
    "gKP@Di\\Zj@v`cACAUIVT", // 469 Q: 5 atoms 5 bonds
    "gNp@DjUjj@vacCCAVYP", // 470 Q: 7 atoms 6 bonds
    "gJX@@duU@P", // 471 K: 5 atoms 4 bonds
    "gGP@DiVj`MdCEBF@ppUbT", // 472 Q: 6 atoms 5 bonds
    "gC`@Dkz@uPJe_JC@", // 473 E: 4 atoms 3 bonds
    "gNy@JDiWjj@ufT", // 474 K: 7 atoms 6 bonds
    "gNt@AdeUzj@uPKU_JC@", // 475 E: 7 atoms 6 bonds
    "gNp@DiWjj@vP\\THXGCAUIUT", // 476 Q: 7 atoms 6 bonds
    "gNp@LdbJjj@vrsceCAhXGCAWQVUU@", // 477 Q: 7 atoms 6 bonds
    "gG\\@@jdvuTAkQ~_W}|~UGM^s`", // 478 B: 6 atoms 5 bonds
    "gGP@LdbMU@[Rqea`kLh", // 479 Q: 6 atoms 5 bonds
    "gGQ@@druTAkQ~_W}|~UGM^s`", // 480 B: 6 atoms 5 bonds
    "gFp@DiTvjhCVAP", // 481 K: 6 atoms 6 bonds
    "gKP@LdabjhB", // 482 E: 5 atoms 5 bonds
    "daX@@LdPLUUPAjPJaVJIP", // 483 copies: 2 x E 3 bonds
    "gNx@AddQeUPFkGy}_ws~~SGM^sw@", // 484 B: 7 atoms 6 bonds
    "gBd`I`dchCUATT", // 485 copies: 2 x E 1 bonds
    "gNp@DiUjj@uHUEIVT", // 486 Q: 7 atoms 6 bonds
    "gNt@@TfYjj@uXOk~~_wrXykv^x", // 487 B: 7 atoms 6 bonds
    "gGX@@eNuTAkdkJJ`", // 488 K: 6 atoms 5 bonds
    "gGP@Djfj`MhHpPp@", // 489 Q: 6 atoms 5 bonds
    "gFt@ATigFjhCUc|~o{y_IcfoY{`", // 490 B: 6 atoms 6 bonds
    "gNp@LdbLjj@`", // 491 K: 7 atoms 6 bonds
    "gNq@AdbbMUPFnRlhj@", // 492 E: 7 atoms 6 bonds
    "gNp@LdbJjj@vtSciC@hXGCAVQP", // 493 Q: 7 atoms 6 bonds
    "gGY@JDinj`MZOszogrhykv\\", // 494 B: 6 atoms 5 bonds
    "gNp@LdbJjj@vTTUHXECAUQUT", // 495 Q: 7 atoms 6 bonds
    "gGX@@dsuTAkhiJr`", // 496 E: 6 atoms 5 bonds
    "gCi@LDej@uPTe@", // 497 K: 4 atoms 3 bonds
    "gNpDLDNPRi^jhCE[@aDKGTaDXeYUUHUEYQT", // 498 K: 7 atoms 6 bonds
    "gJPHLDIRuPFLvABHV@", // 499 K: 5 atoms 4 bonds
    "gJY@DDeZhB", // 500 E: 5 atoms 4 bonds
    "gGP@LdbMU@[RQda`@", // 501 Q: 6 atoms 5 bonds
    "gNy@LDeUjj@`", // 502 E: 7 atoms 6 bonds
    "gNt@ATf^jj@uXOk~~_wrXykv^x", // 503 B: 7 atoms 6 bonds
    "gNp@DiUjj@vecKCATaTTeUP", // 504 Q: 7 atoms 6 bonds
    "gJX@@dkU@ZqJ@", // 505 K: 5 atoms 4 bonds
    "gNt@AldTLjj@upTUUP", // 506 E: 7 atoms 6 bonds
    "gGXHBIAIUjhCUQRT", // 507 E: 6 atoms 5 bonds
    "gNqHFIAIUZj`MVOszog}|fNZ}gn", // 508 B: 7 atoms 6 bonds
    "gC`HAHIMTA@", // 509 E: 4 atoms 3 bonds
    "gNxHBHaIUjj`MVOszog}|fNZ}gn", // 510 B: 7 atoms 6 bonds
    "gGT@ATifj`M\\EQRT", // 511 K: 6 atoms 5 bonds
  };
}
