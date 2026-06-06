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
}
