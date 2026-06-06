package org.openchemlib.wasm.spike;

import org.teavm.jso.JSExport;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSObjects;

/**
 * Verifies the exact TeaVM interop features the OpenChemLib wrappers depend on:
 * options objects in, exported objects as parameters, nested-array returns,
 * constructed JS object returns, and exception-message propagation.
 */
public final class InteropProbe {
  private InteropProbe() {}

  /** Options bag read on the Java side via @JSProperty (mirrors fromSmiles options). */
  public interface Options extends JSObject {
    @JSProperty
    boolean isNoCoordinates();

    @JSProperty
    String getSmartsMode();
  }

  /** Constructed JS object returned to JS (mirrors {idCode, coordinates}). */
  public interface Result extends JSObject {
    @JSProperty
    void setIdCode(String value);

    @JSProperty
    void setCount(int value);
  }

  /**
   * Reads an options object, tolerating undefined/absent.
   *
   * @param options a JS options object or undefined
   * @return a description of the read values
   */
  @JSExport
  public static String readOptions(Options options) {
    if (JSObjects.isUndefined(options) || options == null) {
      return "no-options";
    }
    return "noCoordinates=" + options.isNoCoordinates() + ",smartsMode=" + options.getSmartsMode();
  }

  /**
   * Returns a nested int array (mirrors SSSearcher.getMatchList()).
   *
   * @return a 2x2 match list
   */
  @JSExport
  public static int[][] matchList() {
    return new int[][] {{2, 3}, {4, 5}};
  }

  /**
   * Builds and returns a JS object (mirrors getIDCodeAndCoordinates()).
   *
   * @param idCode an idcode
   * @param count a count
   * @return a JS object with those fields
   */
  @JSExport
  public static Result makeResult(String idCode, int count) {
    Result result = JSObjects.create().cast();
    result.setIdCode(idCode);
    result.setCount(count);
    return result;
  }

  /**
   * Throws, to confirm Java exceptions surface to JS with their message.
   */
  @JSExport
  public static void boom() {
    throw new IllegalArgumentException("SmilesParser: unknown element label found: 'z'");
  }
}
