package org.openchemlib.wasm.spike;

import org.teavm.jso.JSExport;

/**
 * Stage 0 spike: a self-contained reproduction of the OpenChemLib
 * {@code SSSearcherWithIndex} fingerprint screen, using 64-bit {@code long}
 * arithmetic. Compiled to WebAssembly GC by TeaVM and called from JavaScript.
 *
 * <p>The point is to verify, end to end, that:
 * <ul>
 *   <li>Java {@code long} maps to native WASM {@code i64} (not GWT's slow
 *       3-number emulation), so 64-bit bit operations are exact and fast.</li>
 *   <li>{@code @JSExport} static methods are callable from Node and the browser.</li>
 *   <li>{@code long} round-trips through the JS boundary as {@code BigInt}.</li>
 * </ul>
 * This class intentionally depends on nothing from OpenChemLib.
 */
public final class Screen {
  private Screen() {}

  /**
   * Entry point required by the WasmGC backend. The exported methods below are
   * the real surface; this just anchors module initialization.
   *
   * @param args ignored
   */
  public static void main(String[] args) {
    // Reference the probe classes so they are reachable for dead-code
    // elimination, then their @JSExport members can be probed from JS.
    Counter.create(0).get();
    InteropProbe.matchList();
  }

  /**
   * Fingerprint subset test, the heart of the index screen: a fragment can only
   * be contained in a molecule if every fingerprint bit set in the fragment is
   * also set in the molecule, i.e. {@code (fragment & ~molecule) == 0}.
   *
   * @param fragment fragment fingerprint word
   * @param molecule molecule fingerprint word
   * @return true if no fragment bit is missing from the molecule
   */
  @JSExport
  public static boolean isSubset(long fragment, long molecule) {
    return (fragment & ~molecule) == 0L;
  }

  /**
   * Population count of the bits the fragment requires but the molecule lacks.
   * Exercises {@link Long#bitCount(long)} over native i64.
   *
   * @param fragment fragment fingerprint word
   * @param molecule molecule fingerprint word
   * @return number of missing bits
   */
  @JSExport
  public static int mismatchBits(long fragment, long molecule) {
    return Long.bitCount(fragment & ~molecule);
  }

  /**
   * 64-bit rotate, used as a hard correctness probe: the result is only correct
   * with true 64-bit semantics. A JS double or a buggy long emulation produces
   * a different value.
   *
   * @param value the value to rotate
   * @param bits the rotation distance
   * @return value rotated left by bits
   */
  @JSExport
  public static long rotateLeft(long value, int bits) {
    return Long.rotateLeft(value, bits);
  }

  /**
   * A tight i64 screening loop standing in for screening one query fingerprint
   * word against {@code count} molecules. Each molecule word is produced by a
   * 64-bit LCG whose multiplier and increment overflow 53 bits, so a correct
   * result is only possible with genuine i64 arithmetic. Returns how many of the
   * generated molecules pass the subset test. Lets us take an early read on the
   * i64 throughput versus a JavaScript equivalent.
   *
   * @param query the query fingerprint word
   * @param seed the LCG seed
   * @param count number of molecule words to screen
   * @return number of molecules that pass the subset test
   */
  @JSExport
  public static int screenMany(long query, long seed, int count) {
    int passed = 0;
    long molecule = seed;
    for (int i = 0; i < count; i++) {
      molecule = molecule * 6364136223846793005L + 1442695040888963407L;
      if ((query & ~molecule) == 0L) {
        passed++;
      }
    }
    return passed;
  }
}
