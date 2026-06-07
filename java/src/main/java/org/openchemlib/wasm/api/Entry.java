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
    use(MoleculeProperties.class);
    use(RingCollection.class);
    use(Canonizer.class);
    use(CanonizerUtil.class);
    use(Reaction.class);
    use(ReactionEncoder.class);
    use(Reactor.class);
    use(Transformer.class);
    use(DrugScoreCalculator.class);
    use(SDFileParser.class);
    use(Util.class);
  }

  private static void use(Class<?> clazz) {
    if (clazz == null) {
      throw new IllegalStateException();
    }
  }
}
