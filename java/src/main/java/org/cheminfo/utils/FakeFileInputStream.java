package org.cheminfo.utils;

import java.io.InputStream;

/**
 * Adapter that lets OpenChemLib read its bundled parameter tables. The OCL
 * sources are patched (see scripts/copy-openchemlib.mjs) to call this instead of
 * {@code Class.getResourceAsStream}, which crashes under TeaVM. The tables are
 * bundled into the wasm via {@code OclResourceSupplier} and read here through the
 * class loader (the form TeaVM supports), so they are always available with no
 * registration step.
 */
public final class FakeFileInputStream {
  private FakeFileInputStream() {}

  /**
   * Opens a stream over a bundled resource.
   *
   * @param path the resource path (OCL uses a leading slash, e.g.
   *     /resources/forcefield/mmff94/atom.csv)
   * @return a stream over the resource, or null for excluded paths
   */
  public static InputStream getResourceAsStream(String path) {
    if (path.contains("/csd/")) {
      return null;
    }
    // Class.getResourceAsStream uses absolute (leading-slash) paths; the class
    // loader form TeaVM supports does not.
    String name = path.startsWith("/") ? path.substring(1) : path;
    InputStream stream =
        FakeFileInputStream.class.getClassLoader().getResourceAsStream(name);
    if (stream == null) {
      throw new IllegalStateException("missing static resource: " + path);
    }
    return stream;
  }
}
