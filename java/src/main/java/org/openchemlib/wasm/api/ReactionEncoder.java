package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;
import org.teavm.jso.JSObject;
import org.teavm.jso.core.JSBoolean;
import org.teavm.jso.core.JSNumber;
import org.teavm.jso.core.JSObjects;

/**
 * WASM facade for {@code com.actelion.research.chem.reaction.ReactionEncoder},
 * mirroring the openchemlib-js {@code ReactionEncoder} API. Provides static
 * {@code encode} / {@code decode} helpers driven by an options object.
 */
public final class ReactionEncoder {
  private ReactionEncoder() {}

  /**
   * Encodes a reaction to its compact string representation.
   *
   * <p>When the options object carries {@code sortByIDCode} the molecules are
   * sorted and the parts are joined with the object delimiter; otherwise the
   * {@code mode} bitmask (default {@code INCLUDE_DEFAULT}) is used.
   *
   * @param reaction the reaction to encode
   * @param options encode options (keepAbsoluteCoordinates, sortByIDCode, mode), or undefined
   * @return the encoded string, or null if the reaction has no reactants or products
   */
  @JSExport
  public static String encode(Reaction reaction, Options.ReactionEncode options) {
    boolean present = options != null && !JSObjects.isUndefined(options);
    boolean keepAbsoluteCoordinates = present && options.isKeepAbsoluteCoordinates();

    JSObject rawSort = present ? options.getSortByIDCode() : null;
    if (rawSort != null && !JSObjects.isUndefined(rawSort)) {
      boolean sortByIDCode = rawSort.<JSBoolean>cast().booleanValue();
      String[] parts =
          com.actelion.research.chem.reaction.ReactionEncoder.encode(
              reaction.getReaction(), keepAbsoluteCoordinates, sortByIDCode);
      if (parts == null) {
        return null;
      }
      return String.join(
          com.actelion.research.chem.reaction.ReactionEncoder.OBJECT_DELIMITER_STRING, parts);
    }

    int mode = modeFromOptions(present ? options.getMode() : null);
    return com.actelion.research.chem.reaction.ReactionEncoder.encode(
        reaction.getReaction(), keepAbsoluteCoordinates, mode);
  }

  /**
   * Decodes a reaction from its compact string representation.
   *
   * <p>When the options object carries {@code ensureCoordinates} that overload
   * is used; otherwise the {@code mode} bitmask (default {@code INCLUDE_DEFAULT})
   * is used.
   *
   * @param reaction the encoded reaction string
   * @param options decode options (ensureCoordinates, mode), or undefined
   * @return the decoded reaction, or null if the string is empty/invalid
   */
  @JSExport
  public static Reaction decode(String reaction, Options.ReactionDecode options) {
    boolean present = options != null && !JSObjects.isUndefined(options);

    JSObject rawEnsure = present ? options.getEnsureCoordinates() : null;
    if (rawEnsure != null && !JSObjects.isUndefined(rawEnsure)) {
      boolean ensureCoordinates = rawEnsure.<JSBoolean>cast().booleanValue();
      com.actelion.research.chem.reaction.Reaction decoded =
          com.actelion.research.chem.reaction.ReactionEncoder.decode(reaction, ensureCoordinates, null);
      return decoded == null ? null : new Reaction(decoded);
    }

    int mode = modeFromOptions(present ? options.getMode() : null);
    com.actelion.research.chem.reaction.Reaction decoded =
        com.actelion.research.chem.reaction.ReactionEncoder.decode(reaction, mode, null);
    return decoded == null ? null : new Reaction(decoded);
  }

  private static int modeFromOptions(JSObject rawMode) {
    if (rawMode == null || JSObjects.isUndefined(rawMode)) {
      return com.actelion.research.chem.reaction.ReactionEncoder.INCLUDE_DEFAULT;
    }
    return rawMode.<JSNumber>cast().intValue();
  }
}
