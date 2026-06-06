package org.openchemlib.wasm.api;

import com.actelion.research.chem.StereoMolecule;
import java.nio.charset.StandardCharsets;
import org.teavm.jso.JSExport;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.SmilesParser}, mirroring the
 * openchemlib-js {@code SmilesParser} API.
 */
public class SmilesParser {
  private final com.actelion.research.chem.SmilesParser parser;

  /**
   * Creates a parser from an options object.
   *
   * @param options parsing options, or undefined for defaults
   */
  @JSExport
  public SmilesParser(Options.Smiles options) {
    this.parser = new com.actelion.research.chem.SmilesParser(modeFromOptions(options));
  }

  /**
   * Sets the random seed used during coordinate invention so that successive
   * parses are reproducible.
   *
   * @param seed the random seed
   */
  @JSExport
  public void setRandomSeed(int seed) {
    parser.setRandomSeed((long) seed);
  }

  /**
   * Parses a SMILES string into a molecule. If {@code options.molecule} is set,
   * the SMILES is parsed into that molecule and the same instance is returned;
   * otherwise a new molecule is created.
   *
   * @param smiles the SMILES string
   * @param options parse options (molecule, noCoordinates, noStereo), or undefined
   * @return the parsed molecule
   */
  @JSExport
  public Molecule parseMolecule(String smiles, Options.Smiles options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    // Read the optional destination molecule as a raw value first so an absent
    // property does not crash the facade-typed unwrap.
    org.teavm.jso.JSObject rawMolecule = present ? options.getMoleculeRaw() : null;
    Molecule target =
        (rawMolecule != null && !JSObjects.isUndefined(rawMolecule))
            ? options.getMolecule()
            : new Molecule(new StereoMolecule());
    boolean createCoordinates = !present || !options.isNoCoordinates();
    boolean readStereoFeatures = !present || !options.isNoStereo();
    try {
      parser.parse(
          target.getStereoMolecule(),
          smiles.getBytes(StandardCharsets.UTF_8),
          createCoordinates,
          readStereoFeatures);
    } catch (Exception e) {
      throw new IllegalArgumentException(e.getMessage());
    }
    return target;
  }

  /**
   * The warning produced while parsing SMARTS, if requested.
   *
   * @return the SMARTS warning text
   */
  @JSExport
  public String getSmartsWarning() {
    return parser.getSmartsWarning();
  }

  /** Shared by {@link Molecule#fromSmiles}. */
  static Molecule parseToMolecule(String smiles, Options.Smiles options) {
    return new SmilesParser(options).parseMolecule(smiles, options);
  }

  private static int modeFromOptions(Options.Smiles options) {
    int mode = com.actelion.research.chem.SmilesParser.SMARTS_MODE_IS_SMILES;
    boolean present = options != null && !JSObjects.isUndefined(options);
    String smartsMode = present ? options.getSmartsMode() : null;
    if (smartsMode == null) {
      smartsMode = "smiles";
    }
    switch (smartsMode) {
      case "smarts":
        mode = com.actelion.research.chem.SmilesParser.SMARTS_MODE_IS_SMARTS;
        break;
      case "guess":
        mode = com.actelion.research.chem.SmilesParser.SMARTS_MODE_GUESS;
        break;
      default:
        break;
    }
    if (present) {
      if (options.isMakeHydrogenExplicit()) {
        mode |= com.actelion.research.chem.SmilesParser.MODE_MAKE_HYDROGEN_EXPLICIT;
      }
      if (options.isSkipCoordinateTemplates()) {
        mode |= com.actelion.research.chem.SmilesParser.MODE_SKIP_COORDINATE_TEMPLATES;
      }
      if (options.isNoCactvs()) {
        mode |= com.actelion.research.chem.SmilesParser.MODE_NO_CACTUS_SYNTAX;
      }
      if (options.isSingleDotSeparator()) {
        mode |= com.actelion.research.chem.SmilesParser.MODE_SINGLE_DOT_SEPARATOR;
      }
      if (options.isCreateSmartsWarnings()) {
        mode |= com.actelion.research.chem.SmilesParser.MODE_CREATE_SMARTS_WARNING;
      }
    }
    return mode;
  }
}
