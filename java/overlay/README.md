# `java/overlay` — the escape hatch

`java/pom.xml` puts this directory on javac's `-sourcepath` **before** the `openchemlib` submodule:

```
-sourcepath java/src/main/java:java/overlay:openchemlib/src/main/java
```

javac resolves a class from the first entry that provides it, so a file placed here under its real
package path replaces the upstream one for this build — without vendoring, forking or patching the
submodule.

Empty is the goal: an empty overlay makes upgrading OpenChemLib a `git submodule update --remote`
and nothing else. Every file here has to be reconciled at the next OpenChemLib release, says at its
top why it is here, and goes as soon as upstream ships the fix.

## What is here

### `com/actelion/research/chem/SSSearcher.java`

A fragment atom's ring features — the ring sizes the molecule atom must also have — came from every
ring of the fragment, rings closed by exclude-group atoms included. An exclude group closing a ring
through main atoms then required the main atoms to lie in a ring of that size:
`[C;!$(C1CCCC1)]` matched no molecule, not even butane. One check in
`setupFragmentFeatures(StereoMolecule, int)` skips such rings; the comment at the top of the file
says so, and the block marked `containsExcludeAtom` is the whole difference with the submodule's
copy.

**Remove it** when OpenChemLib's own `SSSearcher` finds `[C;!$(C1CCCC1)]` in butane:
`excludeGroupRing.test.ts` then passes without the overlay. To reconcile after a submodule bump
before that, copy the new upstream file here and re-apply the block.

### `com/actelion/research/chem/TautomerHelper.java`

The ceiling set with `setMaxTautomers()` was checked only after a whole expansion step, and one step
on a large conjugated system adds far more bond-order variants than the ceiling: a 240-atom
C216H154N16O8 from PubChem filled a 4.4 GB worker heap with the ceiling at 5,000, which stopped a
whole-PubChem import. Two lines at the top of `addTautomerIfNew(BondOrders)` refuse a variant once
the set holds the ceiling, so an enumeration that reaches it stops exactly there; one that does not
enumerates exactly as before.

**Remove it** when OpenChemLib's own `TautomerHelper` stops at the ceiling:
`maxTautomers.test.ts` then passes without the overlay. To reconcile after a submodule bump before
that, copy the new upstream file here and re-apply the two lines.
