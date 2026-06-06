package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.reaction.Transformer},
 * mirroring the openchemlib-js {@code Transformer} API. A transformer applies a
 * single-reactant / single-product, fully-mapped transformation rule to one or
 * more real-world molecules.
 */
public class Transformer {
  private final com.actelion.research.chem.reaction.Transformer transformer;

  /**
   * Builds a transformer from a reactant fragment, a product fragment and a
   * name. Both fragments must be fully atom-mapped (matching map numbers define
   * which atoms are the same on each side).
   *
   * @param reactant the reactant query fragment
   * @param product the product query fragment
   * @param name the transformation name
   */
  @JSExport
  public Transformer(Molecule reactant, Molecule product, String name) {
    this.transformer =
        new com.actelion.research.chem.reaction.Transformer(
            reactant.getStereoMolecule(), product.getStereoMolecule(), name);
  }

  /**
   * Runs a substructure search of the transformation's reactant on the given
   * molecule to determine how many valid transformations can be applied. Matches
   * that would exceed an atom valence are discarded.
   *
   * @param molecule the molecule to transform
   * @param countMode ignored; overlapping matches are always counted (matches
   *     the openchemlib-js behavior)
   * @return the number of valid transformations that can be applied
   */
  @JSExport
  public int setMolecule(Molecule molecule, int countMode) {
    return transformer.setMolecule(
        molecule.getStereoMolecule(),
        com.actelion.research.chem.SSSearcher.cCountModeOverlapping);
  }

  /**
   * Applies the transformation to the given molecule using the chosen
   * substructure match. Call {@link #setMolecule} first to compute the matches.
   *
   * @param molecule the molecule to transform in place
   * @param matchNo the match index, smaller than the count returned by
   *     {@link #setMolecule}
   */
  @JSExport
  public void applyTransformation(Molecule molecule, int matchNo) {
    transformer.applyTransformation(molecule.getStereoMolecule(), matchNo);
  }
}
