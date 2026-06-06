package org.openchemlib.wasm.api;

import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;

/**
 * Option-bag interfaces read on the Java side from plain JS objects passed by
 * the caller. Each boolean {@code isX()} getter maps to property {@code x};
 * absent properties read as {@code false}, absent strings as {@code null}. For
 * options whose default is {@code true} the getter returns a raw value so the
 * undefined case can be distinguished (see {@link SSSearcher}).
 */
public final class Options {
  private Options() {}

  /** Options for SMILES parsing (parser construction + parse-time). */
  public interface Smiles extends JSObject {
    @JSProperty
    String getSmartsMode();

    @JSProperty
    boolean isSkipCoordinateTemplates();

    @JSProperty
    boolean isMakeHydrogenExplicit();

    @JSProperty
    boolean isNoCactvs();

    @JSProperty
    boolean isSingleDotSeparator();

    @JSProperty
    boolean isCreateSmartsWarnings();

    @JSProperty
    boolean isNoCoordinates();

    @JSProperty
    boolean isNoStereo();
  }

  /** Match-mode options for substructure search. */
  public interface Match extends JSObject {
    @JSProperty
    boolean isMatchAtomCharge();

    @JSProperty
    boolean isMatchAtomMass();

    @JSProperty
    boolean isMatchDBondToDelocalized();

    /** Raw value: default is true, so the undefined case must be detected. */
    @JSProperty
    JSObject getMatchAromDBondToDelocalized();
  }

  /** Count-mode options for findFragmentInMolecule. */
  public interface Count extends JSObject {
    @JSProperty
    String getCountMode();
  }

  /** Options for conformer enumeration initialization. */
  public interface ConformerInit extends JSObject {
    @JSProperty
    int getStrategy();

    @JSProperty
    int getMaxTorsionSets();

    @JSProperty
    boolean isUse60degreeSteps();
  }
}
