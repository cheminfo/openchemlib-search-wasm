package org.openchemlib.wasm;

import com.actelion.research.chem.Canonizer;
import com.actelion.research.chem.CanonizerUtil;
import com.actelion.research.chem.IDCodeParserWithoutCoordinateInvention;
import com.actelion.research.chem.MoleculeNeutralizer;
import com.actelion.research.chem.SSSearcher;
import com.actelion.research.chem.SSSearcherWithIndex;
import com.actelion.research.chem.StereoMolecule;
import com.actelion.research.chem.TautomerHelper;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSArray;
import org.teavm.jso.core.JSArrayReader;
import org.teavm.jso.core.JSString;
import org.teavm.jso.typedarrays.BigInt64Array;
import org.teavm.jso.typedarrays.Float32Array;
import org.teavm.jso.typedarrays.Int32Array;
import org.teavm.jso.typedarrays.Uint8Array;

/**
 * The whole public surface of openchemlib-search-wasm: batch substructure search, batch similarity
 * search, batch FragFp fingerprinting and batch structure hashing over a range of an array of
 * idcodes.
 *
 * <p>All five write into a caller-owned JS typed array as they go, so a caller that backs it with a
 * {@code SharedArrayBuffer} and splits the idcodes across workers can render progress while the scan
 * runs. Each index is written by exactly one worker, so no atomics are needed.
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

  static {
    // OpenChemLib prints "Tautomer count exceeds maximum" to System.out for every molecule it gives
    // up on. The JS side already routes Java's streams away from the host console, but a library has
    // no business writing there at all, and OpenChemLib offers the switch.
    TautomerHelper.setSuppressWarning(true);
  }

  /**
   * How many tautomers the last {@link #noStereoTautomerIdCode} enumerated. A scan is synchronous
   * and nothing outside this class can reach it, so one field is enough and needs no lock — the same
   * reasoning as the cached fragment below.
   */
  private static int lastTautomerCount;

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

  /**
   * Hashes {@code idCodes[from .. to)} to the 64-bit hash OpenChemLib identifies a molecule by up to
   * tautomerism and stereochemistry, one hash per molecule.
   *
   * <p>Every tautomer of a structure and every stereoisomer of it hash to the same value, so the
   * hash is what an equality lookup keys on when two records should count as the same compound
   * whether they were drawn as the keto or the enol form, or with or without their stereo centres
   * assigned.
   *
   * <p>It is OpenChemLib's own {@code CanonizerUtil.getNoStereoTautomerHash}: the molecule is
   * stripped of stereo information, reduced to its generic tautomer, canonized, and that idcode run
   * through OpenChemLib's 64-bit StrongHasher. The value therefore matches what any other
   * OpenChemLib build computes for the same molecule, and it is a signed 64-bit integer — exactly
   * what an SQLite {@code INTEGER} column holds and indexes.
   *
   * @param idCodes the molecules to hash
   * @param result written as the scan advances, one hash per molecule. Indexed by the molecule's
   *     position in {@code idCodes}, not by its position in the range. A molecule whose idcode will
   *     not parse, or that OpenChemLib cannot canonize, gets 0.
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize
   *     it, so a salt hashes as its parent structure
   * @param from the first index to hash
   * @param to one past the last index to hash
   * @return how many molecules in the range were hashed
   */
  @JSExport
  public static int getNoStereoTautomerHashes(
      JSArrayReader<JSString> idCodes,
      BigInt64Array result,
      Int32Array tautomerCounts,
      boolean largestFragmentOnly,
      int maxTautomers,
      int from,
      int to) {
    TautomerHelper.setMaxTautomers(maxTautomers);
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule molecule = new StereoMolecule();
    int hashed = 0;
    for (int i = from; i < to; i++) {
      long hash =
          parse(parser, molecule, idCodes.get(i).stringValue())
              ? hashOf(noStereoTautomerIdCode(molecule, largestFragmentOnly))
              : 0;
      if (hash != 0) {
        hashed++;
      }
      result.set(i, hash);
      tautomerCounts.set(i, lastTautomerCount);
    }
    return hashed;
  }

  /**
   * Hashes {@code idCodes[from .. to)} to the 64-bit hash OpenChemLib identifies a molecule by up to
   * stereochemistry, one hash per molecule.
   *
   * <p>Every stereoisomer of a structure hashes to the same value, and nothing else does: unlike
   * {@link #getNoStereoTautomerHashes} the tautomers are kept apart, so the keto and the enol form
   * of one compound hash differently. It is the hash to key on when a record's stereochemistry is
   * unreliable but the bonds it was drawn with are not.
   *
   * <p>It is OpenChemLib's own {@code CanonizerUtil.getNoStereoHash}: the molecule is stripped of
   * stereo information, canonized, and that idcode run through OpenChemLib's 64-bit StrongHasher.
   * The value therefore matches what any other OpenChemLib build computes for the same molecule, and
   * it is a signed 64-bit integer — exactly what an SQLite {@code INTEGER} column holds and indexes.
   *
   * @param idCodes the molecules to hash
   * @param result written as the scan advances, one hash per molecule. Indexed by the molecule's
   *     position in {@code idCodes}, not by its position in the range. A molecule whose idcode will
   *     not parse, or that OpenChemLib cannot canonize, gets 0.
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize
   *     it, so a salt hashes as its parent structure
   * @param from the first index to hash
   * @param to one past the last index to hash
   * @return how many molecules in the range were hashed
   */
  @JSExport
  public static int getNoStereoHashes(
      JSArrayReader<JSString> idCodes,
      BigInt64Array result,
      boolean largestFragmentOnly,
      int from,
      int to) {
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule molecule = new StereoMolecule();
    int hashed = 0;
    for (int i = from; i < to; i++) {
      long hash =
          parse(parser, molecule, idCodes.get(i).stringValue())
              ? hashOf(noStereoIdCode(molecule, largestFragmentOnly))
              : 0;
      if (hash != 0) {
        hashed++;
      }
      result.set(i, hash);
    }
    return hashed;
  }

  /**
   * Writes the canonical no-stereo idcode of {@code idCodes[from .. to)} into {@code result}, one per
   * molecule.
   *
   * <p>This is the string {@link #getNoStereoHashes} hashes, for a caller that stores the canonical
   * form itself rather than a 64-bit key.
   *
   * @param idCodes the molecules to canonize
   * @param result written as the scan advances, one idcode per molecule, indexed by the molecule's
   *     position in {@code idCodes}. A molecule whose idcode will not parse, or that OpenChemLib
   *     cannot canonize, is left untouched.
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize it
   * @param from the first index to canonize
   * @param to one past the last index to canonize
   * @return how many molecules in the range were canonized
   */
  @JSExport
  public static int getNoStereoIdCodes(
      JSArrayReader<JSString> idCodes,
      JSArray<JSString> result,
      boolean largestFragmentOnly,
      int from,
      int to) {
    return writeIdCodes(idCodes, result, null, largestFragmentOnly, from, to, false);
  }

  /**
   * Writes the canonical no-stereo generic-tautomer idcode of {@code idCodes[from .. to)} into
   * {@code result}, one per molecule.
   *
   * <p>This is the string {@link #getNoStereoTautomerHashes} hashes.
   *
   * @param idCodes the molecules to canonize
   * @param result written as the scan advances, one idcode per molecule, indexed by the molecule's
   *     position in {@code idCodes}. A molecule whose idcode will not parse, or that OpenChemLib
   *     cannot canonize, is left untouched.
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize it
   * @param from the first index to canonize
   * @param to one past the last index to canonize
   * @return how many molecules in the range were canonized
   */
  @JSExport
  public static int getNoStereoTautomerIdCodes(
      JSArrayReader<JSString> idCodes,
      JSArray<JSString> result,
      Int32Array tautomerCounts,
      boolean largestFragmentOnly,
      int maxTautomers,
      int from,
      int to) {
    TautomerHelper.setMaxTautomers(maxTautomers);
    return writeIdCodes(
        idCodes, result, tautomerCounts, largestFragmentOnly, from, to, true);
  }

  private static int writeIdCodes(
      JSArrayReader<JSString> idCodes,
      JSArray<JSString> result,
      Int32Array tautomerCounts,
      boolean largestFragmentOnly,
      int from,
      int to,
      boolean tautomer) {
    IDCodeParserWithoutCoordinateInvention parser = new IDCodeParserWithoutCoordinateInvention();
    StereoMolecule molecule = new StereoMolecule();
    int written = 0;
    for (int i = from; i < to; i++) {
      if (!parse(parser, molecule, idCodes.get(i).stringValue())) {
        if (tautomerCounts != null) {
          tautomerCounts.set(i, 0);
        }
        continue;
      }
      String idCode =
          tautomer
              ? noStereoTautomerIdCode(molecule, largestFragmentOnly)
              : noStereoIdCode(molecule, largestFragmentOnly);
      if (tautomerCounts != null) {
        tautomerCounts.set(i, lastTautomerCount);
      }
      if (idCode != null) {
        result.set(i, JSString.valueOf(idCode));
        written++;
      }
    }
    return written;
  }

  /**
   * The canonical idcode of {@code molecule} with its stereochemistry disregarded.
   *
   * <p>OpenChemLib's own {@code CanonizerUtil.getIDCodeNoStereo} calls {@code
   * stripStereoInformation()} and canonizes the result, which needs atom coordinates: stripping
   * turns an implicit double-bond configuration into a cross bond, and without coordinates there is
   * no stereo bond to turn. Our molecules come from {@link IDCodeParserWithoutCoordinateInvention},
   * so that path does not merely lose the configuration — it invents one. Measured on 400 real
   * idcodes it disagreed with the coordinate-bearing answer on 6 of them, turning an unconfigured
   * double bond into E and, for a Z one, flipping it.
   *
   * <p>Telling the canonizer to disregard stereochemistry instead needs no coordinates and agrees
   * with the coordinate-bearing answer on all 400. Inventing coordinates would also agree, and costs
   * 19 times the parse.
   *
   * @param molecule the molecule to canonize; not modified
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize it
   * @return its canonical no-stereo idcode, or null if OpenChemLib could not canonize it
   */
  private static String noStereoIdCode(StereoMolecule molecule, boolean largestFragmentOnly) {
    try {
      StereoMolecule target = reduced(molecule, largestFragmentOnly);
      return new Canonizer(target, Canonizer.NEGLECT_ANY_STEREO_INFORMATION).getIDCode();
    } catch (Throwable error) {
      return null;
    }
  }

  /**
   * The canonical idcode of {@code molecule}'s generic tautomer, with its stereochemistry
   * disregarded.
   *
   * <p>The generic tautomer is built the way {@code CanonizerUtil.getIDCodeNoStereoTautomer} builds
   * it, and canonized with the same {@code ENCODE_ATOM_CUSTOM_LABELS} it uses — the labels carry the
   * pi-electron counts that make a tautomer region canonical. The stereo handling is
   * {@link #noStereoIdCode}'s, and for the same reason.
   *
   * @param molecule the molecule to canonize; not modified
   * @param largestFragmentOnly whether to first strip all but the largest fragment and neutralize it
   * @return its canonical no-stereo generic-tautomer idcode, or null if OpenChemLib could not
   *     canonize it
   */
  private static String noStereoTautomerIdCode(
      StereoMolecule molecule, boolean largestFragmentOnly) {
    lastTautomerCount = 0;
    try {
      StereoMolecule target = reduced(molecule, largestFragmentOnly);
      TautomerHelper helper = new TautomerHelper(target);
      lastTautomerCount = helper.getTautomerCount();
      StereoMolecule generic = helper.createGenericTautomer();
      return new Canonizer(
              generic,
              Canonizer.ENCODE_ATOM_CUSTOM_LABELS | Canonizer.NEGLECT_ANY_STEREO_INFORMATION)
          .getIDCode();
    } catch (Throwable error) {
      return null;
    }
  }

  /**
   * A copy of {@code molecule}, optionally reduced to its largest fragment and neutralized.
   *
   * <p>The copy is what keeps the caller's molecule untouched, and it is the reusable one every
   * scan parses into, so canonizing must not consume it.
   *
   * @param molecule the molecule to copy
   * @param largestFragmentOnly whether to strip all but the largest fragment and neutralize it
   * @return the copy
   */
  private static StereoMolecule reduced(StereoMolecule molecule, boolean largestFragmentOnly) {
    StereoMolecule copy = molecule.getCompactCopy();
    if (largestFragmentOnly) {
      copy.stripSmallFragments(true);
      MoleculeNeutralizer.neutralizeChargedMolecule(copy);
    }
    return copy;
  }

  /**
   * OpenChemLib's 64-bit StrongHasher over a canonical idcode, which is how every {@code
   * CanonizerUtil} hash is defined.
   *
   * @param idCode the canonical idcode to hash, or null
   * @return its hash, or 0 when there is no idcode
   */
  private static long hashOf(String idCode) {
    return idCode == null ? 0 : CanonizerUtil.StrongHasher.hash(idCode);
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
