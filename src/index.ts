import type { Molecule as IMolecule, MoleculeProperties as IMoleculeProperties, Reaction as IReaction } from './types.ts';

import type { FromMolfileOptions, ToMolfileOptions } from './types.ts';

import { loadOCL } from './wasm/load.ts';

// Top-level await: the WASM module is instantiated when this module is imported,
// so consumers can use the API synchronously, matching the openchemlib-js shape.
const ocl = await loadOCL();

export const Molecule = ocl.Molecule;
export const SmilesParser = ocl.SmilesParser;
export const SSSearcher = ocl.SSSearcher;
export const SSSearcherWithIndex = ocl.SSSearcherWithIndex;
export const ForceFieldMMFF94 = ocl.ForceFieldMMFF94;
export const ConformerGenerator = ocl.ConformerGenerator;
export const DruglikenessPredictor = ocl.DruglikenessPredictor;
export const ToxicityPredictor = ocl.ToxicityPredictor;
export const DrugScoreCalculator = ocl.DrugScoreCalculator;
export const Canonizer = ocl.Canonizer;
export const Reaction = ocl.Reaction;
export const ReactionEncoder = ocl.ReactionEncoder;
export const Reactor = ocl.Reactor;
export const Transformer = ocl.Transformer;
export const SDFileParser = ocl.SDFileParser;
export const Util = ocl.Util;

// TeaVM cannot @JSExport static fields, so attach the constants on the JS side,
// byte-identical to the OpenChemLib values.
Object.assign(ToxicityPredictor, {
  RISK_UNKNOWN: 0,
  RISK_NO: 1,
  RISK_LOW: 2,
  RISK_HIGH: 3,
  TYPE_MUTAGENIC: 0,
  TYPE_TUMORIGENIC: 1,
  TYPE_IRRITANT: 2,
  TYPE_REPRODUCTIVE_EFFECTIVE: 3,
});

export const CanonizerUtil = Object.assign(ocl.CanonizerUtil, {
  NORMAL: 0,
  NOSTEREO: 1,
  BACKBONE: 2,
  TAUTOMER: 3,
  NOSTEREO_TAUTOMER: 4,
});

// Reaction.fromMolecules: an array-of-facade-objects parameter triggers a TeaVM
// WasmGC codegen bug, so build the reaction from single-object adds instead.
Object.assign(Reaction, {
  fromMolecules(molecules: IMolecule[], reactantCount: number): IReaction {
    const reaction = Reaction.create();
    for (let i = 0; i < molecules.length; i++) {
      if (i < reactantCount) {
        reaction.addReactant(molecules[i]);
      } else {
        reaction.addProduct(molecules[i]);
      }
    }
    return reaction;
  },
});

