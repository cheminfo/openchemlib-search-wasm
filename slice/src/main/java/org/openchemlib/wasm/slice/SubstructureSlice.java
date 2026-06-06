package org.openchemlib.wasm.slice;

import com.actelion.research.chem.SSSearcher;
import com.actelion.research.chem.SSSearcherWithIndex;
import com.actelion.research.chem.SmilesParser;
import com.actelion.research.chem.StereoMolecule;
import java.util.Arrays;
import org.teavm.jso.JSExport;

/**
 * Stage 2 vertical slice entry point. Drives the real OpenChemLib substructure
 * pipeline so we can prove the vendored source compiles under TeaVM WasmGC and
 * produces correct results at runtime.
 */
public final class SubstructureSlice {
  private SubstructureSlice() {}

  /**
   * WasmGC entry point.
   *
   * @param args ignored
   */
  public static void main(String[] args) {
    // intentionally empty
  }

  /**
   * Runs a fixed set of checks through the full pipeline and returns a report
   * string. Exercises SMILES parsing, aromaticity perception, idcode
   * canonicalization, long[] fingerprint creation and the index-screened
   * substructure search.
   *
   * @return a human-readable report of the pipeline results
   */
  @JSExport
  public static String selfTest() {
    try {
      SmilesParser parser = new SmilesParser();
      StereoMolecule ethylbenzene = parser.parseMolecule("CCc1ccccc1");
      StereoMolecule cyclohexane = parser.parseMolecule("C1CCCCC1");
      StereoMolecule pyridine = parser.parseMolecule("c1ccncc1");

      StereoMolecule benzene = parser.parseMolecule("c1ccccc1");
      benzene.setFragment(true);

      SSSearcherWithIndex searcher = new SSSearcherWithIndex();
      long[] benzeneIndex = searcher.createLongIndex(benzene);

      boolean inEthylbenzene = contains(searcher, benzene, benzeneIndex, ethylbenzene);
      boolean inCyclohexane = contains(searcher, benzene, benzeneIndex, cyclohexane);
      boolean inPyridine = contains(searcher, benzene, benzeneIndex, pyridine);

      return "idcode(ethylbenzene)="
          + ethylbenzene.getIDCode()
          + "; fingerprintWords="
          + benzeneIndex.length
          + "; benzene_in_ethylbenzene="
          + inEthylbenzene
          + "; benzene_in_cyclohexane="
          + inCyclohexane
          + "; benzene_in_pyridine="
          + inPyridine;
    } catch (Exception e) {
      return "ERROR: " + e.getClass().getName() + ": " + e.getMessage();
    }
  }

  /**
   * Index-screened substructure test between two SMILES.
   *
   * @param fragmentSmiles the query fragment as SMILES
   * @param moleculeSmiles the target molecule as SMILES
   * @return true if the fragment is a substructure of the molecule
   */
  @JSExport
  public static boolean isFragmentInMolecule(String fragmentSmiles, String moleculeSmiles) {
    try {
      SmilesParser parser = new SmilesParser();
      StereoMolecule fragment = parser.parseMolecule(fragmentSmiles);
      fragment.setFragment(true);
      StereoMolecule molecule = parser.parseMolecule(moleculeSmiles);

      SSSearcherWithIndex searcher = new SSSearcherWithIndex();
      long[] fragmentIndex = searcher.createLongIndex(fragment);
      return contains(searcher, fragment, fragmentIndex, molecule);
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * The canonical idcode of a molecule parsed from SMILES, to verify the
   * Canonizer compiles and runs.
   *
   * @param smiles input SMILES
   * @return the OpenChemLib idcode
   */
  @JSExport
  public static String smilesToIDCode(String smiles) {
    try {
      return new SmilesParser().parseMolecule(smiles).getIDCode();
    } catch (Exception e) {
      return "ERROR: " + e.getMessage();
    }
  }

  private static boolean contains(
      SSSearcherWithIndex searcher,
      StereoMolecule fragment,
      long[] fragmentIndex,
      StereoMolecule molecule) {
    long[] moleculeIndex = searcher.createLongIndex(molecule);
    searcher.setMolecule(molecule, moleculeIndex);
    searcher.setFragment(fragment, fragmentIndex);
    return searcher.isFragmentInMolecule();
  }

  // ---- Benchmark surface ----------------------------------------------------
  // Targets are parsed once and kept inside WASM (molecules cannot cross the
  // boundary), so the search loop measures only screening + matching, not
  // parsing or marshalling. The long[] fingerprint index uses native i64.

  private static StereoMolecule[] benchMolecules = new StereoMolecule[0];
  private static long[][] benchIndices = new long[0][];

  /**
   * Parses a newline-separated list of SMILES into the in-WASM target set and
   * precomputes a long[] fingerprint index for each. Returns the number that
   * parsed successfully.
   *
   * @param newlineSeparatedSmiles target molecules, one SMILES per line
   * @return count of successfully parsed targets
   */
  @JSExport
  public static int loadTargets(String newlineSeparatedSmiles) {
    String[] lines = newlineSeparatedSmiles.split("\n");
    SmilesParser parser = new SmilesParser();
    SSSearcherWithIndex indexer = new SSSearcherWithIndex();
    StereoMolecule[] molecules = new StereoMolecule[lines.length];
    long[][] indices = new long[lines.length][];
    int valid = 0;
    for (String line : lines) {
      try {
        StereoMolecule molecule = parser.parseMolecule(line);
        molecules[valid] = molecule;
        indices[valid] = indexer.createLongIndex(molecule);
        valid++;
      } catch (Exception e) {
        // skip molecules that fail to parse
      }
    }
    benchMolecules = Arrays.copyOf(molecules, valid);
    benchIndices = Arrays.copyOf(indices, valid);
    return valid;
  }

  /**
   * Counts how many loaded targets contain the query fragment, using the
   * index-screened path (long[] fingerprint screen, then graph isomorphism on
   * survivors).
   *
   * @param querySmiles the query fragment as SMILES
   * @return number of matching targets
   */
  @JSExport
  public static int countWithIndex(String querySmiles) {
    SmilesParser parser = new SmilesParser();
    StereoMolecule fragment;
    try {
      fragment = parser.parseMolecule(querySmiles);
    } catch (Exception e) {
      return -1;
    }
    fragment.setFragment(true);
    SSSearcherWithIndex searcher = new SSSearcherWithIndex();
    long[] queryIndex = searcher.createLongIndex(fragment);
    int count = 0;
    for (int i = 0; i < benchMolecules.length; i++) {
      searcher.setFragment(fragment, queryIndex);
      searcher.setMolecule(benchMolecules[i], benchIndices[i]);
      if (searcher.isFragmentInMolecule()) {
        count++;
      }
    }
    return count;
  }

  /**
   * Counts how many loaded targets contain the query fragment, running graph
   * isomorphism on every target with no fingerprint pre-screen.
   *
   * @param querySmiles the query fragment as SMILES
   * @return number of matching targets
   */
  @JSExport
  public static int countWithoutIndex(String querySmiles) {
    SmilesParser parser = new SmilesParser();
    StereoMolecule fragment;
    try {
      fragment = parser.parseMolecule(querySmiles);
    } catch (Exception e) {
      return -1;
    }
    fragment.setFragment(true);
    SSSearcher searcher = new SSSearcher();
    searcher.setFragment(fragment);
    int count = 0;
    for (int i = 0; i < benchMolecules.length; i++) {
      searcher.setMolecule(benchMolecules[i]);
      if (searcher.isFragmentInMolecule()) {
        count++;
      }
    }
    return count;
  }
}
