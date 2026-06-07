package org.openchemlib.wasm.api;

import com.actelion.research.chem.Molecule;
import com.actelion.research.chem.StereoMolecule;
import org.teavm.jso.JSObject;
import org.teavm.jso.JSProperty;
import org.teavm.jso.core.JSObjects;

/**
 * Builds the query-feature value objects returned by
 * {@link org.openchemlib.wasm.api.Molecule#getAtomQueryFeaturesObject(int)} and
 * {@link org.openchemlib.wasm.api.Molecule#getBondQueryFeaturesObject(int)}.
 * Each is a plain JS object whose boolean/number properties decode the packed
 * {@code long} query-feature bit set. (TeaVM {@code @JSExport} getters surface as
 * methods, not properties, so value objects are used to match the openchemlib-js
 * property API.)
 */
final class MoleculeQueryFeatures {
  private MoleculeQueryFeatures() {}

  /** The atom query-feature value object (one boolean per query flag). */
  public interface AtomResult extends JSObject {
    @JSProperty
    void setAromatic(boolean value);

    @JSProperty
    void setNotAromatic(boolean value);

    @JSProperty
    void setNotChain(boolean value);

    @JSProperty
    void setNot2RingBonds(boolean value);

    @JSProperty
    void setNot3RingBonds(boolean value);

    @JSProperty
    void setNot4RingBonds(boolean value);

    @JSProperty
    void setNoMoreNeighbours(boolean value);

    @JSProperty
    void setMoreNeighbours(boolean value);

    @JSProperty
    void setMatchStereo(boolean value);

    @JSProperty
    void setNot0PiElectrons(boolean value);

    @JSProperty
    void setNot1PiElectron(boolean value);

    @JSProperty
    void setNot2PiElectrons(boolean value);

    @JSProperty
    void setNot0Hydrogen(boolean value);

    @JSProperty
    void setNot1Hydrogen(boolean value);

    @JSProperty
    void setNot2Hydrogen(boolean value);

    @JSProperty
    void setNot3Hydrogen(boolean value);

    @JSProperty
    void setNot0Neighbours(boolean value);

    @JSProperty
    void setNot1Neighbour(boolean value);

    @JSProperty
    void setNot2Neighbours(boolean value);

    @JSProperty
    void setNot3Neighbours(boolean value);

    @JSProperty
    void setNot4Neighbours(boolean value);

    @JSProperty
    void setNotChargeNeg(boolean value);

    @JSProperty
    void setNotCharge0(boolean value);

    @JSProperty
    void setNoChargePos(boolean value);

    @JSProperty
    void setRingSize0(boolean value);

    @JSProperty
    void setRingSize3(boolean value);

    @JSProperty
    void setRingSize4(boolean value);

    @JSProperty
    void setRingSize5(boolean value);

    @JSProperty
    void setRingSize6(boolean value);

    @JSProperty
    void setRingSize7(boolean value);

    @JSProperty
    void setRingSizeLarge(boolean value);
  }

  /** The bond query-feature value object. */
  public interface BondResult extends JSObject {
    @JSProperty
    void setSingle(boolean value);

    @JSProperty
    void setDouble(boolean value);

    @JSProperty
    void setTriple(boolean value);

    @JSProperty
    void setDelocalized(boolean value);

    @JSProperty
    void setMetalLigand(boolean value);

    @JSProperty
    void setQuadruple(boolean value);

    @JSProperty
    void setQuintuple(boolean value);

    @JSProperty
    void setNotRing(boolean value);

    @JSProperty
    void setRing(boolean value);

    @JSProperty
    void setAromatic(boolean value);

    @JSProperty
    void setNonAromatic(boolean value);

    @JSProperty
    void setRingSize(int value);

    @JSProperty
    void setBrigdeMin(int value);

    @JSProperty
    void setBrigdeSpan(int value);
  }

