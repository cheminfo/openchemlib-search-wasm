package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.Canonizer}, mirroring the
 * openchemlib-js {@code Canonizer} API. Canonicalizes a molecule, producing a
 * canonical idcode, atom ranks, encoded coordinates and mapping.
 */
public class Canonizer {
  private final com.actelion.research.chem.Canonizer canonizer;

  /**
   * Creates a canonizer for the given molecule with the given mode options.
   *
   * @param molecule the molecule to canonicalize
   * @param options canonization mode options, or undefined for defaults
   */
  @JSExport
  public Canonizer(Molecule molecule, Options.Canonizer options) {
    this.canonizer =
        new com.actelion.research.chem.Canonizer(molecule.getStereoMolecule(), modeFromOptions(options));
  }

  /**
   * Whether a CIP parity distinction problem was detected during canonization.
   *
   * @return true if there is a CIP parity distinction problem
   */
  @JSExport
  public boolean hasCIPParityDistinctionProblem() {
    return canonizer.hasCIPParityDistinctionProblem();
  }

  /**
   * Builds the canonical molecule, optionally including explicit hydrogens.
   *
   * @param includeExplicitHydrogen whether to include explicit hydrogens
   * @return the canonical molecule
   */
  @JSExport
  public Molecule getCanMolecule(boolean includeExplicitHydrogen) {
    StereoMolecule canonical = canonizer.getCanMolecule(includeExplicitHydrogen);
    return new Molecule(canonical);
  }

  /**
   * The canonical idcode of the molecule.
   *
   * @return the idcode
   */
  @JSExport
  public String getIDCode() {
    return canonizer.getIDCode();
  }

  /**
   * The final canonical rank of every atom.
   *
   * @return the final rank as an Int32Array
   */
  @JSExport
  public int[] getFinalRank() {
    return canonizer.getFinalRank();
  }

  /**
   * The symmetry rank of a single atom (requires createSymmetryRank mode).
   *
   * @param atom the atom index
   * @return the symmetry rank
   */
  @JSExport
  public int getSymmetryRank(int atom) {
    return canonizer.getSymmetryRank(atom);
  }

  /**
   * The symmetry rank of every atom (requires createSymmetryRank mode).
   *
   * @return the symmetry ranks as an Int32Array
   */
  @JSExport
  public int[] getSymmetryRanks() {
    return canonizer.getSymmetryRanks();
  }

  /** Invalidates any cached canonical coordinates. */
  @JSExport
  public void invalidateCoordinates() {
    canonizer.invalidateCoordinates();
  }

  /**
   * The canonical encoded 2D coordinates.
   *
   * @param keepPositionAndScale whether to preserve absolute position and scale
   * @return the encoded coordinates
   */
  @JSExport
  public String getEncodedCoordinates(boolean keepPositionAndScale) {
    return canonizer.getEncodedCoordinates(keepPositionAndScale);
  }

  /**
   * The canonical encoded atom mapping.
   *
   * @return the encoded mapping (empty string if no mapping)
   */
  @JSExport
  public String getEncodedMapping() {
    return canonizer.getEncodedMapping();
  }

  /**
   * Normalizes the molecule to its canonical enantiomer.
   *
   * @return true if the molecule was inverted
   */
  @JSExport
  public boolean normalizeEnantiomer() {
    return canonizer.normalizeEnantiomer();
  }

  /** Recomputes and sets the canonical parities on the molecule. */
  @JSExport
  public void setParities() {
    canonizer.setParities();
  }

  /**
   * The atom indices in canonical graph order.
   *
   * @return the graph atoms as an Int32Array
   */
  @JSExport
  public int[] getGraphAtoms() {
    return canonizer.getGraphAtoms();
  }

  /**
   * The canonical graph index of every atom.
   *
   * @return the graph indexes as an Int32Array
   */
  @JSExport
  public int[] getGraphIndexes() {
    return canonizer.getGraphIndexes();
  }

  private static int modeFromOptions(Options.Canonizer options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    int mode = 0;
    if (present) {
      if (options.isCreateSymmetryRank()) {
        mode |= com.actelion.research.chem.Canonizer.CREATE_SYMMETRY_RANK;
      }
      if (options.isConsiderStereoheterotopicity()) {
        mode |= com.actelion.research.chem.Canonizer.CONSIDER_STEREOHETEROTOPICITY;
      }
      if (options.isEncodeAtomCustomLabels()) {
        mode |= com.actelion.research.chem.Canonizer.ENCODE_ATOM_CUSTOM_LABELS;
      }
      if (options.isEncodeAtomSelection()) {
        mode |= com.actelion.research.chem.Canonizer.ENCODE_ATOM_SELECTION;
      }
      if (options.isAssignParitiesToTetrahedralN()) {
        mode |= com.actelion.research.chem.Canonizer.ASSIGN_PARITIES_TO_TETRAHEDRAL_N;
      }
      if (options.isCoordsAre3d()) {
        mode |= com.actelion.research.chem.Canonizer.COORDS_ARE_3D;
      }
      if (options.isCreatePseudoStereoGroups()) {
        mode |= com.actelion.research.chem.Canonizer.CREATE_PSEUDO_STEREO_GROUPS;
      }
      if (options.isDistinguishRacemicOrGroups()) {
        mode |= com.actelion.research.chem.Canonizer.DISTINGUISH_RACEMIC_OR_GROUPS;
      }
      if (options.isTieBreakFreeValenceAtoms()) {
        mode |= com.actelion.research.chem.Canonizer.TIE_BREAK_FREE_VALENCE_ATOMS;
      }
      if (options.isEncodeAtomCustomLabelsWithoutRanking()) {
        mode |= com.actelion.research.chem.Canonizer.ENCODE_ATOM_CUSTOM_LABELS_WITHOUT_RANKING;
      }
      if (options.isNeglectAnyStereoInformation()) {
        mode |= com.actelion.research.chem.Canonizer.NEGLECT_ANY_STEREO_INFORMATION;
      }
    }
    return mode;
  }
}
