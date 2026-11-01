package org.openchemlib.wasm;

import com.actelion.research.chem.IDCodeParser;
import com.actelion.research.chem.SSSearcher;
import com.actelion.research.chem.StereoMolecule;

/**
 * The stored function keys ({@link FunctionKeys}) run over a molecule: bit i is set when any
 * fragment of key i is a substructure of it, in SSSearcher's default match mode — the test {@link
 * Search#ssSearch} runs, so a key's bit and a search for its fragments always agree.
 *
 * <p>A fragment is only tried on a molecule whose FragFp and screen hold the fragment's own query
 * FragFp and screen ({@link Screen#ofQuery}). Every true match does, so the bits are unchanged, and
 * most of the 1,628 substructure tests are skipped. The fragments are parsed once, on first use;
 * their query words come from {@link FunctionKeys#QUERY_BITS}, where building them here would cost
 * a second of substructure tests in every thread.
 */
final class Functions {
  static final Functions STORED = new Functions(FunctionKeys.IDCODES, FunctionKeys.QUERY_BITS);

  /** The words of a FragFp and of a screen: 512 bits each. */
  private static final int WORDS = 16;

  /** Where the screen's bits start in a {@link FunctionKeys#QUERY_BITS} entry. */
  private static final int SCREEN_OFFSET = 512;

  private final StereoMolecule[][] keys;

  /** Per key and fragment, the FragFp words every molecule holding the fragment has. */
  private final int[][][] indexes;

  /** Per key and fragment, the screen words every molecule holding the fragment has. */
  private final int[][][] screens;

  private final SSSearcher searcher = new SSSearcher();

  private Functions(String[][] keyIDCodes, String[][] keyQueryBits) {
    IDCodeParser parser = new IDCodeParser(false);
    keys = new StereoMolecule[keyIDCodes.length][];
    indexes = new int[keyIDCodes.length][][];
    screens = new int[keyIDCodes.length][][];
    for (int key = 0; key < keyIDCodes.length; key++) {
      int count = keyIDCodes[key].length;
      keys[key] = new StereoMolecule[count];
      indexes[key] = new int[count][];
      screens[key] = new int[count][];
      for (int f = 0; f < count; f++) {
        StereoMolecule fragment = parser.getCompactMolecule(keyIDCodes[key][f]);
        fragment.setFragment(true);
        keys[key][f] = fragment;
        indexes[key][f] = new int[WORDS];
        screens[key][f] = new int[WORDS];
        readQueryBits(keyQueryBits[key][f], indexes[key][f], screens[key][f]);
      }
    }
  }

  /**
   * Sets the bits a {@link FunctionKeys#QUERY_BITS} entry lists: two base-32 digits per bit,
   * FragFp's below 512 and the screen's from 512.
   */
  private static void readQueryBits(String bits, int[] index, int[] screen) {
    for (int at = 0; at < bits.length(); at += 2) {
      int bit = digit(bits.charAt(at)) * 32 + digit(bits.charAt(at + 1));
      int[] words = bit < SCREEN_OFFSET ? index : screen;
      int position = bit % SCREEN_OFFSET;
      words[position >> 5] |= 1 << (31 - (position & 31));
    }
  }

  private static int digit(char character) {
    return character <= '9' ? character - '0' : character - 'a' + 10;
  }

  /**
   * The function words of a molecule.
   *
   * @param molecule a molecule, not a fragment
   * @param index its FragFp, as {@link Search#getIndexes} builds it
   * @param screen its screen, as {@link Search#getScreens} builds it
   * @return one bit per key, 32 keys per word, the first key in the highest bit of word 0
   */
  int[] ofMolecule(StereoMolecule molecule, int[] index, int[] screen) {
    int[] words = new int[(keys.length + 31) / 32];
    searcher.setMolecule(molecule);
    for (int key = 0; key < keys.length; key++) {
      for (int f = 0; f < keys[key].length; f++) {
        if (!contains(index, indexes[key][f]) || !contains(screen, screens[key][f])) {
          continue;
        }
        searcher.setFragment(keys[key][f]);
        if (searcher.isFragmentInMolecule()) {
          words[key >> 5] |= 1 << (31 - (key & 31));
          break;
        }
      }
    }
    return words;
  }

  /**
   * The stored keys' fragments, for a caller that checks the module against the dictionary.
   *
   * @return per key, in plane order, its fragment idcodes joined by a space; the keys joined by
   *     {@code '\n'}. Neither character occurs in an idcode.
   */
  static String keyIDCodes() {
    StringBuilder joined = new StringBuilder();
    for (int key = 0; key < FunctionKeys.IDCODES.length; key++) {
      if (key > 0) {
        joined.append('\n');
      }
      joined.append(String.join(" ", FunctionKeys.IDCODES[key]));
    }
    return joined.toString();
  }

  private static boolean contains(int[] molecule, int[] query) {
    for (int word = 0; word < query.length; word++) {
      if ((molecule[word] & query[word]) != query[word]) {
        return false;
      }
    }
    return true;
  }
}
