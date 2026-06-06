package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSArray;

/**
 * WASM facade for {@code com.actelion.research.chem.reaction.Reactor},
 * mirroring the openchemlib-js {@code Reactor} API. Applies a generic reaction
 * (a set of mapped transformation rules) to concrete reactant molecules and
 * enumerates the resulting products.
 */
public class Reactor {
  private final com.actelion.research.chem.reaction.Reactor reactor;

  /**
   * Creates a reactor from a generic reaction.
   *
   * @param reaction the generic (mapped) reaction
   */
  @JSExport
  public Reactor(Reaction reaction) {
    this.reactor = new com.actelion.research.chem.reaction.Reactor(reaction.getReaction(), true);
  }

  /**
   * Sets a concrete reactant at the given position.
   *
   * @param no the reactant position
   * @param reactant the reactant molecule
   * @return true if the reactant matches the corresponding generic reactant
   */
  @JSExport
  public boolean setReactant(int no, Molecule reactant) {
    return reactor.setReactant(no, reactant.getStereoMolecule());
  }

  /**
   * Enumerates the product sets produced by the reaction.
   *
   * <p>The outer array indexes distinct matches; the inner array holds the
   * products of one match.
   *
   * @return an array of product-molecule arrays (empty when there is no product)
   */
  @JSExport
  public JSArray<JSArray<Molecule>> getProducts() {
    StereoMolecule[][] products = reactor.getProducts();
    JSArray<JSArray<Molecule>> result = JSArray.create();
    if (products == null) {
      return result;
    }
    for (StereoMolecule[] line : products) {
      JSArray<Molecule> jsLine = JSArray.create();
      if (line != null) {
        for (StereoMolecule product : line) {
          jsLine.push(new Molecule(product));
        }
      }
      result.push(jsLine);
    }
    return result;
  }
}
