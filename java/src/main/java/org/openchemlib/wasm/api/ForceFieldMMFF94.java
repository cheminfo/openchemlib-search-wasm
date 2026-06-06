package org.openchemlib.wasm.api;

import java.util.HashMap;
import org.teavm.jso.JSExport;

/** WASM facade for the MMFF94 force field. Requires registered resources. */
public class ForceFieldMMFF94 {
  private static boolean mmff94Init;
  private static boolean mmff94sInit;
  private static boolean mmff94sPlusInit;

  private final com.actelion.research.chem.forcefield.mmff.ForceFieldMMFF94 forceField;

  /**
   * Builds a force field for a molecule using the given parameter table.
   *
   * @param molecule the molecule (must have 3D coordinates)
   * @param tablename one of "MMFF94", "MMFF94s", "MMFF94s+"
   */
  @JSExport
  public ForceFieldMMFF94(Molecule molecule, String tablename) {
    initializeTables(tablename);
    this.forceField =
        new com.actelion.research.chem.forcefield.mmff.ForceFieldMMFF94(
            molecule.getStereoMolecule(), tablename, new HashMap<String, Object>());
  }

  /**
   * Number of energy terms.
   *
   * @return the size
   */
  @JSExport
  public int size() {
    return forceField.size();
  }

  /**
   * Current total energy.
   *
   * @return the total energy
   */
  @JSExport
  public double getTotalEnergy() {
    return forceField.getTotalEnergy();
  }

  /**
   * Energy-minimises the molecule in place.
   *
   * @param maxIts maximum iterations
   * @param gradTol gradient tolerance
   * @param funcTol function tolerance
   * @return the return code from the minimiser
   */
  @JSExport
  public int minimise(int maxIts, double gradTol, double funcTol) {
    return forceField.minimise(maxIts, gradTol, funcTol);
  }

  private static void initializeTables(String tablename) {
    if (tablename.equals("MMFF94") && !mmff94Init) {
      com.actelion.research.chem.forcefield.mmff.ForceFieldMMFF94.initialize("MMFF94");
      mmff94Init = true;
    } else if (tablename.equals("MMFF94s") && !mmff94sInit) {
      com.actelion.research.chem.forcefield.mmff.ForceFieldMMFF94.initialize("MMFF94s");
      mmff94sInit = true;
    } else if (tablename.equals("MMFF94s+") && !mmff94sPlusInit) {
      com.actelion.research.chem.forcefield.mmff.ForceFieldMMFF94.initialize("MMFF94s+");
      mmff94sPlusInit = true;
    }
  }
}
