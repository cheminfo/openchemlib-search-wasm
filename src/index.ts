import type { Molecule as IMolecule, MoleculeProperties as IMoleculeProperties, Reaction as IReaction } from './types.ts';

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

export default ocl;
