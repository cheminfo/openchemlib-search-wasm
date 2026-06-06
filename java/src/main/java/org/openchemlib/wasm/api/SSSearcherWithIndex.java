package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.SSSearcherWithIndex}
 * (index-screened substructure search), mirroring the openchemlib-js API. The
 * fingerprint index is an {@code int[]} (surfaces in JS as an Int32Array).
 */
public class SSSearcherWithIndex {
  private final com.actelion.research.chem.SSSearcherWithIndex searcher =
      new com.actelion.research.chem.SSSearcherWithIndex();

  /** Creates an empty index-screened searcher. */
  @JSExport
  public SSSearcherWithIndex() {}

  /**
   * The idcodes of the substructure keys used by the fingerprint.
   *
   * @return the key idcodes
   */
  @JSExport
  public static String[] getKeyIDCode() {
    return com.actelion.research.chem.SSSearcherWithIndex.cKeyIDCode;
  }

  /**
   * Builds the fingerprint index for a molecule.
   *
   * @param molecule the molecule
   * @return the fingerprint index
   */
  @JSExport
  public int[] createIndex(Molecule molecule) {
    return searcher.createIndex(molecule.getStereoMolecule());
  }

  /**
   * Sets the query fragment and its precomputed index.
   *
   * @param fragment the query fragment
   * @param index the fragment fingerprint index
   */
  @JSExport
  public void setFragment(Molecule fragment, int[] index) {
    searcher.setFragment(fragment.getStereoMolecule(), index);
  }

  /**
   * Sets the target molecule and its precomputed index.
   *
   * @param molecule the target molecule
   * @param index the molecule fingerprint index
   */
  @JSExport
  public void setMolecule(Molecule molecule, int[] index) {
    searcher.setMolecule(molecule.getStereoMolecule(), index);
  }

  /**
   * Runs the index-screened substructure search.
   *
   * @return true if the fragment is found in the molecule
   */
  @JSExport
  public boolean isFragmentInMolecule() {
    return searcher.isFragmentInMolecule();
  }

  /**
   * Tanimoto similarity between two fingerprint indexes.
   *
   * @param index1 first index
   * @param index2 second index
   * @return the similarity in [0, 1]
   */
  @JSExport
  public static float getSimilarityTanimoto(int[] index1, int[] index2) {
    return com.actelion.research.chem.SSSearcherWithIndex.getSimilarityTanimoto(index1, index2);
  }

  /**
   * Angle-cosine similarity between two fingerprint indexes.
   *
   * @param index1 first index
   * @param index2 second index
   * @return the similarity in [0, 1]
   */
  @JSExport
  public static float getSimilarityAngleCosine(int[] index1, int[] index2) {
    return com.actelion.research.chem.SSSearcherWithIndex.getSimilarityAngleCosine(index1, index2);
  }

  /**
   * Decodes a fingerprint index from its hex-string form.
   *
   * @param hex the hex string
   * @return the fingerprint index
   */
  @JSExport
  public static int[] getIndexFromHexString(String hex) {
    return com.actelion.research.chem.SSSearcherWithIndex.getIndexFromHexString(hex);
  }

  /**
   * Encodes a fingerprint index as a hex string.
   *
   * @param index the fingerprint index
   * @return the hex string
   */
  @JSExport
  public static String getHexStringFromIndex(int[] index) {
    return com.actelion.research.chem.SSSearcherWithIndex.getHexStringFromIndex(index);
  }

  /**
   * Population count of a 32-bit integer.
   *
   * @param value the value
   * @return the number of set bits
   */
  @JSExport
  public static int bitCount(int value) {
    return Integer.bitCount(value);
  }
}
