package org.openchemlib.wasm.api;

import java.util.List;
import org.teavm.jso.JSExport;
import org.teavm.jso.JSObject;
import org.teavm.jso.core.JSBoolean;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.SSSearcher} (substructure
 * search without a precomputed index), mirroring the openchemlib-js API.
 */
public class SSSearcher {
  private final com.actelion.research.chem.SSSearcher searcher;
  private final int matchMode;

  /**
   * Creates a searcher with the given match-mode options.
   *
   * @param options match options, or undefined for defaults
   */
  @JSExport
  public SSSearcher(Options.Match options) {
    this.matchMode = matchModeFromOptions(options);
    this.searcher = new com.actelion.research.chem.SSSearcher(matchMode);
  }

  /**
   * Sets the molecule to search in.
   *
   * @param molecule the target molecule
   */
  @JSExport
  public void setMolecule(Molecule molecule) {
    searcher.setMolecule(molecule.getStereoMolecule());
  }

  /**
   * Sets the query fragment.
   *
   * @param fragment the query fragment
   */
  @JSExport
  public void setFragment(Molecule fragment) {
    searcher.setFragment(fragment.getStereoMolecule());
  }

  /**
   * Sets both fragment and molecule at once.
   *
   * @param fragment the query fragment
   * @param molecule the target molecule
   */
  @JSExport
  public void setMol(Molecule fragment, Molecule molecule) {
    setMolecule(molecule);
    setFragment(fragment);
  }

  /**
   * Whether the fragment is a substructure of the molecule.
   *
   * @return true if found
   */
  @JSExport
  public boolean isFragmentInMolecule() {
    return searcher.isFragmentInMolecule();
  }

  /**
   * Counts fragment matches in the molecule.
   *
   * @param options count options (countMode), or undefined
   * @return the number of matches
   */
  @JSExport
  public int findFragmentInMolecule(Options.Count options) {
    return searcher.findFragmentInMolecule(countModeFromOptions(options), matchMode);
  }

  /**
   * The list of matches as arrays of atom indices. Each match is an Int32Array.
   *
   * @return the match list
   */
  @JSExport
  public int[][] getMatchList() {
    List<int[]> matches = searcher.getMatchList();
    int[][] result = new int[matches.size()][];
    for (int i = 0; i < matches.size(); i++) {
      result[i] = matches.get(i);
    }
    return result;
  }

  private static int matchModeFromOptions(Options.Match options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    int mode = 0;
    if (present) {
      if (options.isMatchAtomCharge()) {
        mode |= com.actelion.research.chem.SSSearcher.cMatchAtomCharge;
      }
      if (options.isMatchAtomMass()) {
        mode |= com.actelion.research.chem.SSSearcher.cMatchAtomMass;
      }
      if (options.isMatchDBondToDelocalized()) {
        mode |= com.actelion.research.chem.SSSearcher.cMatchDBondToDelocalized;
      }
    }
    // Default true to match the Java SSSearcher default, unless explicitly false.
    JSObject raw = present ? options.getMatchAromDBondToDelocalized() : null;
    boolean aromDelocalized = raw == null || JSObjects.isUndefined(raw) || raw.<JSBoolean>cast().booleanValue();
    if (aromDelocalized) {
      mode |= com.actelion.research.chem.SSSearcher.cMatchAromDBondToDelocalized;
    }
    return mode;
  }

  private static int countModeFromOptions(Options.Count options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    String countMode = present ? options.getCountMode() : null;
    if (countMode == null) {
      countMode = "overlapping";
    }
    switch (countMode) {
      case "overlapping":
        return com.actelion.research.chem.SSSearcher.cCountModeOverlapping;
      case "existence":
        return com.actelion.research.chem.SSSearcher.cCountModeExistence;
      case "firstMatch":
        return com.actelion.research.chem.SSSearcher.cCountModeFirstMatch;
      case "separated":
        return com.actelion.research.chem.SSSearcher.cCountModeSeparated;
      case "rigorous":
        return com.actelion.research.chem.SSSearcher.cCountModeRigorous;
      case "unique":
        return com.actelion.research.chem.SSSearcher.cCountModeUnique;
      default:
        throw new IllegalArgumentException("invalid count mode: " + countMode);
    }
  }
}
