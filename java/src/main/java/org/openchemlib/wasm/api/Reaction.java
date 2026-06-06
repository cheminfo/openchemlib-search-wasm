package org.openchemlib.wasm.api;

import com.actelion.research.chem.IsomericSmilesCreator;
import com.actelion.research.chem.StereoMolecule;
import com.actelion.research.chem.io.RXNFileCreator;
import com.actelion.research.chem.io.RXNFileParser;
import com.actelion.research.chem.io.RXNFileV3Creator;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.reaction.Reaction},
 * mirroring the openchemlib-js {@code Reaction} API. Holds the underlying OCL
 * reaction and exposes its reactants, products and catalysts as facade
 * {@link Molecule} objects.
 */
public class Reaction {
  /** Matches the OCL_RXN code line that openchemlib-js strips by default. */
  private static final java.util.regex.Pattern RXN_ID_CODE_LINE =
      java.util.regex.Pattern.compile("^OCL_RXN_V1\\.0:.*$", java.util.regex.Pattern.MULTILINE);

  private final com.actelion.research.chem.reaction.Reaction reaction;

  /** Wraps an existing OCL reaction (internal). */
  Reaction(com.actelion.research.chem.reaction.Reaction reaction) {
    this.reaction = reaction;
  }

  /**
   * Creates a new empty reaction with an optional name.
   *
   * @param name the initial reaction name, or undefined/null for none
   */
  @JSExport
  public Reaction(String name) {
    if (name == null || JSObjects.isUndefined(name)) {
      this.reaction = new com.actelion.research.chem.reaction.Reaction();
    } else {
      this.reaction = new com.actelion.research.chem.reaction.Reaction(name);
    }
  }

  /** Underlying OCL reaction, for sibling facade classes (internal). */
  com.actelion.research.chem.reaction.Reaction getReaction() {
    return reaction;
  }

  /**
   * Creates a new empty reaction.
   *
   * @return the empty reaction
   */
  @JSExport
  public static Reaction create() {
    return new Reaction(new com.actelion.research.chem.reaction.Reaction());
  }

  /**
   * Creates a reaction from an array of molecules.
   *
   * @param molecules the reactants followed by the products
   * @param reactantCount the number of leading molecules that are reactants
   * @return the reaction
   */
  // moved to TS (object-array param triggers a TeaVM codegen bug)
  static Reaction fromMolecules(Molecule[] molecules, int reactantCount) {
    StereoMolecule[] oclMolecules = new StereoMolecule[molecules.length];
    for (int i = 0; i < molecules.length; i++) {
      oclMolecules[i] = molecules[i].getStereoMolecule();
    }
    return new Reaction(new com.actelion.research.chem.reaction.Reaction(oclMolecules, reactantCount));
  }