// =========================================================================
// Attach all Molecule static constants (byte-identical to openchemlib-js,
// values read from JSMolecule.java + vendored com/actelion/research/chem/Molecule.java
// and Canonizer.java). All cAtomQF* longs fit in a JS safe integer (< 2^53).
// =========================================================================
Object.assign(Molecule, {
  // Canonizer mode flags
  CANONIZER_CREATE_SYMMETRY_RANK: 1,
  CANONIZER_CONSIDER_DIASTEREOTOPICITY: 2,
  CANONIZER_CONSIDER_ENANTIOTOPICITY: 4,
  CANONIZER_CONSIDER_STEREOHETEROTOPICITY: 6,
  CANONIZER_ENCODE_ATOM_CUSTOM_LABELS: 8,
  CANONIZER_ENCODE_ATOM_SELECTION: 16,
  CANONIZER_ASSIGN_PARITIES_TO_TETRAHEDRAL_N: 32,
  CANONIZER_COORDS_ARE_3D: 64,
  CANONIZER_CREATE_PSEUDO_STEREO_GROUPS: 128,
  CANONIZER_DISTINGUISH_RACEMIC_OR_GROUPS: 256,
  CANONIZER_TIE_BREAK_FREE_VALENCE_ATOMS: 512,
  CANONIZER_ENCODE_ATOM_CUSTOM_LABELS_WITHOUT_RANKING: 1024,
  CANONIZER_NEGLECT_ANY_STEREO_INFORMATION: 2048,

  // ESR types
  cESRTypeAbs: 0,
  cESRTypeAnd: 1,
  cESRTypeOr: 2,

  // Helper-array levels
  cHelperAll: 255,
  cHelperNone: 0,
  cHelperBitNeighbours: 1,
  cHelperBitRingsSimple: 2,
  cHelperBitRings: 4,
  cHelperBitParities: 8,
  cHelperBitCIP: 16,
  cHelperBitSymmetrySimple: 32,
  cHelperBitSymmetryStereoHeterotopicity: 64,
  cHelperBitIncludeNitrogenParities: 128,
  cHelperBitsStereo: 248,
  cHelperNeighbours: 1,
  cHelperRingsSimple: 3,
  cHelperRings: 7,
  cHelperParities: 15,
  cHelperCIP: 31,
  cHelperSymmetrySimple: 63,
  cHelperSymmetryStereoHeterotopicity: 95,

  // Max atomic number + pseudo-atom group flags
  cMaxAtomicNo: 190,
  cPseudoAtomsHydrogenIsotops: 1,
  cPseudoAtomsRGroups: 2,
  cPseudoAtomsAGroups: 4,
  cPseudoAtomR: 8,
  cPseudoAtomA: 16,
  cPseudoAtomX: 32,
  cPseudoAtomsAminoAcids: 64,
  cPseudoAtomPolymer: 128,
  cPseudoAtomAttachmentPoint: 256,
  cPseudoAtomsAll: 511,

  // Atom-label table (index = atomic number, length 191, index 0..190)
  cAtomLabel: ['?','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og','??','??','??','??','??','??','??','??','??','??','R4','R5','R6','R7','R8','R9','R10','R11','R12','R13','R14','R15','R16','R1','R2','R3','A','A1','A2','A3','??','??','D','T','X','R','H2','H+','Nnn','HYD','Pol','??','??','??','??','??','??','??','??','??','??','??','Ala','Arg','Asn','Asp','Cys','Gln','Glu','Gly','His','Ile','Leu','Lys','Met','Phe','Pro','Ser','Thr','Trp','Tyr','Val'],

  // Atom query features (cAtomQF*) — decimal of the Java hex longs
  cAtomQFNoOfBits: 46,
  cAtomQFAromStateBits: 2,
  cAtomQFAromStateShift: 1,
  cAtomQFRingStateBits: 4,
  cAtomQFRingStateShift: 3,
  cAtomQFHydrogenBits: 4,
  cAtomQFHydrogenShift: 7,
  cAtomQFPiElectronBits: 3,
  cAtomQFPiElectronShift: 14,
  cAtomQFNeighbourBits: 5,
  cAtomQFNeighbourShift: 17,
  cAtomQFSmallRingSizeBits: 3,
  cAtomQFSmallRingSizeShift: 22,
  cAtomQFChargeBits: 3,
  cAtomQFChargeShift: 25,
  cAtomQFRxnParityBits: 2,
  cAtomQFRxnParityShift: 30,
  cAtomQFNewRingSizeBits: 7,
  cAtomQFNewRingSizeShift: 32,
  cAtomQFENeighbourBits: 5,
  cAtomQFENeighbourShift: 39,
  cAtomQFStereoStateBits: 2,
  cAtomQFStereoStateShift: 44,
  cAtomQFSimpleFeatures: 140187971602430,
  cAtomQFNarrowing: 140733461823486,
  cAtomQFDepictedFeatures: 2251796055580671,
  cAtomQFAny: 1,
  cAtomQFAromState: 70368744177670,
  cAtomQFAromatic: 2,
  cAtomQFNotAromatic: 4,
  cAtomQFRingState: 120,
  cAtomQFNotChain: 8,
  cAtomQFNot2RingBonds: 16,
  cAtomQFNot3RingBonds: 32,
  cAtomQFNot4RingBonds: 64,
  cAtomQFHydrogen: 1920,
  cAtomQFNot0Hydrogen: 128,
  cAtomQFNot1Hydrogen: 256,
  cAtomQFNot2Hydrogen: 512,
  cAtomQFNot3Hydrogen: 1024,
  cAtomQFNoMoreNeighbours: 2048,
  cAtomQFMoreNeighbours: 4096,
  cAtomQFMatchStereo: 8192,
  cAtomQFPiElectrons: 114688,
  cAtomQFNot0PiElectrons: 16384,
  cAtomQFNot1PiElectron: 32768,
  cAtomQFNot2PiElectrons: 65536,
  cAtomQFNeighbours: 4063232,
  cAtomQFNot0Neighbours: 131072,
  cAtomQFNot1Neighbour: 262144,
  cAtomQFNot2Neighbours: 524288,
  cAtomQFNot3Neighbours: 1048576,
  cAtomQFNot4Neighbours: 2097152,
  cAtomQFSmallRingSize: 29360128,
  cAtomQFCharge: 234881024,
  cAtomQFNotChargeNeg: 33554432,
  cAtomQFNotCharge0: 67108864,
  cAtomQFNotChargePos: 134217728,
  cAtomQFFlatNitrogen: 268435456,
  cAtomQFExcludeGroup: 536870912,
  cAtomQFRxnParityHint: 3221225472,
  cAtomQFRxnParityRetain: 1073741824,
  cAtomQFRxnParityInvert: 2147483648,
  cAtomQFRxnParityRacemize: 3221225472,
  cAtomQFNewRingSize: 545460846592,
  cAtomQFRingSize0: 4294967296,
  cAtomQFRingSize3: 8589934592,
  cAtomQFRingSize4: 17179869184,
  cAtomQFRingSize5: 34359738368,
  cAtomQFRingSize6: 68719476736,
  cAtomQFRingSize7: 137438953472,
  cAtomQFRingSizeLarge: 274877906944,
  cAtomQFENeighbours: 17042430230528,
  cAtomQFNot0ENeighbours: 549755813888,
  cAtomQFNot1ENeighbour: 1099511627776,
  cAtomQFNot2ENeighbours: 2199023255552,
  cAtomQFNot3ENeighbours: 4398046511104,
  cAtomQFNot4ENeighbours: 8796093022208,
  cAtomQFStereoState: 52776558133248,
  cAtomQFIsStereo: 17592186044416,
  cAtomQFIsNotStereo: 35184372088832,
  cAtomQFHeteroAromatic: 70368744177664,

  // Bond query features (cBondQF*) — plain 32-bit ints
  cBondQFNoOfBits: 23,
  cBondQFBondTypesBits: 5,
  cBondQFBondTypesShift: 0,
  cBondQFRareBondTypesBits: 2,
  cBondQFRareBondTypesShift: 5,
  cBondQFRingStateBits: 2,
  cBondQFRingStateShift: 7,
  cBondQFBridgeBits: 8,
  cBondQFBridgeShift: 9,
  cBondQFBridgeMinBits: 4,
  cBondQFBridgeMinShift: 9,
  cBondQFBridgeSpanBits: 4,
  cBondQFBridgeSpanShift: 13,
  cBondQFRingSizeBits: 3,
  cBondQFRingSizeShift: 17,
  cBondQFAromStateBits: 2,
  cBondQFAromStateShift: 21,
  cBondQFAllFeatures: 16777215,
  cBondQFSimpleFeatures: 6291967,
  cBondQFDepictedFeatures: 8388480,
  cBondQFNarrowing: 6291840,
  cBondQFBondTypes: 31,
  cBondQFRareBondTypes: 96,
  cBondQFSingle: 1,
  cBondQFDouble: 2,
  cBondQFTriple: 4,
  cBondQFDelocalized: 8,
  cBondQFMetalLigand: 16,
  cBondQFQuadruple: 32,
  cBondQFQuintuple: 64,
  cBondQFRingState: 384,
  cBondQFNotRing: 128,
  cBondQFRing: 256,
  cBondQFBridge: 130560,
  cBondQFBridgeMin: 7680,
  cBondQFBridgeSpan: 122880,
  cBondQFRingSize: 917504,
  cBondQFMatchStereo: 1048576,
  cBondQFAromState: 6291456,
  cBondQFAromatic: 2097152,
  cBondQFNotAromatic: 4194304,
  cBondQFMatchFormalOrder: 8388608,
});

