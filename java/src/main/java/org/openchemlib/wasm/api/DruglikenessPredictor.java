package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/** WASM facade for the druglikeness predictor. Requires registered resources. */
public class DruglikenessPredictor {
  private final com.actelion.research.chem.prediction.DruglikenessPredictor predictor;

  /** Creates a druglikeness predictor. */
  @JSExport
  public DruglikenessPredictor() {
    Resources.checkHasRegistered();
    this.predictor = new com.actelion.research.chem.prediction.DruglikenessPredictor();
  }

  /**
   * Assesses the druglikeness of a molecule.
   *
   * @param molecule the molecule
   * @return the druglikeness score
   */
  @JSExport
  public double assessDruglikeness(Molecule molecule) {
    return predictor.assessDruglikeness(molecule.getStereoMolecule(), () -> false);
  }

  /**
   * The textual druglikeness description.
   *
   * @param molecule the molecule
   * @return the description
   */
  @JSExport
  public String getDruglikenessString(Molecule molecule) {
    return predictor.getDruglikenessString(molecule.getStereoMolecule());
  }
}
