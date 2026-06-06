package org.openchemlib.wasm.api;

import com.actelion.research.chem.prediction.PropertyCalculator;
import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.prediction.PropertyCalculator},
 * mirroring the openchemlib-js {@code MoleculeProperties} API. Wraps the OCL
 * calculator and exposes its numeric getters as @JSExport methods.
 */
public class MoleculeProperties {
  private final PropertyCalculator calculator;

  /**
   * Computes molecule properties for the given molecule.
   *
   * @param molecule the molecule to analyze
   */
  @JSExport
  public MoleculeProperties(Molecule molecule) {
    this.calculator = new PropertyCalculator(molecule.getStereoMolecule());
  }

  /**
   * Number of hydrogen-bond acceptors (nitrogen and oxygen atoms).
   *
   * @return the acceptor count
   */
  @JSExport
  public int getAcceptorCount() {
    return calculator.getAcceptorCount();
  }

  /**
   * Number of hydrogen-bond donors (nitrogen and oxygen atoms bearing hydrogens).
   *
   * @return the donor count
   */
  @JSExport
  public int getDonorCount() {
    return calculator.getDonorCount();
  }

  /**
   * Predicted octanol-water partition coefficient (cLogP).
   *
   * @return the logP value
   */
  @JSExport
  public double getLogP() {
    return calculator.getLogP();
  }

  /**
   * Predicted aqueous solubility (logS).
   *
   * @return the logS value
   */
  @JSExport
  public double getLogS() {
    return calculator.getLogS();
  }

  /**
   * Predicted topological polar surface area.
   *
   * @return the polar surface area
   */
  @JSExport
  public double getPolarSurfaceArea() {
    return calculator.getPolarSurfaceArea();
  }

  /**
   * Number of rotatable bonds.
   *
   * @return the rotatable bond count
   */
  @JSExport
  public int getRotatableBondCount() {
    return calculator.getRotatableBondCount();
  }

  /**
   * Number of stereo centers.
   *
   * @return the stereo center count
   */
  @JSExport
  public int getStereoCenterCount() {
    return calculator.getStereoCenterCount();
  }
}