  /**
   * Creates a reaction from a reaction SMILES string.
   *
   * @param smiles the reaction SMILES
   * @return the reaction
   */
  @JSExport
  public static Reaction fromSmiles(String smiles) {
    try {
      com.actelion.research.chem.reaction.Reaction reaction =
          new com.actelion.research.chem.SmilesParser().parseReaction(smiles);
      return new Reaction(reaction);
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  /**
   * Creates a reaction from an MDL RXN file (V2000 or V3000).
   *
   * @param rxn the RXN file contents
   * @return the reaction
   */
  @JSExport
  public static Reaction fromRxn(String rxn) {
    try {
      return new Reaction(new RXNFileParser().getReaction(rxn));
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  /**
   * Serializes the reaction to a reaction SMILES string.
   *
   * @return the reaction SMILES
   */
  @JSExport
  public String toSmiles() {
    return IsomericSmilesCreator.createReactionSmiles(reaction);
  }

  /**
   * Serializes the reaction to an MDL V2000 RXN file.
   *
   * @param options serialization options (programName, keepIdCode), or undefined
   * @return the RXN file contents
   */
  @JSExport
  public String toRxn(Options.ToRxn options) {
    String rxn = new RXNFileCreator(reaction, programNameFromOptions(options)).getRXNfile();
    return stripIdCode(rxn, options);
  }

  /**
   * Serializes the reaction to an MDL V3000 RXN file.
   *
   * @param options serialization options (programName, keepIdCode), or undefined
   * @return the RXN file contents
   */
  @JSExport
  public String toRxnV3(Options.ToRxn options) {
    String rxn = new RXNFileV3Creator(reaction, programNameFromOptions(options)).getRXNfile();
    return stripIdCode(rxn, options);
  }

  /**
   * Returns a deep copy of this reaction.
   *
   * @return the cloned reaction
   */
  @JSExport
  public Reaction clone() {
    return new Reaction(new com.actelion.research.chem.reaction.Reaction(reaction));
  }

  /** Empties the reaction. */
  @JSExport
  public void clear() {
    reaction.clear();
  }

  /** Removes all catalysts from the reaction. */
  @JSExport
  public void removeCatalysts() {
    reaction.removeCatalysts();
  }

  /**
   * Whether the reaction is empty.
   *
   * @return true if empty
   */
  @JSExport
  public boolean isEmpty() {
    return reaction.isEmpty();
  }

  /**
   * Marks the reaction as a query fragment or not.
   *
   * @param isFragment fragment flag
   */
  @JSExport
  public void setFragment(boolean isFragment) {
    reaction.setFragment(isFragment);
  }

  /**
   * Whether the reaction is a query fragment.
   *
   * @return true if a fragment
   */
  @JSExport
  public boolean isFragment() {
    return reaction.isFragment();
  }

  /**
   * Returns the reactant at the given index.
   *
   * @param index the reactant index
   * @return the reactant molecule
   */
  @JSExport
  public Molecule getReactant(int index) {
    return new Molecule(reaction.getReactant(index));
  }

  /**
   * The number of reactants.
   *
   * @return the reactant count
   */
  @JSExport
  public int getReactants() {
    return reaction.getReactants();
  }

  /**
   * Returns the product at the given index.
   *
   * @param index the product index
   * @return the product molecule
   */
  @JSExport
  public Molecule getProduct(int index) {
    return new Molecule(reaction.getProduct(index));
  }

  /**
   * The number of products.
   *
   * @return the product count
   */
  @JSExport
  public int getProducts() {
    return reaction.getProducts();
  }

  /**
   * Returns the catalyst at the given index.
   *
   * @param index the catalyst index
   * @return the catalyst molecule
   */
  @JSExport
  public Molecule getCatalyst(int index) {
    return new Molecule(reaction.getCatalyst(index));
  }

  /**
   * The number of catalysts.
   *
   * @return the catalyst count
   */
  @JSExport
  public int getCatalysts() {
    return reaction.getCatalysts();
  }

  /**
   * The total number of reactants and products.
   *
   * @return the molecule count
   */
  @JSExport
  public int getMolecules() {
    return reaction.getMolecules();
  }

  /**
   * Returns the reactant or product at the given index (reactants first).
   *
   * @param index the molecule index
   * @return the molecule
   */
  @JSExport
  public Molecule getMolecule(int index) {
    return new Molecule(reaction.getMolecule(index));
  }

  /**
   * Adds a molecule to the reactants.
   *
   * @param reactant the reactant to add
   */
  @JSExport
  public void addReactant(Molecule reactant) {
    reaction.addReactant(reactant.getStereoMolecule());
  }

  /**
   * Adds a molecule to the reactants at the given position.
   *
   * @param reactant the reactant to add
   * @param position the insertion position
   */
  @JSExport
  public void addReactantAt(Molecule reactant, int position) {
    reaction.addReactant(reactant.getStereoMolecule(), position);
  }

  /**
   * Adds a molecule to the products.
   *
   * @param product the product to add
   */
  @JSExport
  public void addProduct(Molecule product) {
    reaction.addProduct(product.getStereoMolecule());
  }

  /**
   * Adds a molecule to the products at the given position.
   *
   * @param product the product to add
   * @param position the insertion position
   */
  @JSExport
  public void addProductAt(Molecule product, int position) {
    reaction.addProduct(product.getStereoMolecule(), position);
  }

  /**
   * Adds a molecule to the catalysts.
   *
   * @param catalyst the catalyst to add
   */
  @JSExport
  public void addCatalyst(Molecule catalyst) {
    reaction.addCatalyst(catalyst.getStereoMolecule());
  }

  /**
   * Adds a molecule to the catalysts at the given position.
   *
   * @param catalyst the catalyst to add
   * @param position the insertion position
   */
  @JSExport
  public void addCatalystAt(Molecule catalyst, int position) {
    reaction.addCatalyst(catalyst.getStereoMolecule(), position);
  }

  /**
   * The reaction name.
   *
   * @return the name
   */
  @JSExport
  public String getName() {
    return reaction.getName();
  }

  /**
   * Sets the reaction name.
   *
   * @param name the new name
   */
  @JSExport
  public void setName(String name) {
    reaction.setName(name);
  }

  /**
   * The average bond length among reactants and products.
   *
   * @return the average bond length
   */
  @JSExport
  public double getAverageBondLength() {
    return reaction.getAverageBondLength();
  }

  /**
   * Whether the molecules' coordinate bounds touch or overlap.
   *
   * @return true if a layout is required
   */
  @JSExport
  public boolean isReactionLayoutRequired() {
    return reaction.isReactionLayoutRequired();
  }

  /**
   * Whether all non-hydrogen atoms are mapped one-to-one across the reaction.
   *
   * @return true if perfectly mapped
   */
  @JSExport
  public boolean isPerfectlyMapped() {
    return reaction.isPerfectlyMapped();
  }

  /**
   * The highest mapping number in use.
   *
   * @return the highest map number
   */
  @JSExport
  public int getHighestMapNo() {
    return reaction.getHighestMapNo();
  }

  /**
   * Removes mapping numbers used on only one side of the reaction.
   *
   * @throws IllegalArgumentException if duplicate mapping numbers occur
   */
  @JSExport
  public void validateMapping() {
    try {
      reaction.validateMapping();
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  /**
   * Flags every mapping number that refers to an atom changing bonds.
   *
   * @return a boolean array indexed by mapping number, or null
   */
  @JSExport
  public boolean[] getReactionCenterMapNos() {
    return reaction.getReactionCenterMapNos();
  }

  /**
   * Merges all reactants into one molecule and all products into another.
   *
   * @return the merged reaction
   */
  @JSExport
  public Reaction getMergedCopy() {
    return new Reaction(reaction.getMergedCopy());
  }

  private static String stripIdCode(String rxn, Options.ToRxn options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    if (present && options.isKeepIdCode()) {
      return rxn;
    }
    return RXN_ID_CODE_LINE.matcher(rxn).replaceFirst("");
  }

  private static String programNameFromOptions(Options.ToRxn options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    String programName = present ? options.getProgramName() : null;
    return programName == null ? "" : programName;
  }
}
