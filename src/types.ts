// Public types for the openchemlib-wasm API. These mirror the openchemlib-js
// surface; arrays are returned as typed arrays (an optimization-justified
// difference from the JS build, which uses plain arrays).

/** Options for SMILES parsing. */
export interface SmilesOptions {
  /** @default 'smiles' */
  smartsMode?: 'smiles' | 'smarts' | 'guess';
  /** @default false */
  skipCoordinateTemplates?: boolean;
  /** @default false */
  makeHydrogenExplicit?: boolean;
  /** @default false */
  noCactvs?: boolean;
  /** @default false */
  singleDotSeparator?: boolean;
  /** @default false */
  createSmartsWarnings?: boolean;
  /** @default false */
  noCoordinates?: boolean;
  /** @default false */
  noStereo?: boolean;
}

/** Match-mode options for substructure search. */
export interface MatchOptions {
  /** @default false */
  matchAtomCharge?: boolean;
  /** @default false */
  matchAtomMass?: boolean;
  /** @default false */
  matchDBondToDelocalized?: boolean;
  /** @default true */
  matchAromDBondToDelocalized?: boolean;
}

/** Count-mode options for findFragmentInMolecule. */
export interface CountOptions {
  /** @default 'overlapping' */
  countMode?:
    | 'overlapping'
    | 'existence'
    | 'firstMatch'
    | 'separated'
    | 'rigorous'
    | 'unique';
}

export interface Molecule {
  getIDCode(): string;
  getIDCoordinates(): string;
  toIsomericSmiles(): string;
  toMolfile(): string;
  isFragment(): boolean;
  setFragment(isFragment: boolean): void;
  getAllAtoms(): number;
  getAllBonds(): number;
  getAtomX(atom: number): number;
  getAtomY(atom: number): number;
}

export interface MoleculeConstructor {
  new (maxAtoms: number, maxBonds: number): Molecule;
  fromSmiles(smiles: string, options?: SmilesOptions): Molecule;
  fromIDCode(idCode: string): Molecule;
}

export interface SmilesParser {
  parseMolecule(smiles: string, options?: SmilesOptions): Molecule;
  getSmartsWarning(): string;
}

export interface SmilesParserConstructor {
  new (options?: SmilesOptions): SmilesParser;
}

export interface SSSearcher {
  setMolecule(molecule: Molecule): void;
  setFragment(fragment: Molecule): void;
  setMol(fragment: Molecule, molecule: Molecule): void;
  isFragmentInMolecule(): boolean;
  findFragmentInMolecule(options?: CountOptions): number;
  getMatchList(): Int32Array[];
}

export interface SSSearcherConstructor {
  new (options?: MatchOptions): SSSearcher;
}

export interface SSSearcherWithIndex {
  createIndex(molecule: Molecule): Int32Array;
  setFragment(fragment: Molecule, index: Int32Array): void;
  setMolecule(molecule: Molecule, index: Int32Array): void;
  isFragmentInMolecule(): boolean;
}

export interface SSSearcherWithIndexConstructor {
  new (): SSSearcherWithIndex;
  getKeyIDCode(): string[];
  getSimilarityTanimoto(index1: Int32Array, index2: Int32Array): number;
  getSimilarityAngleCosine(index1: Int32Array, index2: Int32Array): number;
  getIndexFromHexString(hex: string): Int32Array;
  getHexStringFromIndex(index: Int32Array): string;
  bitCount(value: number): number;
}

/** Options for conformer enumeration initialization. */
export interface ConformerInitOptions {
  /** @default 3 */
  strategy?: number;
  /** @default 100000 */
  maxTorsionSets?: number;
  /** @default false */
  use60degreeSteps?: boolean;
}

export interface ResourcesStatic {
  register(path: string, content: string): void;
}

export interface ForceFieldMMFF94 {
  size(): number;
  getTotalEnergy(): number;
  minimise(maxIts: number, gradTol: number, funcTol: number): number;
}

export interface ForceFieldMMFF94Constructor {
  new (
    molecule: Molecule,
    tablename: 'MMFF94' | 'MMFF94s' | 'MMFF94s+',
  ): ForceFieldMMFF94;
}

export interface ConformerGenerator {
  getOneConformerAsMolecule(molecule: Molecule): Molecule | null;
  initializeConformers(
    molecule: Molecule,
    options?: ConformerInitOptions,
  ): boolean;
  getNextConformerAsMolecule(molecule: Molecule | null): Molecule | null;
  getConformerCount(): number;
  getPotentialConformerCount(): number;
}

export interface ConformerGeneratorConstructor {
  new (seed: number): ConformerGenerator;
}

export interface DruglikenessPredictor {
  assessDruglikeness(molecule: Molecule): number;
  getDruglikenessString(molecule: Molecule): string;
}

export interface DruglikenessPredictorConstructor {
  new (): DruglikenessPredictor;
}

export interface ToxicityPredictor {
  assessRisk(molecule: Molecule, riskType: number): number;
}

export interface ToxicityPredictorConstructor {
  new (): ToxicityPredictor;
}

export interface OCL {
  Molecule: MoleculeConstructor;
  SmilesParser: SmilesParserConstructor;
  SSSearcher: SSSearcherConstructor;
  SSSearcherWithIndex: SSSearcherWithIndexConstructor;
  Resources: ResourcesStatic;
  ForceFieldMMFF94: ForceFieldMMFF94Constructor;
  ConformerGenerator: ConformerGeneratorConstructor;
  DruglikenessPredictor: DruglikenessPredictorConstructor;
  ToxicityPredictor: ToxicityPredictorConstructor;
}

/** Options for loadOCL. */
export interface LoadOptions {
  /** Register the bundled parameter tables (force field, predictors, torsion data). @default false */
  resources?: boolean;
}
