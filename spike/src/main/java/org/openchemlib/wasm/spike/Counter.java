package org.openchemlib.wasm.spike;

import org.teavm.jso.JSExport;

/**
 * Interop architecture probe: can JavaScript receive a Java object across the
 * WasmGC boundary, hold it, and call its instance methods and exported
 * constructor? If yes, the openchemlib-wasm wrappers can mirror the stateful
 * OO OpenChemLib API directly (a TS class holding the exported Java object),
 * with no integer-handle registry.
 */
public class Counter {
  private int value;

  /**
   * Exported constructor.
   *
   * @param start initial value
   */
  @JSExport
  public Counter(int start) {
    this.value = start;
  }

  /**
   * Static factory, to compare with constructor export.
   *
   * @param start initial value
   * @return a new counter
   */
  @JSExport
  public static Counter create(int start) {
    return new Counter(start);
  }

  /**
   * Mutates instance state.
   *
   * @param x amount to add
   */
  @JSExport
  public void add(int x) {
    this.value += x;
  }

  /**
   * Reads instance state.
   *
   * @return current value
   */
  @JSExport
  public int get() {
    return this.value;
  }

  /**
   * Returns another object from an instance method, to check object chaining.
   *
   * @return a new counter with the same value
   */
  @JSExport
  public Counter copy() {
    return new Counter(this.value);
  }

  /**
   * Accepts another exported object as a parameter (mirrors
   * SSSearcher.setMolecule(Molecule)).
   *
   * @param other another counter passed from JS
   * @return the sum of both values
   */
  @JSExport
  public int plus(Counter other) {
    return this.value + other.value;
  }
}
