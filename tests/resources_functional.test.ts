import { expect, test } from 'vitest';

import {
  ConformerGenerator,
  DruglikenessPredictor,
  ForceFieldMMFF94,
  Molecule,
  ToxicityPredictor,
} from '#lib';

// The parameter tables are bundled inside the wasm, so the resource-loaded
// classes work with no registration step.

test('MMFF94 force field computes and minimises', () => {
  const molecule = Molecule.fromSmiles('COCCON');
  new ConformerGenerator(1).getOneConformerAsMolecule(molecule);

  const forceField = new ForceFieldMMFF94(molecule, 'MMFF94');
  expect(forceField.size()).toBeGreaterThan(0);

  const before = forceField.getTotalEnergy();
  expect(Number.isFinite(before)).toBe(true);

  forceField.minimise(4000, 1e-4, 1e-6);
  expect(forceField.getTotalEnergy()).toBeLessThanOrEqual(before);
});

test('predictors compute, byte-identical to openchemlib-js', () => {
  const molecule = Molecule.fromSmiles('COCCON');

  expect(new DruglikenessPredictor().assessDruglikeness(molecule)).toBe(
    -4.564473319220205,
  );
  // riskType 0 = mutagenic; 3 = RISK_HIGH
  expect(new ToxicityPredictor().assessRisk(molecule, 0)).toBe(3);
});