// =========================================================================
// Attach ReactionEncoder static constants (from
// com/actelion/research/chem/reaction/ReactionEncoder.java).
// index.ts already has `export const ReactionEncoder = ocl.ReactionEncoder;`.
// =========================================================================
Object.assign(ReactionEncoder, {
  INCLUDE_MAPPING: 1,
  INCLUDE_COORDS: 2,
  INCLUDE_DRAWING_OBJECTS: 4,
  INCLUDE_CATALYSTS: 8,
  INCLUDE_ALL: 15,
  INCLUDE_RXN_CODE_ONLY: 0,
  INCLUDE_DEFAULT: 3, // INCLUDE_MAPPING | INCLUDE_COORDS
  RETAIN_REACTANT_AND_PRODUCT_ORDER: 16,
  MOLECULE_DELIMITER: ' ',
  PRODUCT_IDENTIFIER: '!',
  CATALYST_DELIMITER: '+',
  OBJECT_DELIMITER: '#',
});

// TeaVM @JSExport getters surface as methods (getX()), not properties. To match
// the openchemlib-js property API, MoleculeProperties is a thin getter wrapper.
const RawMoleculeProperties = ocl.MoleculeProperties;
export class MoleculeProperties implements IMoleculeProperties {
  readonly #raw: InstanceType<typeof RawMoleculeProperties>;

