package org.openchemlib.wasm.slice;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Native-JVM baseline for the substructure benchmark. Reuses the exact same
 * {@link SubstructureSlice} code paths that are compiled to WASM, so the only
 * variable is the execution engine (HotSpot vs TeaVM WasmGC vs GWT-JS). Run
 * with: {@code java -cp <classes> org.openchemlib.wasm.slice.JavaBench targets.smi}
 */
public final class JavaBench {
  private JavaBench() {}

  private static final String[] QUERIES = {
    "c1ccccc1", "c1ccncc1", "C(=O)O", "C(=O)Nc1ccccc1", "S(=O)(=O)N", "c1ccc2ccccc2c1",
  };

  /**
   * Runs the benchmark and prints CSV the harness can parse.
   *
   * @param args args[0] is the path to the newline-separated SMILES dataset
   * @throws Exception on I/O error
   */
  public static void main(String[] args) throws Exception {
    String smiles = Files.readString(Path.of(args[0]));

    double buildMs = bestMs(() -> SubstructureSlice.loadTargets(smiles), 3);
    int molecules = SubstructureSlice.loadTargets(smiles);

    // Warm the JIT on every query before timing.
    for (int i = 0; i < 5; i++) {
      for (String query : QUERIES) {
        SubstructureSlice.countWithoutIndex(query);
        SubstructureSlice.countWithIndex(query);
      }
    }

    System.out.printf("JAVA_BUILD,%.1f,%d%n", buildMs, molecules);
    System.out.println("JAVA_ROW,query,hits,noIndexMs,withIndexMs");
    for (String query : QUERIES) {
      int hits = SubstructureSlice.countWithIndex(query);
      double noIndex = bestMs(() -> SubstructureSlice.countWithoutIndex(query), 5);
      double withIndex = bestMs(() -> SubstructureSlice.countWithIndex(query), 5);
      System.out.printf("JAVA_ROW,%s,%d,%.2f,%.2f%n", query, hits, noIndex, withIndex);
    }
  }

  private static double bestMs(Runnable runnable, int repeats) {
    double min = Double.MAX_VALUE;
    for (int i = 0; i < repeats; i++) {
      long start = System.nanoTime();
      runnable.run();
      double elapsed = (System.nanoTime() - start) / 1e6;
      if (elapsed < min) min = elapsed;
    }
    return min;
  }
}
