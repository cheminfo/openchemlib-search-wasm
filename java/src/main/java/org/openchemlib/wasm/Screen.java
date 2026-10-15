package org.openchemlib.wasm;

import com.actelion.research.chem.IDCodeParser;
import com.actelion.research.chem.Molecule;
import com.actelion.research.chem.SSSearcher;
import com.actelion.research.chem.SSSearcherWithIndex;
import com.actelion.research.chem.StereoMolecule;

/**
 * A substructure screen defined by a list of key fragments: bit i is set when key i is found by
 * SSSearcher in OpenChemLib's index match mode. This is FragFp's own loop ({@code
 * SSSearcherWithIndex.createLongIndex}), run over any key list.
 *
 * <p>A molecule is a candidate for a query only if every bit of the query's screen is set in its
 * own. Molecules are indexed exactly as FragFp indexes them. Queries are indexed on the fragment
 * SSSearcher actually matches, which {@code SSSearcherWithIndex} does not do yet:
 *
 * <ul>
 *   <li>exclude-group atoms are removed with {@code copyMoleculeByAtoms(…, true)}, as SSSearcher
 *       removes them, so the bonds of an aromatic ring they cut stay delocalized
 *       (Actelion/openchemlib#177);
 *   <li>a query with a "match formal bond order" bond gets no bits, since a key cannot tell which
 *       bond types such a bond stands for (also #177);
 *   <li>a key atom with ring sizes F is found on a query atom with ring sizes M only when M is not 0
 *       and M ⊆ F, a test SSSearcher skips when the molecule is a fragment
 *       (Actelion/openchemlib#178).
 * </ul>
 */
final class Screen {
  /** FragFp's 512 keys, so that a query's FragFp gets the same treatment as its screen. */
  static final Screen FRAGFP = new Screen(SSSearcherWithIndex.cKeyIDCode);

  /** The screen dictionary, {@link ScreenKeys}. */
  static final Screen DICTIONARY = new Screen(ScreenKeys.IDCODES);

  private final StereoMolecule[] keys;

  /** Per key, the ring sizes each of its atoms requires, or null when none does. */
  private final long[][] keyRingSizes;

  private final SSSearcher searcher = new SSSearcher();

  private Screen(String[] keyIDCodes) {
    IDCodeParser parser = new IDCodeParser(false);
    keys = new StereoMolecule[keyIDCodes.length];
    keyRingSizes = new long[keyIDCodes.length][];
    for (int i = 0; i < keys.length; i++) {
      StereoMolecule key = parser.getCompactMolecule(keyIDCodes[i]);
      keys[i] = key;
      for (int atom = 0; atom < key.getAllAtoms(); atom++) {
        long ringSizes = key.getAtomQueryFeatures(atom) & Molecule.cAtomQFNewRingSize;
        if (ringSizes != 0) {
          if (keyRingSizes[i] == null) {
            keyRingSizes[i] = new long[key.getAllAtoms()];
          }
          keyRingSizes[i][atom] = ringSizes;
        }
      }
    }
  }

  /**
   * The screen of a molecule.
   *
   * @param molecule a molecule, not a fragment
   * @return one bit per key, 32 keys per word, the first key in the highest bit of word 0
   */
  int[] ofMolecule(StereoMolecule molecule) {
    int[] screen = new int[(keys.length + 31) / 32];
    searcher.setMolecule(molecule);
    for (int i = 0; i < keys.length; i++) {
      searcher.setFragment(keys[i]);
      if (searcher.isFragmentInMolecule(SSSearcher.cIndexMatchMode)) {
        screen[i >> 5] |= 1 << (31 - (i & 31));
      }
    }
    return screen;
  }

  /**
   * The screen of a query: the bits every molecule the query matches has.
   *
   * @param query the query, flagged as a fragment
   * @return one bit per key, in the layout of {@link #ofMolecule}
   */
  int[] ofQuery(StereoMolecule query) {
    int[] screen = new int[(keys.length + 31) / 32];
    StereoMolecule matched = matchedFragment(query);
    if (matched == null) {
      return screen;
    }
    searcher.setMolecule(matched);
    for (int i = 0; i < keys.length; i++) {
      searcher.setFragment(keys[i]);
      if (keyRingSizes[i] == null
          ? searcher.isFragmentInMolecule(SSSearcher.cIndexMatchMode)
          : isFoundWithRingSizes(matched, keyRingSizes[i])) {
        screen[i >> 5] |= 1 << (31 - (i & 31));
      }
    }
    return screen;
  }

  /** Whether the current key has a match whose ring-size atoms all land on stricter query atoms. */
  private boolean isFoundWithRingSizes(StereoMolecule query, long[] ringSizes) {
    if (searcher.findFragmentInMolecule(SSSearcher.cCountModeRigorous, SSSearcher.cIndexMatchMode)
        == 0) {
      return false;
    }
    for (int[] match : searcher.getMatchList()) {
      boolean ringSizesHold = true;
      for (int atom = 0; atom < ringSizes.length && ringSizesHold; atom++) {
        if (ringSizes[atom] != 0) {
          long queryRingSizes =
              query.getAtomQueryFeatures(match[atom]) & Molecule.cAtomQFNewRingSize;
          ringSizesHold = queryRingSizes != 0 && (queryRingSizes & ~ringSizes[atom]) == 0;
        }
      }
      if (ringSizesHold) {
        return true;
      }
    }
    return false;
  }

  /**
   * The fragment SSSearcher matches for a query: the query itself, or a copy without its exclude
   * groups.
   *
   * @return null when the query has a "match formal bond order" bond
   */
  private static StereoMolecule matchedFragment(StereoMolecule query) {
    for (int bond = 0; bond < query.getAllBonds(); bond++) {
      if ((query.getBondQueryFeatures(bond) & Molecule.cBondQFMatchFormalOrder) != 0) {
        return null;
      }
    }
    boolean[] isKept = new boolean[query.getAllAtoms()];
    boolean hasExcludeGroup = false;
    for (int atom = 0; atom < isKept.length; atom++) {
      isKept[atom] = !query.isExcludeGroupAtom(atom);
      hasExcludeGroup |= !isKept[atom];
    }
    if (!hasExcludeGroup) {
      return query;
    }
    StereoMolecule copy = new StereoMolecule(query.getAllAtoms(), query.getAllBonds());
    query.copyMoleculeByAtoms(copy, isKept, true, null);
    copy.setFragment(true);
    return copy;
  }
}