  constructor(molecule: IMolecule) {
    this.#raw = new RawMoleculeProperties(molecule);
  }

  get acceptorCount(): number {
    return this.#raw.getAcceptorCount();
  }

  get donorCount(): number {
    return this.#raw.getDonorCount();
  }

  get logP(): number {
    return this.#raw.getLogP();
  }

  get logS(): number {
    return this.#raw.getLogS();
  }

  get polarSurfaceArea(): number {
    return this.#raw.getPolarSurfaceArea();
  }

  get rotatableBondCount(): number {
    return this.#raw.getRotatableBondCount();
  }

  get stereoCenterCount(): number {
    return this.#raw.getStereoCenterCount();
  }
}

// ============================================================================
// molecule-expansion-2 integration. Insert this block in src/index.ts AFTER the
// existing `export const Molecule = ocl.Molecule;` (and after the other
// Object.assign blocks), and BEFORE `export { loadOCL } from './wasm/load.ts';`.
//
// It mirrors openchemlib-js lib/extend/{extend_from_molfile,extend_to_molfile,
// index}.js. The primitive @JSExport methods (changeCustomLabelPosition,
// getCompactCopy, getAtomCustomLabel, toMolfileV3, fromMolfileWithAtomMap,
// getIDCodeAndCoordinates, query features, etc.) live in the Java facade; only
// the molfile string post-processing + options handling + fromText/getOCL are
// JS-side, exactly as in openchemlib-js.
//
// Import the option types at the top of index.ts:
//   import type { ToMolfileOptions, FromMolfileOptions } from './types.ts';
// `ocl` is the default-exported object already in scope.
// ----------------------------------------------------------------------------

