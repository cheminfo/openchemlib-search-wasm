package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.StereoMolecule}, mirroring
 * the openchemlib-js {@code Molecule} API. Holds the underlying OCL molecule and
 * exposes it through @JSExport methods.
 */
public class Molecule {
  private final StereoMolecule molecule;

  /** Wraps an existing OCL molecule (internal). */
  Molecule(StereoMolecule molecule) {
    this.molecule = molecule;
  }

  /**
   * Creates an empty molecule with the given capacities.
   *
   * @param maxAtoms initial atom capacity
   * @param maxBonds initial bond capacity
   */
  @JSExport
  public Molecule(int maxAtoms, int maxBonds) {
    this.molecule = new StereoMolecule(maxAtoms, maxBonds);
  }

  /** Underlying OCL molecule, for sibling facade classes (internal). */
  StereoMolecule getStereoMolecule() {
    return molecule;
  }

  /**
   * Parses a molecule from SMILES.
   *
   * @param smiles the SMILES string
   * @param options parse options, or undefined for defaults
   * @return the parsed molecule
   */
  @JSExport
  public static Molecule fromSmiles(String smiles, Options.Smiles options) {
    return SmilesParser.parseToMolecule(smiles, options);
  }

  /**
   * Parses a molecule from an idcode.
   *
   * @param idCode the idcode
   * @return the molecule
   */
  @JSExport
  public static Molecule fromIDCode(String idCode) {
    StereoMolecule molecule = new StereoMolecule();
    new com.actelion.research.chem.IDCodeParser(true).parse(molecule, idCode);
    return new Molecule(molecule);
  }

