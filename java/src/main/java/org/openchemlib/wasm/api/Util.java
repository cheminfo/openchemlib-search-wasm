package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;
import org.teavm.jso.JSObject;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.contrib.HoseCodeCreator},
 * mirroring the openchemlib-js {@code Util} namespace of static helpers.
 */
public final class Util {
  private Util() {}

  /**
   * Computes the HOSE codes of the marked atom of a diastereotopic-id molecule.
   *
   * @param diastereotopicID the idcode of a molecule whose center atom carries a
   *     custom label ending in {@code *}
   * @param options sphere-size and type options ({@code maxSphereSize} defaults
   *     to {@code 5}, {@code type} defaults to {@code 0}), or undefined
   * @return one HOSE code per sphere
   */
  @JSExport
  public static String[] getHoseCodesFromDiastereotopicID(
      String diastereotopicID, Options.HoseCodes options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    int maxSphereSize = 5;
    int type = 0;
    if (present) {
      JSObject rawMaxSphereSize = options.getMaxSphereSize();
      if (rawMaxSphereSize != null && !JSObjects.isUndefined(rawMaxSphereSize)) {
        maxSphereSize = rawMaxSphereSize.<org.teavm.jso.core.JSNumber>cast().intValue();
      }
      JSObject rawType = options.getType();
      if (rawType != null && !JSObjects.isUndefined(rawType)) {
        type = rawType.<org.teavm.jso.core.JSNumber>cast().intValue();
      }
    }
    return com.actelion.research.chem.contrib.HoseCodeCreator.getHoseCodesFromDiaID(
        diastereotopicID, maxSphereSize, type);
  }
}
