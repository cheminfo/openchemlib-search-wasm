package org.openchemlib.wasm.api;

import java.nio.charset.StandardCharsets;
import org.cheminfo.utils.FakeFileInputStream;
import org.teavm.jso.JSExport;

/**
 * Registration point for the bundled parameter tables (force field, predictors,
 * torsion data). Resources are typically registered during
 * {@code loadOCL({ resources: true })} but can also be registered manually. The
 * resource-loaded classes (ForceFieldMMFF94, ConformerGenerator, predictors)
 * throw until at least one resource is registered.
 */
public final class Resources {
  private Resources() {}

  /**
   * Registers one resource's contents under its path.
   *
   * @param path the resource path (e.g. /resources/forcefield/mmff94/atom.csv)
   * @param content the (ASCII) file contents
   */
  @JSExport
  public static void register(String path, String content) {
    FakeFileInputStream.registerResource(path, content.getBytes(StandardCharsets.ISO_8859_1));
  }

  static void checkHasRegistered() {
    if (!FakeFileInputStream.hasRegistered()) {
      throw new IllegalStateException("static resources must be registered first");
    }
  }
}
