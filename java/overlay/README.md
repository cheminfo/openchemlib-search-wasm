# `java/overlay` — the escape hatch, deliberately empty

`java/pom.xml` puts this directory on javac's `-sourcepath` **before** the `openchemlib` submodule:

```
-sourcepath java/src/main/java:java/overlay:../openchemlib/src/main/java
```

javac resolves a class from the first entry that provides it, so a file placed here under its real
package path replaces the upstream one for this build — without vendoring, forking or patching the
submodule.

Today nothing is here, and that is the point: the substructure and similarity closure compiles
straight from pristine OpenChemLib, so upgrading is `git submodule update --remote` and nothing
else. Add a file only when an upstream source genuinely cannot be compiled by TeaVM, and when you
do, say why at the top of the file and open an issue upstream — every file here is a file that has
to be re-reconciled at the next OpenChemLib release.
