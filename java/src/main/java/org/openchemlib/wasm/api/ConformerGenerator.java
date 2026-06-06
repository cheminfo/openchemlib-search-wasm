package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSObjects;

/** WASM facade for the conformer generator. Requires registered resources. */
public class ConformerGenerator {
  private final org.openmolecules.chem.conf.gen.ConformerGenerator generator;

  /**
   * Creates a conformer generator.
   *
   * @param seed random seed (0 for a time-based seed in OCL)
   */
  @JSExport
  public ConformerGenerator(int seed) {
    Resources.checkHasRegistered();
    this.generator = new org.openmolecules.chem.conf.gen.ConformerGenerator(seed, false);
  }

  /**
   * Generates a single conformer into the given molecule.
   *
   * @param molecule the molecule to receive coordinates
   * @return the molecule, or null if none could be generated
   */
  @JSExport
  public Molecule getOneConformerAsMolecule(Molecule molecule) {
    StereoMolecule result = generator.getOneConformerAsMolecule(molecule.getStereoMolecule());
    return result == null ? null : molecule;
  }

  /**
   * Initializes conformer enumeration for a molecule.
   *
   * @param molecule the molecule
   * @param options strategy/maxTorsionSets/use60degreeSteps, or undefined
   * @return true if initialization succeeded
   */
  @JSExport
  public boolean initializeConformers(Molecule molecule, Options.ConformerInit options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    int strategy = present ? options.getStrategy() : 0;
    if (strategy == 0) {
      strategy = 3;
    }
    int maxTorsionSets = present ? options.getMaxTorsionSets() : 0;
    if (maxTorsionSets == 0) {
      maxTorsionSets = 100000;
    }
    boolean use60degreeSteps = present && options.isUse60degreeSteps();
    return generator.initializeConformers(
        molecule.getStereoMolecule(), strategy, maxTorsionSets, use60degreeSteps);
  }

  /**
   * Generates the next conformer.
   *
   * @param molecule the molecule to receive coordinates, or null
   * @return the molecule with the next conformer, or null when exhausted
   */
  @JSExport
  public Molecule getNextConformerAsMolecule(Molecule molecule) {
    StereoMolecule argument = molecule == null ? null : molecule.getStereoMolecule();
    StereoMolecule next = generator.getNextConformerAsMolecule(argument);
    if (next == null) {
      return null;
    }
    if (next == argument) {
      return molecule;
    }
    return new Molecule(next);
  }

  /**
   * Number of conformers generated so far.
   *
   * @return the conformer count
   */
  @JSExport
  public int getConformerCount() {
    return generator.getConformerCount();
  }

  /**
   * Estimated number of potential conformers.
   *
   * @return the potential conformer count
   */
  @JSExport
  public int getPotentialConformerCount() {
    return generator.getPotentialConformerCount();
  }
}
