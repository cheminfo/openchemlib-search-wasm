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
