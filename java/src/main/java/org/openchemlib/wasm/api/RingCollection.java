package org.openchemlib.wasm.api;

import org.teavm.jso.JSExport;

/**
 * WASM facade for {@code com.actelion.research.chem.RingCollection}, mirroring
 * the openchemlib-js {@code RingCollection} API. Wraps the total set of small
 * rings computed for a molecule and exposes per-ring queries.
 */
public class RingCollection {
  private final com.actelion.research.chem.RingCollection ringCollection;

  /** Wraps an existing OCL ring collection (internal). */
  RingCollection(com.actelion.research.chem.RingCollection ringCollection) {
    this.ringCollection = ringCollection;
  }

  /**
   * The size of the smallest ring the atom is a member of, or 0 if none.
   *
   * @param atom the atom index
   * @return the ring size or 0
   */
  @JSExport
  public int getAtomRingSize(int atom) {
    return ringCollection.getAtomRingSize(atom);
  }

  /**
   * The size of the smallest ring the bond is a member of, or 0 if none.
   *
   * @param bond the bond index
   * @return the ring size or 0
   */
  @JSExport
  public int getBondRingSize(int bond) {
    return ringCollection.getBondRingSize(bond);
  }

  /**
   * The number of rings in this collection.
   *
   * @return the ring count
   */
  @JSExport
  public int getSize() {
    return ringCollection.getSize();
  }

  /**
   * The normalised list of atom indices that make up a ring.
   *
   * @param ringNo the ring index
   * @return the ring atom indices
   */
  @JSExport
  public int[] getRingAtoms(int ringNo) {
    return ringCollection.getRingAtoms(ringNo);
  }

  /**
   * The list of bond indices that make up a ring.
   *
   * @param ringNo the ring index
   * @return the ring bond indices
   */
  @JSExport
  public int[] getRingBonds(int ringNo) {
    return ringCollection.getRingBonds(ringNo);
  }

  /**
   * The number of members of a ring.
   *
   * @param ringNo the ring index
   * @return the ring size
   */
  @JSExport
  public int getRingSize(int ringNo) {
    return ringCollection.getRingSize(ringNo);
  }

  /**
   * Whether a ring is considered aromatic.
   *
   * @param ringNo the ring index
   * @return true if aromatic
   */
  @JSExport
  public boolean isAromatic(int ringNo) {
    return ringCollection.isAromatic(ringNo);
  }

  /**
   * Whether a ring is considered delocalized (a 6-membered aromatic ring with
   * no preferred double-bond positions).
   *
   * @param ringNo the ring index
   * @return true if delocalized
   */
  @JSExport
  public boolean isDelocalized(int ringNo) {
    return ringCollection.isDelocalized(ringNo);
  }

  /**
   * The position of the given atom within a ring, or -1 if not a member.
   *
   * @param ringNo the ring index
   * @param atom the atom index
   * @return the position within the ring or -1
   */
  @JSExport
  public int getAtomIndex(int ringNo, int atom) {
    return ringCollection.getAtomIndex(ringNo, atom);
  }

  /**
   * The position of the given bond within a ring, or -1 if not a member.
   *
   * @param ringNo the ring index
   * @param bond the bond index
   * @return the position within the ring or -1
   */
  @JSExport
  public int getBondIndex(int ringNo, int bond) {
    return ringCollection.getBondIndex(ringNo, bond);
  }

  /**
   * Wraps an index into the valid member range 0..ringSize-1.
   *
   * @param ringNo the ring index
   * @param index the member index to validate
   * @return the validated member index
   */
  @JSExport
  public int validateMemberIndex(int ringNo, int index) {
    return ringCollection.validateMemberIndex(ringNo, index);
  }

  /**
   * The position of the electron-pair providing hetero atom (or carbenium atom)
   * in a 5- or 7-membered aromatic ring.
   *
   * @param ringNo the ring index
   * @return the hetero position index referring to the ring atom array
   */
  @JSExport
  public int getHeteroPosition(int ringNo) {
    return ringCollection.getHeteroPosition(ringNo);
  }

  /**
   * Whether an atom is a member of a ring.
   *
   * @param ringNo the ring index
   * @param atom the atom index
   * @return true if the atom belongs to the ring
   */
  @JSExport
  public boolean isAtomMember(int ringNo, int atom) {
    return ringCollection.isAtomMember(ringNo, atom);
  }

  /**
   * Whether a bond is a member of a ring.
   *
   * @param ringNo the ring index
   * @param bond the bond index
   * @return true if the bond belongs to the ring
   */
  @JSExport
  public boolean isBondMember(int ringNo, int bond) {
    return ringCollection.isBondMember(ringNo, bond);
  }

  /**
   * The index of the ring shared by two bonds, or -1 if they share none.
   *
   * @param bond1 the first bond index
   * @param bond2 the second bond index
   * @return the shared ring index or -1
   */
  @JSExport
  public int getSharedRing(int bond1, int bond2) {
    return ringCollection.getSharedRing(bond1, bond2);
  }

  /**
   * Whether the bond may contribute pi-electrons from an amide resonance to an
   * aromatic ring.
   *
   * @param bond the bond index
   * @return true if it qualifies as an amide-type bond
   */
  @JSExport
  public boolean qualifiesAsAmideTypeBond(int bond) {
    return ringCollection.qualifiesAsAmideTypeBond(bond);
  }
}
