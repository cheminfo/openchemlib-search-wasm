package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSArray;

/** WASM facade for the toxicity predictor. Requires registered resources. */
public class ToxicityPredictor {
  private final com.actelion.research.chem.prediction.ToxicityPredictor predictor;

  /** Creates a toxicity predictor. */
  @JSExport
  public ToxicityPredictor() {
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

  /**
   * The high- and medium-risk fragment detail for a given risk type, as an
   * array of {@code { type, value }} objects.
   *
   * @param molecule the molecule
   * @param riskType the risk type
   * @return the detail array
   */
  @JSExport
  public JSArray<Predictors.Detail> getDetail(Molecule molecule, int riskType) {
    return Predictors.convertParameterizedStringList(
        predictor.getDetail(molecule.getStereoMolecule(), riskType));
  }
}
