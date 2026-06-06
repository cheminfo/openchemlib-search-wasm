package org.openchemlib.wasm.api;

import com.actelion.research.chem.CanonizerUtil.IDCODE_TYPE;
import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.CanonizerUtil}, mirroring the
 * openchemlib-js {@code CanonizerUtil} API. Provides canonical idcodes for
 * simplified states of a molecule. The numeric type selectors (NORMAL = 0,
 * NOSTEREO = 1, BACKBONE = 2, TAUTOMER = 3, NOSTEREO_TAUTOMER = 4) are attached
 * to the exported constructor on the JS side.
 */
public final class CanonizerUtil {
  private CanonizerUtil() {}

  /**
   * Generates the canonical idcode for a simplified state of a molecule.
   *
   * @param molecule the source molecule
   * @param type the simplification type (0 NORMAL, 1 NOSTEREO, 2 BACKBONE, 3
   *     TAUTOMER, 4 NOSTEREO_TAUTOMER)
   * @return the canonical idcode
   */
  @JSExport
  public static String getIDCode(Molecule molecule, int type) {
    return com.actelion.research.chem.CanonizerUtil.getIDCode(
        molecule.getStereoMolecule(), typeFromInt(type), false);
  }

  private static IDCODE_TYPE typeFromInt(int type) {
    switch (type) {
      case 1:
        return IDCODE_TYPE.NOSTEREO;
      case 2:
        return IDCODE_TYPE.BACKBONE;
      case 3:
        return IDCODE_TYPE.TAUTOMER;
      case 4:
        return IDCODE_TYPE.NOSTEREO_TAUTOMER;
      case 0:
      default:
        return IDCODE_TYPE.NORMAL;
    }
  }
}
