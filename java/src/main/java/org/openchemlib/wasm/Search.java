package org.openchemlib.wasm;

import com.actelion.research.chem.IDCodeParserWithoutCoordinateInvention;
import com.actelion.research.chem.SSSearcher;
import com.actelion.research.chem.SSSearcherWithIndex;
import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSArrayReader;
import org.teavm.jso.core.JSString;
import org.teavm.jso.typedarrays.Float32Array;
import org.teavm.jso.typedarrays.Int32Array;
import org.teavm.jso.typedarrays.Uint8Array;

/**
 * The whole public surface of openchemlib-wasm: batch substructure search and batch similarity
 * search over a range of an array of idcodes.
 *
 * <p>Both write into a caller-owned JS typed array one entry at a time, so a caller that backs it
 * with a {@code SharedArrayBuffer} and splits the idcodes across workers can render progress while
 * the scan runs. Each index is written by exactly one worker, so no atomics are needed.
 *
 * <p>The idcodes arrive as a {@link JSArrayReader}, read one element at a time, rather than as a
 * {@code String[]}, which TeaVM converts whole before the method body starts. Reading lazily costs
 * under 1% on a full scan and is what lets a caller scan {@code [from, to)} repeatedly — to yield to
 * the event loop, to report progress, or to stop early — without re-converting the whole array on
 * every call.
 */
public final class Search {
  /** Entry i of an ssSearch result: the query is a substructure of idCodes[i]. */
  private static final byte MATCH = 1;

  /** Entry i of an ssSearch result: the query is not a substructure of idCodes[i]. */
  private static final byte NO_MATCH = 2;

  /** Entry i of an ssSearch result: idCodes[i] could not be parsed. */
  private static final byte UNPARSABLE = 3;

  /** Entry i of a similaritySearch result: idCodes[i] could not be parsed. */
  private static final float UNPARSABLE_SIMILARITY = -1;

  /**
   * Reusable ASCII buffer. IDCodeParser takes a {@code byte[]} and its {@code String} overload
   * calls {@code String.getBytes(UTF_8)}, which allocates one array per molecule — measurable when
   * the array holds hundreds of thousands of them.
   */
  private static byte[] asciiBuffer = new byte[256];

  /**
   * The last query, kept so a caller that scans one array in several calls — to yield to the event
   * loop, to report progress, or because it stops early — parses its query once instead of once per
   * call. That parse is ~13 µs, which is nothing against a batch of thousands but 63% of the cost of
   * a batch of one, and a caller stopping at the first few matches asks for exactly such batches.
   *
   * <p>Holding the fragment also keeps the helper arrays SSSearcher computes on it. Nothing outside
   * this class can reach these, and a scan is synchronous, so one entry is enough and needs no lock.
   */
  private static String cachedFragmentQuery;

  private static StereoMolecule cachedFragment;

  /** The last similarity query's fingerprint. Building one is ~947 µs, so this is worth far more. */
  private static String cachedIndexQuery;

  private static long[] cachedQueryIndex;

  private Search() {}

  /**
   * Tests a query fragment against {@code idCodes[from .. to)}, writing one status byte per
   * molecule.
   *
   * @param idCodeQuery the query, as an idcode; parsed as a fragment whatever its own fragment flag
   * @param idCodes the molecules to test
   * @param result written as the scan advances: 1 = match, 2 = no match, 3 = unparsable idcode.
   *     Indexed by the molecule's position in {@code idCodes}, not by its position in the range.
   * @param from the first index to test
   * @param to one past the last index to test
   * @return how many molecules in the range contain the fragment
   */
  @JSExport
  public static int ssSearch(
      String idCodeQuery,
      JSArrayReader<JSString> idCodes,
      Uint8Array result,
      int from,
      int to) {
    SSSearcher searcher = new SSSearcher();
    searcher.setFragment(parseFragment(idCodeQuery));
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule molecule = new StereoMolecule();
    int matched = 0;
    for (int i = from; i < to; i++) {
      byte code =
          parse(parser, molecule, idCodes.get(i).stringValue())
              ? match(searcher, molecule)
              : UNPARSABLE;
      if (code == MATCH) {
        matched++;
      }
      result.set(i, code);
    }
    return matched;
  }

