package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/** WASM facade for the toxicity predictor. Requires registered resources. */
public class ToxicityPredictor {
  private final com.actelion.research.chem.prediction.ToxicityPredictor predictor;

  /** Creates a toxicity predictor. */
  @JSExport
  public ToxicityPredictor() {
    Resources.checkHasRegistered();
    this.predictor = new com.actelion.research.chem.prediction.ToxicityPredictor();
  }

  /**
   * Assesses a risk type for a molecule.
   *
   * @param molecule the molecule
   * @param riskType the risk type
   * @return the risk level
   */
  @JSExport
  public int assessRisk(Molecule molecule, int riskType) {
    return predictor.assessRisk(molecule.getStereoMolecule(), riskType, () -> false);
  }
}
