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

    /** Raw value of the optional destination molecule, for a presence check. */
    @JSProperty("molecule")
    JSObject getMoleculeRaw();

    /** Optional destination molecule to parse into (parse-time option). */
    @JSProperty("molecule")
    Molecule getMolecule();
  }

  /** Options for {@link Molecule#toIsomericSmiles}. */
  public interface IsomericSmiles extends JSObject {
    @JSProperty
    boolean isCreateSmarts();

    @JSProperty
    boolean isIncludeMapping();

    @JSProperty
    boolean isKekulizedOutput();
  }

  /** Depictor display-mode options for {@link Molecule#_toSVG}. */
  public interface ToSVG extends JSObject {
    @JSProperty
    boolean isNoTabus();

    @JSProperty
    boolean isShowAtomNumber();

    @JSProperty
    boolean isShowBondNumber();

    @JSProperty
    boolean isHighlightQueryFeatures();

    @JSProperty
    boolean isShowMapping();

    @JSProperty
    boolean isSuppressChiralText();

    @JSProperty
    boolean isSuppressCIPParity();

    @JSProperty
    boolean isSuppressESR();

    @JSProperty
    boolean isNoCarbonLabelWithCustomLabel();

    @JSProperty
    boolean isNoAtomCustomLabels();

    @JSProperty
    boolean isShowSymmetrySimple();

    @JSProperty
    boolean isShowSymmetryStereoHeterotopicity();

    @JSProperty
    boolean isNoImplicitAtomLabelColors();

    @JSProperty
    boolean isNoStereoProblem();

    @JSProperty
    boolean isNoColorOnESRAndCIP();

    @JSProperty
    boolean isNoImplicitHydrogen();

    @JSProperty
    boolean isDrawBondsInGray();
  }

  /** Options for {@link Molecule#addImplicitHydrogens}. */
  public interface ImplicitHydrogens extends JSObject {
    /** Raw value: absent means "all atoms", a number means a single atom. */
    @JSProperty
    JSObject getAtom();
  }

  /** Options for {@link Molecule#inventCoordinates}. */
  public interface Invent extends JSObject {
    @JSProperty
    boolean isSkipDefaultTemplates();

    /** Raw value: default is false, but kept raw to mirror the JS API. */
    @JSProperty
    JSObject getKeepHydrogens();

    @JSProperty
    boolean isKeepMarkedAtomCoordinates();

    @JSProperty
    boolean isPreferMarkedAtomCoordinates();

    /** Raw value: absent means seed 0; a negative value means a random seed. */
    @JSProperty
    JSObject getSeed();
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

  /** Mode options for canonization. */
  public interface Canonizer extends JSObject {
    @JSProperty
    boolean isCreateSymmetryRank();

    @JSProperty
    boolean isConsiderStereoheterotopicity();

    @JSProperty
    boolean isEncodeAtomCustomLabels();

    @JSProperty
    boolean isEncodeAtomSelection();

    @JSProperty
    boolean isAssignParitiesToTetrahedralN();

    @JSProperty
    boolean isCoordsAre3d();

    @JSProperty
    boolean isCreatePseudoStereoGroups();

    @JSProperty
    boolean isDistinguishRacemicOrGroups();

    @JSProperty
    boolean isTieBreakFreeValenceAtoms();

    @JSProperty
    boolean isEncodeAtomCustomLabelsWithoutRanking();

    @JSProperty
    boolean isNeglectAnyStereoInformation();
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

  /** Options for serializing a reaction to an RXN file. */
  public interface ToRxn extends JSObject {
    @JSProperty
    String getProgramName();

    @JSProperty
    boolean isKeepIdCode();
  }

  /** Options for encoding a reaction with {@link ReactionEncoder}. */
  public interface ReactionEncode extends JSObject {
    /** Raw value: present-or-absent selects the sort vs. mode overload. */
    @JSProperty
    JSObject getSortByIDCode();

    /** Raw value: present-or-absent selects the mode overload. */
    @JSProperty
    JSObject getMode();

    @JSProperty
    boolean isKeepAbsoluteCoordinates();
  }

  /** Options for decoding a reaction with {@link ReactionEncoder}. */
  public interface ReactionDecode extends JSObject {
    /** Raw value: present-or-absent selects the ensureCoordinates vs. mode overload. */
    @JSProperty
    JSObject getEnsureCoordinates();

    /** Raw value: present-or-absent selects the mode overload. */
    @JSProperty
    JSObject getMode();
  }

  /** Options for {@link Util#getHoseCodesFromDiastereotopicID}. */
  public interface HoseCodes extends JSObject {
    /** Raw value: absent means the default sphere size of {@code 5}. */
    @JSProperty
    JSObject getMaxSphereSize();

    /** Raw value: absent means the default type of {@code 0}. */
    @JSProperty
    JSObject getType();
  }
}
