package org.openchemlib.wasm;

import com.actelion.research.chem.Canonizer;
import com.actelion.research.chem.Molecule;
import com.actelion.research.chem.StereoMolecule;
import com.actelion.research.chem.coords.CoordinateInventor;

/**
 * The canonical idcode of a molecule, as {@code openchemlib-js} gives it for {@code
 * Molecule.fromIDCode(idCode).getIDCode()}: the default parse, which invents 2D coordinates, then
 * {@code getIDCode()}.
 *
 * <p>Canonizing the coordinate-free molecule every other export parses would not do: the Canonizer
 * computes stereo parities from coordinates and up/down bonds, so without them it loses them, and
 * 330 of the 1,999 test idcodes come back different. Parsing a second time with {@code new
 * IDCodeParser(true)} would cost a second parse. So this replays, on a copy, exactly what {@code
 * IDCodeParserWithoutCoordinateInvention.parse} does after the bit stream when {@code
 * ensure2DCoordinates()} holds, with the coordinate inventor {@code IDCodeParser.inventCoordinates}
 * uses. Up to that point the two parses build the same molecule.
 */
final class Canonical {
  /** The seed {@code IDCodeParser.inventCoordinates} uses, which makes the coordinates reproducible. */
  private static final long COORDINATE_SEED = 0x1234567890L;

  private Canonical() {}

  /**
   * The canonical idcode of a molecule parsed without coordinates.
   *
   * @param molecule a molecule from {@code IDCodeParserWithoutCoordinateInvention}, with its parities
   *     valid and no coordinates; not modified
   * @return its canonical idcode, stereochemistry included
   */
  static String idCodeOf(StereoMolecule molecule) {
    // getCompactCopy keeps the parities-valid flag, because the parsed molecule has no Canonizer
    // yet (StereoMolecule.copyMoleculeProperties).
    StereoMolecule copy = molecule.getCompactCopy();

    // A double bond without E/Z parity may be a stereo bond of unknown configuration or no stereo
    // bond at all; the flag makes the Canonizer assign "unknown" rather than read E or Z off the
    // invented coordinates.
    copy.ensureHelperArrays(Molecule.cHelperRings);
    for (int bond = 0; bond < copy.getBonds(); bond++) {
      if (copy.getBondOrder(bond) == 2
          && !copy.isSmallRingBond(bond)
          && copy.getBondParity(bond) == Molecule.cBondParityNone) {
        copy.setBondParityUnknownOrNone(bond);
      }
    }
    copy.setParitiesValid(0);

    boolean hasCoordinates = true;
    try {
      CoordinateInventor inventor = new CoordinateInventor(CoordinateInventor.MODE_DEFAULT);
      inventor.setRandomSeed(COORDINATE_SEED);
      inventor.invent(copy);
    } catch (Exception error) {
      // The parser goes on without coordinates when inventing them fails, and so does this.
      hasCoordinates = false;
    }
    if (hasCoordinates) {
      copy.setStereoBondsFromParity();
      copy.setUnknownParitiesToExplicitlyUnknown();
    }

    // openchemlib-js's getIDCode, which falls back to a Canonizer of its own when the molecule has
    // valid parities but no coordinates to build one from.
    String idCode = copy.getIDCode();
    return idCode != null ? idCode : new Canonizer(copy).getIDCode();
  }
}
