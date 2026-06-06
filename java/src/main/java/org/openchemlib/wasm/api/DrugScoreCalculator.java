package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.prediction.DrugScoreCalculator},
 * mirroring the openchemlib-js {@code DrugScoreCalculator} API.
 */
public final class DrugScoreCalculator {
  private DrugScoreCalculator() {}

  /**
   * Computes an overall drug score from the individual property scores and the
   * list of toxicity risks.
   *
   * @param cLogP the predicted logP value
   * @param solubility the predicted aqueous solubility
   * @param molweight the molecular weight
   * @param druglikeness the druglikeness score
   * @param toxRisks the toxicity risk levels, or null/undefined for none
   * @return the drug score
   */
  @JSExport
  public static double calculate(
      double cLogP, double solubility, double molweight, double druglikeness, int[] toxRisks) {
    return com.actelion.research.chem.prediction.DrugScoreCalculator.calculate(
        cLogP, solubility, molweight, druglikeness, toxRisks);
  }
}