  /**
   * Parses a molecule from a V2000 or V3000 molfile.
   *
   * @param molfile the molfile content
   * @return the parsed molecule
   */
  @JSExport
  public static Molecule fromMolfile(String molfile) {
    try {
      return new Molecule(new com.actelion.research.chem.MolfileParser().getCompactMolecule(molfile));
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  /**
   * The canonical idcode of this molecule.
   *
   * @return the idcode
   */
  @JSExport
  public String getIDCode() {
    return molecule.getIDCode();
  }

  /**
   * The encoded 2D coordinates that accompany the idcode.
   *
   * @return the idcoordinates
   */
  @JSExport
  public String getIDCoordinates() {
    return molecule.getIDCoordinates();
  }

  /**
   * Canonical isomeric SMILES of this molecule.
   *
   * @return the SMILES
   */
  @JSExport
  public String toIsomericSmiles() {
    return new com.actelion.research.chem.IsomericSmilesCreator(molecule).getSmiles();
  }

  /**
   * The molecule encoded as a V2000 molfile.
   *
   * @return the molfile
   */
  @JSExport
  public String toMolfile() {
    return new com.actelion.research.chem.MolfileCreator(molecule).getMolfile();
  }

  /**
   * Whether this molecule is a query fragment.
   *
   * @return true if a fragment
   */
  @JSExport
  public boolean isFragment() {
    return molecule.isFragment();
  }

  /**
   * Marks this molecule as a query fragment or not.
   *
   * @param isFragment fragment flag
   */
  @JSExport
  public void setFragment(boolean isFragment) {
    molecule.setFragment(isFragment);
  }

  /**
   * The molecular formula of this molecule.
   *
   * @return the molecular formula
   */
  @JSExport
  public MolecularFormula.Result getMolecularFormula() {
    return MolecularFormula.of(molecule);
  }

  /**
   * Total number of atoms including explicit hydrogens.
   *
   * @return the atom count
   */
  @JSExport
  public int getAllAtoms() {
    return molecule.getAllAtoms();
  }

  /**
   * Total number of bonds.
   *
   * @return the bond count
   */
  @JSExport
  public int getAllBonds() {
    return molecule.getAllBonds();
  }

  /**
   * The set of small rings of this molecule, with aromaticity information.
   *
   * @return the ring collection
   */
  @JSExport
  public RingCollection getRingSet() {
    return new RingCollection(molecule.getRingSet());
  }

  /**
   * The set of small rings of this molecule, with aromaticity information.
   * Alias of {@link #getRingSet()}.
   *
   * @return the ring collection
   */
  @JSExport
  public RingCollection getRingCollection() {
    return new RingCollection(molecule.getRingSet());
  }

  /**
   * X coordinate of an atom.
   *
   * @param atom the atom index
   * @return the x coordinate
   */
  @JSExport
  public double getAtomX(int atom) {
    return molecule.getAtomX(atom);
  }

  /**
   * Y coordinate of an atom.
   *
   * @param atom the atom index
   * @return the y coordinate
   */
  @JSExport
  public double getAtomY(int atom) {
    return molecule.getAtomY(atom);
  }

  /**
   * Sets the reaction atom-mapping number of an atom. Atoms sharing the same map
   * number on the reactant and product side are considered the same atom.
   *
   * @param atom the atom index
   * @param mapNo the mapping number
   */
  @JSExport
  public void setAtomMapNo(int atom, int mapNo) {
    molecule.setAtomMapNo(atom, mapNo, false);
  }

  /**
   * The reaction atom-mapping number of an atom.
   *
   * @param atom the atom index
   * @return the mapping number
   */
  @JSExport
  public int getAtomMapNo(int atom) {
    return molecule.getAtomMapNo(atom);
  }

  /**
   * A compact copy of this molecule (atoms and bonds renumbered to fill gaps).
   *
   * @return the copy
   */
  @JSExport
  public Molecule getCompactCopy() {
    return new Molecule(molecule.getCompactCopy());
  }

  /**
   * Z coordinate of an atom.
   *
   * @param atom the atom index
   * @return the z coordinate
   */
  @JSExport
  public double getAtomZ(int atom) {
    return molecule.getAtomZ(atom);
  }

  /**
   * The atomic number of an atom.
   *
   * @param atom the atom index
   * @return the atomic number
   */
  @JSExport
  public int getAtomicNo(int atom) {
    return molecule.getAtomicNo(atom);
  }

  /**
   * Sets the atomic number of an atom.
   *
   * @param atom the atom index
   * @param no the atomic number
   */
  @JSExport
  public void setAtomicNo(int atom, int no) {
    molecule.setAtomicNo(atom, no);
  }

  /**
   * The element label of an atom (e.g. {@code "C"}, {@code "O"}).
   *
   * @param atom the atom index
   * @return the atom label
   */
  @JSExport
  public String getAtomLabel(int atom) {
    return molecule.getAtomLabel(atom);
  }

  /**
   * The bond order of a bond (1 for single, 2 for double, etc.). Delocalized
   * bonds are reported with their Kekule order.
   *
   * @param bond the bond index
   * @return the bond order
   */
  @JSExport
  public int getBondOrder(int bond) {
    return molecule.getBondOrder(bond);
  }

  /**
   * Whether a bond is part of a delocalized (aromatic) ring.
   *
   * @param bond the bond index
   * @return true if delocalized
   */
  @JSExport
  public boolean isDelocalizedBond(int bond) {
    return molecule.isDelocalizedBond(bond);
  }

  /**
   * The custom label of an atom, or {@code null} if none is set.
   *
   * @param atom the atom index
   * @return the custom label or null
   */
  @JSExport
  public String getAtomCustomLabel(int atom) {
    return molecule.getAtomCustomLabel(atom);
  }

  /**
   * Sets a custom display label on an atom. Pass {@code null} to remove it.
   *
   * @param atom the atom index
   * @param label the custom label, or null to remove
   */
  @JSExport
  public void setAtomCustomLabel(int atom, String label) {
    molecule.setAtomCustomLabel(atom, label);
  }

  /**
   * Adds the implicit hydrogens of every atom (or of a single atom) as explicit
   * atoms.
   *
   * @param options either undefined to add to all atoms, or an object with an
   *     {@code atom} index to add to a single atom
   */
  @JSExport
  public void addImplicitHydrogens(Options.ImplicitHydrogens options) {
    boolean present = options != null && !org.teavm.jso.core.JSObjects.isUndefined(options);
    org.teavm.jso.JSObject raw = present ? options.getAtom() : null;
    if (raw == null || org.teavm.jso.core.JSObjects.isUndefined(raw)) {
      com.actelion.research.chem.contrib.HydrogenHandler.addImplicitHydrogens(molecule);
    } else {
      int atom = raw.<org.teavm.jso.core.JSNumber>cast().intValue();
      com.actelion.research.chem.contrib.HydrogenHandler.addImplicitHydrogens(molecule, atom);
    }
  }

  /**
   * Removes explicit (simple) hydrogen atoms from the molecule, keeping the 2D
   * coordinates valid.
   */
  @JSExport
  public void removeExplicitHydrogens() {
    molecule.removeExplicitHydrogens(true);
  }

  /** Removes all stereo information (parities and stereo bonds) from the molecule. */
  @JSExport
  public void stripStereoInformation() {
    molecule.stripStereoInformation();
  }

  /**
   * Invents new 2D coordinates for the molecule.
   *
   * @param options invention options (skipDefaultTemplates, keepHydrogens,
   *     keepMarkedAtomCoordinates, preferMarkedAtomCoordinates, seed), or
   *     undefined for defaults
   */
  @JSExport
  public void inventCoordinates(Options.Invent options) {
    boolean present = options != null && !org.teavm.jso.core.JSObjects.isUndefined(options);
    int mode = 0;
    if (present && options.isSkipDefaultTemplates()) {
      mode |= com.actelion.research.chem.coords.CoordinateInventor.MODE_SKIP_DEFAULT_TEMPLATES;
    }
    org.teavm.jso.JSObject keepHydrogens = present ? options.getKeepHydrogens() : null;
    boolean keep =
        keepHydrogens != null
            && !org.teavm.jso.core.JSObjects.isUndefined(keepHydrogens)
            && keepHydrogens.<org.teavm.jso.core.JSBoolean>cast().booleanValue();
    if (!keep) {
      mode |= com.actelion.research.chem.coords.CoordinateInventor.MODE_REMOVE_HYDROGEN;
    }
    if (present && options.isKeepMarkedAtomCoordinates()) {
      mode |= com.actelion.research.chem.coords.CoordinateInventor.MODE_KEEP_MARKED_ATOM_COORDS;
    }
    if (present && options.isPreferMarkedAtomCoordinates()) {
      mode |= com.actelion.research.chem.coords.CoordinateInventor.MODE_PREFER_MARKED_ATOM_COORDS;
    }
    int seed = 0;
    if (present) {
      org.teavm.jso.JSObject rawSeed = options.getSeed();
      if (rawSeed != null && !org.teavm.jso.core.JSObjects.isUndefined(rawSeed)) {
        seed = rawSeed.<org.teavm.jso.core.JSNumber>cast().intValue();
      }
    }
    com.actelion.research.chem.coords.CoordinateInventor inventor =
        new com.actelion.research.chem.coords.CoordinateInventor(mode);
    if (seed >= 0) {
      inventor.setRandomSeed((long) seed);
    }
    inventor.invent(molecule);
    molecule.setStereoBondsFromParity();
  }

  /**
   * Copies a subset of this molecule's atoms (and the bonds between them) into a
   * destination molecule.
   *
   * @param destMol the destination molecule (will be cleared and overwritten)
   * @param includeAtom a boolean per atom: true to copy that atom
   * @param recognizeDelocalizedBonds whether to keep delocalized bonds delocalized
   * @param atomMap an int array of this molecule's atom count to receive the
   *     mapping from source to destination atom index, or null
   */
  @JSExport
  public void copyMoleculeByAtoms(
      Molecule destMol, boolean[] includeAtom, boolean recognizeDelocalizedBonds, int[] atomMap) {
    molecule.copyMoleculeByAtoms(
        destMol.getStereoMolecule(), includeAtom, recognizeDelocalizedBonds, atomMap);
  }

  /**
   * Computes the requested helper arrays (neighbours, rings, parities, etc.).
   *
   * @param required the helper level bit mask (see the cHelper* constants)
   */
  @JSExport
  public void ensureHelperArrays(int required) {
    molecule.ensureHelperArrays(required);
  }

  /**
   * The diastereotopic atom ids of every atom. Two atoms that are
   * indistinguishable by symmetry share the same id.
   *
   * @return one idcode-like id per atom
   */
  @JSExport
  public String[] getDiastereotopicAtomIDs() {
    return com.actelion.research.chem.contrib.DiastereotopicAtomID.getAtomIds(molecule);
  }

  /**
   * The atomic number for a given element or pseudo-atom label.
   *
   * @param atomLabel the element or pseudo-atom label
   * @param allowedPseudoAtomGroups the bit mask of allowed pseudo-atom groups
   * @return the atomic number
   */
  @JSExport
  public static int getAtomicNoFromLabel(String atomLabel, int allowedPseudoAtomGroups) {
    return StereoMolecule.getAtomicNoFromLabel(atomLabel, allowedPseudoAtomGroups);
  }
}