  /**
   * Computes the Tanimoto similarity of a query against {@code idCodes[from .. to)} on
   * OpenChemLib's 512-bit FragFp, writing one float per molecule.
   *
   * <p>The fingerprint is built from each idcode, which costs far more than the similarity itself.
   * A caller that already stores fingerprints should compare those directly instead.
   *
   * @param idCodeQuery the query, as an idcode
   * @param idCodes the molecules to compare against
   * @param result written as the scan advances: the similarity in [0, 1], or -1 for an unparsable
   *     idcode. Indexed by the molecule's position in {@code idCodes}.
   * @param from the first index to compare
   * @param to one past the last index to compare
   * @return how many molecules in the range were parsed and compared
   */
  @JSExport
  public static int similaritySearch(
      String idCodeQuery,
      JSArrayReader<JSString> idCodes,
      Float32Array result,
      int from,
      int to) {
    SSSearcherWithIndex indexer = new SSSearcherWithIndex();
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    long[] queryIndex = queryIndex(indexer, idCodeQuery);
    StereoMolecule molecule = new StereoMolecule();
    int compared = 0;
    for (int i = from; i < to; i++) {
      if (parse(parser, molecule, idCodes.get(i).stringValue())) {
        long[] index = indexer.createLongIndex(molecule);
        result.set(i, SSSearcherWithIndex.getSimilarityTanimoto(queryIndex, index));
        compared++;
      } else {
        result.set(i, UNPARSABLE_SIMILARITY);
      }
    }
    return compared;
  }

  /** How many 32-bit words one molecule's fingerprint occupies. */
  private static final int INDEX_WORDS = 16;

  /**
   * Builds the 512-bit FragFp fingerprint of {@code idCodes[from .. to)}, sixteen 32-bit words per
   * molecule, in the layout {@code openchemlib-js}'s {@code createIndex} produces.
   *
   * <p>This is the expensive half of maintaining a fingerprint table: each fingerprint runs the
   * query fragment set over the molecule, so it costs roughly forty times a substructure test. The
   * 512 key fragments themselves are parsed once and held statically by OpenChemLib, so a batch pays
   * for them on its first molecule and never again.
   *
   * @param idCodes the molecules to fingerprint
   * @param result written as the scan advances, sixteen words at {@code 16 * i}. Must hold
   *     {@code 16 * idCodes.length} words. A molecule whose idcode will not parse gets sixteen
   *     zeros, which no non-empty query is a subset of.
   * @param from the first index to fingerprint
   * @param to one past the last index to fingerprint
   * @return how many molecules in the range were parsed and fingerprinted
   */
  @JSExport
  public static int getIndexes(
      JSArrayReader<JSString> idCodes, Int32Array result, int from, int to) {
    SSSearcherWithIndex indexer = new SSSearcherWithIndex();
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule molecule = new StereoMolecule();
    int built = 0;
    for (int i = from; i < to; i++) {
      int base = i * INDEX_WORDS;
      if (parse(parser, molecule, idCodes.get(i).stringValue())) {
        int[] index = indexer.createIndex(molecule);
        for (int word = 0; word < INDEX_WORDS; word++) {
          result.set(base + word, index[word]);
        }
        built++;
      } else {
        for (int word = 0; word < INDEX_WORDS; word++) {
          result.set(base + word, 0);
        }
      }
    }
    return built;
  }

  private static StereoMolecule parseFragment(String idCodeQuery) {
    if (idCodeQuery != null && idCodeQuery.equals(cachedFragmentQuery)) {
      return cachedFragment;
    }
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule fragment = new StereoMolecule();
    if (!parse(parser, fragment, idCodeQuery)) {
      throw new IllegalArgumentException("cannot parse the query idcode");
    }
    fragment.setFragment(true);
    cachedFragment = fragment;
    cachedFragmentQuery = idCodeQuery;
    return fragment;
  }

  private static long[] queryIndex(SSSearcherWithIndex indexer, String idCodeQuery) {
    if (idCodeQuery != null && idCodeQuery.equals(cachedIndexQuery)) {
      return cachedQueryIndex;
    }
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule query = new StereoMolecule();
    if (!parse(parser, query, idCodeQuery)) {
      throw new IllegalArgumentException("cannot parse the query idcode");
    }
    long[] index = indexer.createLongIndex(query);
    cachedQueryIndex = index;
    cachedIndexQuery = idCodeQuery;
    return index;
  }

  private static boolean parse(
      IDCodeParserWithoutCoordinateInvention parser, StereoMolecule molecule, String idCode) {
    int length = idCode == null ? 0 : idCode.length();
    if (length == 0) {
      return false;
    }
    if (asciiBuffer.length < length) {
      asciiBuffer = new byte[Math.max(length, asciiBuffer.length * 2)];
    }
    for (int i = 0; i < length; i++) {
      char character = idCode.charAt(i);
      if (character > 127) {
        return false;
      }
      asciiBuffer[i] = (byte) character;
    }
    // An idcode is a self-delimiting bit stream, so a valid one never reads past its own bytes and
    // never sees what follows. A malformed one does, and leaving the previous molecule's bytes there
    // would make its outcome depend on what was scanned before it.
    java.util.Arrays.fill(asciiBuffer, length, asciiBuffer.length, (byte) 0);
    parser.parse(molecule, asciiBuffer, 0);
    return molecule.getAllAtoms() != 0;
  }

  private static byte match(SSSearcher searcher, StereoMolecule molecule) {
    searcher.setMolecule(molecule);
    return searcher.isFragmentInMolecule() ? MATCH : NO_MATCH;
  }
}
