package org.openchemlib.wasm.api;

import java.io.StringReader;
import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.io.SDFileParser}, mirroring
 * the openchemlib-js {@code SDFileParser} API. Parses an SDF document from a
 * string and iterates over its records one molecule at a time.
 */
public class SDFileParser {
  private final com.actelion.research.chem.io.SDFileParser parser;

  /**
   * Creates a parser over the given SDF document.
   *
   * @param sdf the SDF content as a string
   * @param fields the field names to extract per record, or {@code null} to scan
   *     the document for all field names (less efficient)
   */
  @JSExport
  public SDFileParser(String sdf, String[] fields) {
    this.parser =
        new com.actelion.research.chem.io.SDFileParser(new StringReader(sdf), fields);
  }

  /**
   * Advances to the next record.
   *
   * @return true if a record is available, false at the end of the document
   */
  @JSExport
  public boolean next() {
    return parser.next();
  }

  /**
   * The molecule of the current record.
   *
   * @return the molecule
   */
  @JSExport
  public Molecule getMolecule() {
    return new Molecule(parser.getMolecule());
  }

  /**
   * The molfile of the current record, exactly as read from the document.
   *
   * @return the molfile
   */
  @JSExport
  public String getNextMolFile() {
    return parser.getNextMolFile();
  }

  /**
   * The field data of the current record, exactly as read from the document.
   *
   * @return the field data
   */
  @JSExport
  public String getNextFieldData() {
    return parser.getNextFieldData();
  }

  /**
   * The list of field names found by inspecting the first records of the
   * document.
   *
   * @param recordsToInspect the number of records to scan
   * @return the field names
   */
  @JSExport
  public String[] getFieldNames(int recordsToInspect) {
    return parser.getFieldNames(recordsToInspect);
  }

  /**
   * The data of the field at the given index for the current record.
   *
   * @param index the field index
   * @return the field data, or {@code null} if absent
   */
  @JSExport
  public String getFieldData(int index) {
    return parser.getFieldData(index);
  }

  /**
   * The data of the named field for the current record.
   *
   * @param name the field name
   * @return the field data, or {@code null} if the field is absent
   */
  @JSExport
  public String getField(String name) {
    String[] names = parser.getFieldNames();
    for (int i = 0; i < names.length; i++) {
      if (names[i].equals(name)) {
        return parser.getFieldData(i);
      }
    }
    return null;
  }
}
