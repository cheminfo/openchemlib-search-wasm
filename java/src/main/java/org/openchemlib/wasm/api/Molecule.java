package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSExport;
import org.teavm.jso.JSProperty;

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
   * @param options output options (createSmarts, includeMapping, kekulizedOutput),
   *     or undefined for defaults
   * @return the SMILES
   */
  @JSExport
  public String toIsomericSmiles(Options.IsomericSmiles options) {
    boolean present = options != null && !org.teavm.jso.core.JSObjects.isUndefined(options);
    int mode = 0;
    if (present) {
      if (options.isCreateSmarts()) {
        mode |= com.actelion.research.chem.IsomericSmilesCreator.MODE_CREATE_SMARTS;
      }
      if (options.isIncludeMapping()) {
        mode |= com.actelion.research.chem.IsomericSmilesCreator.MODE_INCLUDE_MAPPING;
      }
      if (options.isKekulizedOutput()) {
        mode |= com.actelion.research.chem.IsomericSmilesCreator.MODE_KEKULIZED_OUTPUT;
      }
    }
    return new com.actelion.research.chem.IsomericSmilesCreator(molecule, mode).getSmiles();
  }

  /**
   * SMILES of this molecule with aromatic rings written in their kekulized form.
   *
   * @deprecated use {@link #toIsomericSmiles} with {@code kekulizedOutput: true}
   * @return the SMILES
   */
  @Deprecated
  @JSExport
  public String toSmiles() {
    return new com.actelion.research.chem.IsomericSmilesCreator(
            molecule, com.actelion.research.chem.IsomericSmilesCreator.MODE_KEKULIZED_OUTPUT)
        .getSmiles();
  }

  /**
   * SMARTS pattern of this query fragment.
   *
   * @return the SMARTS
   */
  @JSExport
  public String toSmarts() {
    return new com.actelion.research.chem.IsomericSmilesCreator(
            molecule, com.actelion.research.chem.IsomericSmilesCreator.MODE_CREATE_SMARTS)
        .getSmiles();
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
   * The molecule encoded as a V3000 molfile.
   *
   * @return the molfile
   */
  @JSExport
  public String toMolfileV3() {
    return new com.actelion.research.chem.MolfileV3Creator(molecule).getMolfile();
  }

  /**
   * Renders the molecule as an SVG string (primitive used by the {@code toSVG}
   * wrapper, which adds option handling and SVG sanitisation in JS). Atom and
   * bond elements are tagged with the given id (e.g. {@code id:Atom:0}).
   *
   * @param width the SVG width in pixels
   * @param height the SVG height in pixels
   * @param factorTextSize text-size scale factor
   * @param autoCrop whether to crop the viewport to the molecule's bounding box
   * @param autoCropMargin margin in pixels when auto-cropping
   * @param id the id prefix for atom/bond elements
   * @return the SVG markup
   */
  @JSExport
  public String _toSVG(
      int width,
      int height,
      float factorTextSize,
      boolean autoCrop,
      int autoCropMargin,
      String id,
      Options.ToSVG options) {
    StereoMolecule target = molecule;
    boolean degenerated = true;
    for (int i = 0; i < molecule.getAllAtoms() - 1; i++) {
      if (molecule.getAtomX(i) != molecule.getAtomX(i + 1)
          || molecule.getAtomY(i) != molecule.getAtomY(i + 1)) {
        degenerated = false;
        break;
      }
    }
    if (degenerated) {
      target = molecule.getCompactCopy();
      new com.actelion.research.chem.coords.CoordinateInventor(0).invent(target);
    }
    target.ensureHelperArrays(
        com.actelion.research.chem.Molecule.cHelperSymmetryStereoHeterotopicity);
    int viewMode =
        com.actelion.research.chem.AbstractDepictor.cModeInflateToMaxAVBL
            | com.actelion.research.chem.AbstractDepictor.cModeChiralTextBelowMolecule;
    int displayMode = displayModeFromOptions(options);
    com.actelion.research.chem.SVGDepictor depictor =
        new com.actelion.research.chem.SVGDepictor(target, displayMode, id);
    depictor.setFactorTextSize(factorTextSize);
    depictor.validateView(
        null, new com.actelion.research.gui.generic.GenericRectangle(0, 0, width, height), viewMode);
    com.actelion.research.gui.generic.GenericRectangle bounds = depictor.getBoundingRect();
    depictor.paint(null);
    String result = depictor.toString();
    if (!autoCrop) {
      return result;
    }
    int newWidth = (int) Math.round(bounds.width + autoCropMargin * 2);
    int newHeight = (int) Math.round(bounds.height + autoCropMargin * 2);
    int newX = (int) Math.round(bounds.x - autoCropMargin);
    int newY = (int) Math.round(bounds.y - autoCropMargin);
    return result.replaceAll(
        "width=\"\\d+px\" height=\"\\d+px\" viewBox=\"0 0 \\d+ \\d+\"",
        "width=\""
            + newWidth
            + "px\" height=\""
            + newHeight
            + "px\" viewBox=\""
            + newX
            + " "
            + newY
            + " "
            + newWidth
            + " "
            + newHeight
            + "\"");
  }

  private static int displayModeFromOptions(Options.ToSVG options) {
    if (options == null || org.teavm.jso.core.JSObjects.isUndefined(options)) {
      return 0;
    }
    int mode = 0;
    if (options.isNoTabus()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoTabus;
    }
    if (options.isShowAtomNumber()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeAtomNo;
    }
    if (options.isShowBondNumber()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeBondNo;
    }
    if (options.isHighlightQueryFeatures()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeHiliteAllQueryFeatures;
    }
    if (options.isShowMapping()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeShowMapping;
    }
    if (options.isSuppressChiralText()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeSuppressChiralText;
    }
    if (options.isSuppressCIPParity()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeSuppressCIPParity;
    }
    if (options.isSuppressESR()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeSuppressESR;
    }
    if (options.isNoCarbonLabelWithCustomLabel()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoCarbonLabelWithCustomLabel;
    }
    if (options.isNoAtomCustomLabels()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoAtomCustomLabels;
    }
    if (options.isShowSymmetrySimple()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeShowSymmetrySimple;
    }
    if (options.isShowSymmetryStereoHeterotopicity()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeShowSymmetryStereoHeterotopicity;
    }
    if (options.isNoImplicitAtomLabelColors()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoImplicitAtomLabelColors;
    }
    if (options.isNoStereoProblem()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoStereoProblem;
    }
    if (options.isNoColorOnESRAndCIP()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoColorOnESRAndCIP;
    }
    if (options.isNoImplicitHydrogen()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeNoImplicitHydrogen;
    }
    if (options.isDrawBondsInGray()) {
      mode |= com.actelion.research.chem.AbstractDepictor.cDModeDrawBondsInGray;
    }
    return mode;
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

  /** The {@code {molecule, map}} value object returned by {@link #fromMolfileWithAtomMap}. */
  public interface AtomMapResult extends org.teavm.jso.JSObject {
    @JSProperty
    void setMolecule(Molecule molecule);

    @JSProperty
    void setMap(int[] map);
  }

  /** The {@code {idCode, coordinates}} value object returned by {@link #getIDCodeAndCoordinates}. */
  public interface IDCodeAndCoordinates extends org.teavm.jso.JSObject {
    @JSProperty
    void setIdCode(String idCode);

    @JSProperty
    void setCoordinates(String coordinates);
  }

  /**
   * Parses a V2000 or V3000 molfile, keeping the mapping between the molfile
   * atom order and the (compacted) molecule atom order, including hydrogens.
   *
   * @param molfile the molfile content
   * @return a {@code {molecule, map}} object where {@code map[i]} is the molfile
   *     atom index of the molecule's atom {@code i}
   */
  @JSExport
  public static AtomMapResult fromMolfileWithAtomMap(String molfile) {
    try {
      com.actelion.research.chem.MolfileParser parser =
          new com.actelion.research.chem.MolfileParser(
              com.actelion.research.chem.MolfileParser.MODE_KEEP_HYDROGEN_MAP);
      StereoMolecule parsed = parser.getCompactMolecule(molfile);
      int[] map = parser.getHandleHydrogenMap();
      AtomMapResult result = org.teavm.jso.core.JSObjects.create().cast();
      result.setMolecule(new Molecule(parsed));
      result.setMap(map);
      return result;
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  /**
   * The idcode together with its encoded 2D coordinates.
   *
   * @return a {@code {idCode, coordinates}} object
   */
  @JSExport
  public IDCodeAndCoordinates getIDCodeAndCoordinates() {
    IDCodeAndCoordinates result = org.teavm.jso.core.JSObjects.create().cast();
    result.setIdCode(molecule.getIDCode());
    result.setCoordinates(molecule.getIDCoordinates());
    return result;
  }

  /**
   * Sets the X coordinate of an atom.
   *
   * @param atom the atom index
   * @param x the x coordinate
   */
  @JSExport
  public void setAtomX(int atom, double x) {
    molecule.setAtomX(atom, x);
  }

  /**
   * Sets the Y coordinate of an atom.
   *
   * @param atom the atom index
   * @param y the y coordinate
   */
  @JSExport
  public void setAtomY(int atom, double y) {
    molecule.setAtomY(atom, y);
  }

  /**
   * Sets the Z coordinate of an atom.
   *
   * @param atom the atom index
   * @param z the z coordinate
   */
  @JSExport
  public void setAtomZ(int atom, double z) {
    molecule.setAtomZ(atom, z);
  }

  /**
   * Sets or clears a single atom query feature (only meaningful for query
   * fragments).
   *
   * @param atom the atom index
   * @param feature the query-feature bit mask (a cAtomQF* constant)
   * @param value true to set the feature, false to clear it
   */
  @JSExport
  public void setAtomQueryFeature(int atom, double feature, boolean value) {
    molecule.setAtomQueryFeature(atom, (long) feature, value);
  }

  /**
   * Decodes the query features of an atom into a value object with one boolean
   * per query flag (and ring-size numbers).
   *
   * @param atom the atom index
   * @return the atom query-feature object
   */
  @JSExport
  public MoleculeQueryFeatures.AtomResult getAtomQueryFeaturesObject(int atom) {
    return MoleculeQueryFeatures.ofAtom(molecule, atom);
  }

  /**
   * Decodes the query features of a bond into a value object.
   *
   * @param bond the bond index
   * @return the bond query-feature object
   */
  @JSExport
  public MoleculeQueryFeatures.BondResult getBondQueryFeaturesObject(int bond) {
    return MoleculeQueryFeatures.ofBond(molecule, bond);
  }

  /**
   * The canonical idcode produced with the given canonization mode flags.
   *
   * @param flag the canonization mode bit mask
   * @return the idcode
   */
  @JSExport
  public String getCanonizedIDCode(int flag) {
    return new com.actelion.research.chem.Canonizer(molecule, flag).getIDCode();
  }

  /**
   * The final canonical rank of every atom, produced with the given canonization
   * mode flags.
   *
   * @param flag the canonization mode bit mask
   * @return the final ranks as an Int32Array
   */
  @JSExport
  public int[] getFinalRanks(int flag) {
    return new com.actelion.research.chem.Canonizer(molecule, flag).getFinalRank();
  }

  /**
   * A human-readable description of the molecule's overall chirality.
   *
   * @return the chiral text
   */
  @JSExport
  public String getChiralText() {
    return molecule.getChiralText();
  }

  /**
   * Adds explicit stereo information (ESR) to stereo centers that currently lack
   * it, using the given ESR type, or undefined for the default absolute type.
   *
   * @param esrType the ESR type (a cESRType* constant), or undefined for default
   */
  @JSExport
  public void addMissingChirality(org.teavm.jso.JSObject esrType) {
    if (esrType == null || org.teavm.jso.core.JSObjects.isUndefined(esrType)) {
      com.actelion.research.chem.contrib.DiastereotopicAtomID.addMissingChirality(molecule);
    } else {
      int type = esrType.<org.teavm.jso.core.JSNumber>cast().intValue();
      com.actelion.research.chem.contrib.DiastereotopicAtomID.addMissingChirality(molecule, type);
    }
  }

  /**
   * Adjusts the position marker of every custom atom label.
   *
   * <ul>
   *   <li>{@code "superscript"} prefixes each label with {@code "]"}.
   *   <li>{@code "normal"} removes a leading {@code "]"}.
   *   <li>{@code "auto"} makes labels superscript except on carbon atoms.
   *   <li>{@code undefined} leaves the labels untouched.
   * </ul>
   *
   * @param customLabelPosition the position mode, or undefined for no change
   */
  @JSExport
  public void changeCustomLabelPosition(String customLabelPosition) {
    if (customLabelPosition == null) {
      return;
    }
    switch (customLabelPosition) {
      case "superscript":
        for (int i = 0; i < molecule.getAllAtoms(); i++) {
          String label = molecule.getAtomCustomLabel(i);
          if (label != null && !label.startsWith("]")) {
            molecule.setAtomCustomLabel(i, "]" + label);
          }
        }
        break;
      case "normal":
        for (int i = 0; i < molecule.getAllAtoms(); i++) {
          String label = molecule.getAtomCustomLabel(i);
          if (label != null && label.startsWith("]")) {
            molecule.setAtomCustomLabel(i, label.substring(1));
          }
        }
        break;
      case "auto":
        for (int i = 0; i < molecule.getAllAtoms(); i++) {
          String label = molecule.getAtomCustomLabel(i);
          if (label != null) {
            if ("C".equals(molecule.getAtomLabel(i))) {
              if (label.startsWith("]")) {
                molecule.setAtomCustomLabel(i, label.substring(1));
              }
            } else if (!label.startsWith("]")) {
              molecule.setAtomCustomLabel(i, "]" + label);
            }
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * Computes the next free custom atom label, starting from the given one (or
   * {@code "1"} when empty) and incrementing the trailing number or letter until
   * an unused label is found.
   *
   * @param label the starting label (may be empty)
   * @return the next custom atom label that is not already used in this molecule
   */
  @JSExport
  public String getNextCustomAtomLabel(String label) {
    String nextLabel = (label == null || label.isEmpty()) ? "1" : label;
    java.util.Set<String> existingLabels = new java.util.HashSet<>();
    for (int i = 0; i < molecule.getAllAtoms(); i++) {
      String existingLabel = molecule.getAtomCustomLabel(i);
      if (existingLabel != null) {
        existingLabels.add(existingLabel);
      }
    }
    int counter = 0;
    while (existingLabels.contains(nextLabel) && counter++ < 100) {
      nextLabel = incrementLabel(nextLabel);
    }
    return nextLabel;
  }

  private static final java.util.regex.Pattern NUMBER_PATTERN =
      java.util.regex.Pattern.compile("(\\d+)");
  private static final java.util.regex.Pattern LETTER_PATTERN =
      java.util.regex.Pattern.compile("([a-yA-Y])([^a-zA-Z]*)$");

  private static String incrementLabel(String label) {
    java.util.regex.Matcher numberMatcher = NUMBER_PATTERN.matcher(label);
    if (numberMatcher.find()) {
      int number = Integer.parseInt(numberMatcher.group(1));
      return NUMBER_PATTERN.matcher(label).replaceFirst(Integer.toString(number + 1));
    }
    java.util.regex.Matcher letterMatcher = LETTER_PATTERN.matcher(label);
    if (letterMatcher.find()) {
      int codePoint = letterMatcher.group(1).codePointAt(0);
      String nextChar = new String(Character.toChars(codePoint + 1));
      if ("Z".equals(nextChar) || "z".equals(nextChar)) {
        return "1";
      }
      String suffix = letterMatcher.group(2);
      return label.substring(0, letterMatcher.start()) + nextChar + suffix;
    }
    return "1";
  }
}
