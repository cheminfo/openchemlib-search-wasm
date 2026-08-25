package org.openchemlib.wasm;

/**
 * WasmGC entry point. TeaVM compiles the closure reachable from {@code main}, so {@link Search} is
 * referenced here to keep it and everything it uses out of dead-code elimination.
 */
public final class Entry {
  private Entry() {}

  /**
   * Module entry point; does nothing but anchor reachability.
   *
   * @param args ignored
   */
  public static void main(String[] args) {
    if (Search.class == null) {
      throw new IllegalStateException();
    }
  }
}
