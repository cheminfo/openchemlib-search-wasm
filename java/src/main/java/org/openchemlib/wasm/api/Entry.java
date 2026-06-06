package org.openchemlib.wasm.api;

/**
 * WasmGC entry point. The exported facade classes are the real surface; this
 * references each so it stays reachable for dead-code elimination.
 */
public final class Entry {
  private Entry() {}

  /**
   * Module entry point.
   *
   * @param args ignored
   */
  public static void main(String[] args) {
    use(Molecule.class);
    use(SmilesParser.class);
    use(SSSearcher.class);
    use(SSSearcherWithIndex.class);
    use(ForceFieldMMFF94.class);
    use(ConformerGenerator.class);
    use(DruglikenessPredictor.class);
    use(ToxicityPredictor.class);
  }

  private static void use(Class<?> clazz) {
    if (clazz == null) {
      throw new IllegalStateException();
    }
  }
}