const CUSTOM_ATOM_LABELS_TAGS = [
  'M  STY',
  'M  SLB',
  'M  SAL',
  'M  SDT',
  'M  SDD',
  'M  SED',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MoleculeClass = Molecule as any;

const _toMolfile = MoleculeClass.prototype.toMolfile;
MoleculeClass.prototype.toMolfile = function toMolfile(
  options: ToMolfileOptions = {},
) {
  const molecule = this.getCompactCopy();
  const {
    includeCustomAtomLabelsAsALines = false,
    includeCustomAtomLabelsAsVLines = false,
    customLabelPosition,
    removeCustomAtomLabels = false,
  } = options;
  molecule.changeCustomLabelPosition(customLabelPosition);

  const molfile = _toMolfile.call(molecule);

  if (
    !includeCustomAtomLabelsAsALines &&
    !includeCustomAtomLabelsAsVLines &&
    !removeCustomAtomLabels
  ) {
    return molfile;
  }

  const eol = molfile.includes('\r\n') ? '\r\n' : '\n';
  let lines = molfile.split(eol);
  if (removeCustomAtomLabels) {
    lines = lines.filter(
      (line: string) =>
        !CUSTOM_ATOM_LABELS_TAGS.some((tag) => line.startsWith(tag)),
    );
  }
  if (lines.length < 4 || !lines[3].includes('V2000')) {
    return molfile;
  }
  const newLines: string[] = [];
  for (let i = 0; i < molecule.getAllAtoms(); i++) {
    const label = molecule.getAtomCustomLabel(i);
    if (label) {
      const paddedAtomNumber = String(i + 1).padStart(3, ' ');
      if (includeCustomAtomLabelsAsALines) {
        newLines.push(`A  ${paddedAtomNumber}`, label);
      }
      if (includeCustomAtomLabelsAsVLines) {
        newLines.push(`V  ${paddedAtomNumber} ${label}`);
      }
    }
  }
  const mEndIndex = lines.findIndex((line: string) => line.startsWith('M  END'));
  if (mEndIndex === -1) {
    return molfile;
  }
  lines.splice(mEndIndex, 0, ...newLines);
  return lines.join(eol);
};

const _fromMolfile = MoleculeClass.fromMolfile;
MoleculeClass.fromMolfile = function fromMolfile(
  molfile: string,
  options: FromMolfileOptions = {},
) {
  const { customLabelPosition } = options;
  const molecule = _fromMolfile.call(this, molfile);
  const eol = molfile.includes('\r\n') ? '\r\n' : '\n';
  const lines = molfile.split(eol);
  if (lines.length < 4 || !lines[3].includes('V2000')) {
    return molecule;
  }
  const possibleLines = lines.slice(
    4 + molecule.getAllAtoms() + molecule.getAllBonds(),
  );
  for (let i = 0; i < possibleLines.length; i++) {
    const line = possibleLines[i];
    if (line.startsWith('A  ')) {
      const atom = Number(line.slice(3));
      const valueLine = possibleLines[i + 1]?.trim();
      i++;
      if (
        !Number.isNaN(atom) &&
        atom <= molecule.getAllAtoms() &&
        valueLine &&
        !molecule.getAtomCustomLabel(atom - 1)
      ) {
        molecule.setAtomCustomLabel(atom - 1, valueLine);
      }
    }
    if (line.startsWith('V  ')) {
      const parts = line.split(' ').filter(Boolean);
      if (parts.length >= 3) {
        const atom = Number(parts[1]);
        const label = parts.slice(2).join(' ');
        if (
          !Number.isNaN(atom) &&
          atom <= molecule.getAllAtoms() &&
          !molecule.getAtomCustomLabel(atom - 1)
        ) {
          molecule.setAtomCustomLabel(atom - 1, label);
        }
      }
    }
    if (line.startsWith('M  ZZC')) {
      const atom = Number(line.slice(7, 10).trim());
      const label = line.slice(10).trim();
      if (atom && label) {
        molecule.setAtomCustomLabel(atom - 1, label);
      }
    }
  }
  molecule.changeCustomLabelPosition(customLabelPosition);
  return molecule;
};

function parseMoleculeFromText(text: string) {
  if (!text) return null;
  if (text.includes('V2000') || text.includes('V3000')) {
    return MoleculeClass.fromMolfile(text);
  }
  try {
    return MoleculeClass.fromSmiles(text);
  } catch {
    // ignore
  }
  try {
    return MoleculeClass.fromIDCode(text);
  } catch {
    // ignore
  }
  return null;
}

MoleculeClass.fromText = function fromText(text: string) {
  const molecule = parseMoleculeFromText(text);
  if (molecule && molecule.getAllAtoms() > 0) {
    return molecule;
  }
  return null;
};

MoleculeClass.prototype.getOCL = function getOCL() {
  return OCL;
};
// ============================================================================

export { loadOCL } from './wasm/load.ts';

export type {
  CountOptions,
  MatchOptions,
  Molecule as IMolecule,
  SmilesOptions,
  SSSearcher as ISSSearcher,
  SSSearcherWithIndex as ISSSearcherWithIndex,
  SmilesParser as ISmilesParser,
} from './types.ts';

// Default export: a normal object with enumerable class properties (the raw
// teavm.exports has non-enumerable members, which breaks `Object.keys`).
const OCL = {
  Molecule,
  SmilesParser,
  SSSearcher,
  SSSearcherWithIndex,
  ForceFieldMMFF94,
  ConformerGenerator,
  DruglikenessPredictor,
  ToxicityPredictor,
  DrugScoreCalculator,
  Canonizer,
  CanonizerUtil,
  Reaction,
  ReactionEncoder,
  Reactor,
  Transformer,
  SDFileParser,
  Util,
  MoleculeProperties,
};

export default OCL;