  static AtomResult ofAtom(StereoMolecule molecule, int atom) {
    long queryFeatures = molecule.getAtomQueryFeatures(atom);
    AtomResult result = JSObjects.create().cast();

    result.setAromatic((queryFeatures & Molecule.cAtomQFAromatic) > 0);
    result.setNotAromatic((queryFeatures & Molecule.cAtomQFNotAromatic) > 0);

    result.setNotChain((queryFeatures & Molecule.cAtomQFNotChain) > 0);
    result.setNot2RingBonds((queryFeatures & Molecule.cAtomQFNot2RingBonds) > 0);
    result.setNot3RingBonds((queryFeatures & Molecule.cAtomQFNot3RingBonds) > 0);
    result.setNot4RingBonds((queryFeatures & Molecule.cAtomQFNot4RingBonds) > 0);

    result.setNoMoreNeighbours((queryFeatures & Molecule.cAtomQFNoMoreNeighbours) > 0);
    result.setMoreNeighbours((queryFeatures & Molecule.cAtomQFMoreNeighbours) > 0);
    result.setMatchStereo((queryFeatures & Molecule.cAtomQFMatchStereo) > 0);

    result.setNot0PiElectrons((queryFeatures & Molecule.cAtomQFNot0PiElectrons) > 0);
    result.setNot1PiElectron((queryFeatures & Molecule.cAtomQFNot1PiElectron) > 0);
    result.setNot2PiElectrons((queryFeatures & Molecule.cAtomQFNot2PiElectrons) > 0);

    result.setNot0Hydrogen((queryFeatures & Molecule.cAtomQFNot0Hydrogen) > 0);
    result.setNot1Hydrogen((queryFeatures & Molecule.cAtomQFNot1Hydrogen) > 0);
    result.setNot2Hydrogen((queryFeatures & Molecule.cAtomQFNot2Hydrogen) > 0);
    result.setNot3Hydrogen((queryFeatures & Molecule.cAtomQFNot3Hydrogen) > 0);

    result.setNot0Neighbours((queryFeatures & Molecule.cAtomQFNot0Neighbours) > 0);
    result.setNot1Neighbour((queryFeatures & Molecule.cAtomQFNot1Neighbour) > 0);
    result.setNot2Neighbours((queryFeatures & Molecule.cAtomQFNot2Neighbours) > 0);
    result.setNot3Neighbours((queryFeatures & Molecule.cAtomQFNot3Neighbours) > 0);
    result.setNot4Neighbours((queryFeatures & Molecule.cAtomQFNot4Neighbours) > 0);

    result.setNotChargeNeg((queryFeatures & Molecule.cAtomQFNotChargeNeg) > 0);
    result.setNotCharge0((queryFeatures & Molecule.cAtomQFNotCharge0) > 0);
    result.setNoChargePos((queryFeatures & Molecule.cAtomQFNotChargePos) > 0);

    result.setRingSize0((queryFeatures & Molecule.cAtomQFRingSize0) > 0);
    result.setRingSize3((queryFeatures & Molecule.cAtomQFRingSize3) > 0);
    result.setRingSize4((queryFeatures & Molecule.cAtomQFRingSize4) > 0);
    result.setRingSize5((queryFeatures & Molecule.cAtomQFRingSize5) > 0);
    result.setRingSize6((queryFeatures & Molecule.cAtomQFRingSize6) > 0);
    result.setRingSize7((queryFeatures & Molecule.cAtomQFRingSize7) > 0);
    result.setRingSizeLarge((queryFeatures & Molecule.cAtomQFRingSizeLarge) > 0);

    return result;
  }

  static BondResult ofBond(StereoMolecule molecule, int bond) {
    long queryFeatures = molecule.getBondQueryFeatures(bond);
    BondResult result = JSObjects.create().cast();

    result.setSingle((queryFeatures & Molecule.cBondTypeSingle) > 0);
    result.setDouble((queryFeatures & Molecule.cBondTypeDouble) > 0);
    result.setTriple((queryFeatures & Molecule.cBondTypeTriple) > 0);
    result.setDelocalized((queryFeatures & Molecule.cBondTypeDelocalized) > 0);
    result.setMetalLigand((queryFeatures & Molecule.cBondTypeMetalLigand) > 0);
    result.setQuadruple((queryFeatures & Molecule.cBondTypeQuadruple) > 0);
    result.setQuintuple((queryFeatures & Molecule.cBondTypeQuintuple) > 0);

    result.setNotRing((queryFeatures & Molecule.cBondQFNotRing) > 0);
    result.setRing((queryFeatures & Molecule.cBondQFRing) > 0);

    result.setAromatic((queryFeatures & Molecule.cBondQFAromatic) > 0);
    result.setNonAromatic((queryFeatures & Molecule.cBondQFNotAromatic) > 0);

    result.setRingSize(
        (int) (queryFeatures & Molecule.cBondQFRingSize) >> Molecule.cBondQFRingSizeShift);

    result.setBrigdeMin(
        (int) (queryFeatures & Molecule.cBondQFBridgeMin) >> Molecule.cBondQFBridgeMinShift);
    result.setBrigdeSpan(
        (int) (queryFeatures & Molecule.cBondQFBridgeSpan) >> Molecule.cBondQFBridgeSpanShift);

    return result;
  }
}
