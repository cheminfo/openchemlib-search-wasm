package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSObjects;

/**
 * Builds the molecular-formula value object returned by
 * {@link Molecule#getMolecularFormula()}. It is a plain JS object with
 * {@code absoluteWeight}, {@code relativeWeight} and {@code formula} properties.
 * (TeaVM {@code @JSExport} getters surface as methods, not properties, so a
 * value object is used to match the openchemlib-js property API.)
 */
public final class MolecularFormula {
  private MolecularFormula() {}

  /** The molecular-formula value object. */
  public interface Result extends JSObject {
    @JSProperty
    void setAbsoluteWeight(double value);

    @JSProperty
    void setRelativeWeight(double value);

    @JSProperty
    void setFormula(String value);
  }

  static Result of(StereoMolecule molecule) {
    com.actelion.research.chem.MolecularFormula formula =
        new com.actelion.research.chem.MolecularFormula(molecule);
    Result result = JSObjects.create().cast();
    result.setAbsoluteWeight(formula.getAbsoluteWeight());
    result.setRelativeWeight(formula.getRelativeWeight());
    result.setFormula(formula.getFormula());
    return result;
  }
}
