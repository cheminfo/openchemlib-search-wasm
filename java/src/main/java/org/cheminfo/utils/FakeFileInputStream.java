package org.cheminfo.utils;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Pure-Java replacement for the GWT/JSNI {@code FakeFileInputStream}. OpenChemLib
 * reads its bundled parameter tables (force field, predictors, torsion data)
 * through {@code getResourceAsStream}; the bytes are registered once at startup
 * (see the {@code Resources} facade and {@code loadOCL({ resources })}).
 */
public class FakeFileInputStream extends InputStream {
  private static Map<String, byte[]> registeredResources = new HashMap<>();

  private final byte[] contents;
  private int position;

  /**
   * Wraps already-resolved bytes.
   *
   * @param contents the resource bytes
   */
  public FakeFileInputStream(byte[] contents) {
    this.contents = contents;
  }

  /**
   * Opens a stream over a previously registered resource.
   *
   * @param path the resource path
   * @return a stream over the resource, or null for excluded paths
   */
  public static FakeFileInputStream getResourceAsStream(String path) {
    if (path.contains("/csd/")) {
      return null;
    }
    byte[] resource = registeredResources.get(path);
    if (resource == null) {
      throw new IllegalStateException("missing static resource: " + path);
    }
    return new FakeFileInputStream(resource);
  }

  /**
   * Registers one resource's bytes (called from the Resources facade).
   *
   * @param path the resource path
   * @param contents the resource bytes
   */
  public static void registerResource(String path, byte[] contents) {
    registeredResources.put(path, contents);
  }

  /** Whether any resources have been registered. */
  public static boolean hasRegistered() {
    return !registeredResources.isEmpty();
  }

  @Override
  public int available() {
    return contents.length - position;
  }

  @Override
  public void close() {
    position = contents.length;
  }

  @Override
  public int read() {
    if (position == contents.length) {
      return -1;
    }
    return contents[position++] & 0xff;
  }

  @Override
  public int read(byte[] buffer, int offset, int length) {
    if (position == contents.length) {
      return -1;
    }
    int count = Math.min(length, contents.length - position);
    System.arraycopy(contents, position, buffer, offset, count);
    position += count;
    return count;
  }
}
