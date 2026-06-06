package org.openchemlib.wasm.api;

import com.actelion.research.chem.prediction.ParameterizedStringList;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSArray;

/** WASM facade for the druglikeness predictor. Requires registered resources. */
public class DruglikenessPredictor {
  private final com.actelion.research.chem.prediction.DruglikenessPredictor predictor;

  /** Creates a druglikeness predictor. */
  @JSExport
  public DruglikenessPredictor() {
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

  /**
   * The fragment-contribution detail from the most recent druglikeness
   * assessment, as an array of {@code { type, value }} objects.
   *
   * @return the detail array
   */
  @JSExport
  public JSArray<Predictors.Detail> getDetail() {
    ParameterizedStringList detail = predictor.getDetail();
    if (detail == null) {
      throw new IllegalStateException("drug likeness must be assessed first");
    }
    return Predictors.convertParameterizedStringList(detail);
  }
}
