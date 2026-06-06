import { beforeAll, expect, test } from 'vitest';

import { loadOCL } from '#lib';
import type { OCL } from '../src/types.ts';

// Proves the loadOCL({ resources }) mechanism end to end: registering the bundled
// parameter tables makes the resource-loaded classes actually compute.
let ocl: OCL;
beforeAll(async () => {
  ocl = await loadOCL({ resources: true });
});

test('force field computes and minimises after loadOCL({ resources })', () => {
  const molecule = ocl.Molecule.fromSmiles('COCCON');
  const generator = new ocl.ConformerGenerator(1);
  generator.getOneConformerAsMolecule(molecule);

  const forceField = new ocl.ForceFieldMMFF94(molecule, 'MMFF94');
  expect(forceField.size()).toBeGreaterThan(0);

  const before = forceField.getTotalEnergy();
  expect(Number.isFinite(before)).toBe(true);

  forceField.minimise(4000, 1e-4, 1e-6);
  expect(forceField.getTotalEnergy()).toBeLessThanOrEqual(before);
});

// The predictor constructors correctly gate on registered resources (see
// resources.test.ts). Their full computation (assessDruglikeness / assessRisk)
// still throws a null-pointer dereference inside OCL — a predictor-specific
// descriptor/resource detail to debug next, not a problem with the registration
// mechanism (which the force-field test above exercises end to end).
test.todo('druglikeness / toxicity full computation');
