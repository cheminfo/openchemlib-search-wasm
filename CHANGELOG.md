# Changelog

## [2.0.0](https://github.com/cheminfo/openchemlib-search-wasm/compare/v1.2.0...v2.0.0) (2026-10-01)


### ⚠ BREAKING CHANGES

* getNoStereoHash and getNoStereoTautomerHash change for a molecule whose stereogenic double bond has no configuration, about 1.5% of a drug-like library. A column of values written by 1.x has to be rebuilt.

### Features

* bound the tautomer enumeration, and export strongHash ([04f70b3](https://github.com/cheminfo/openchemlib-search-wasm/commit/04f70b374dddfa26077990f97be31c5d874628b2))
* canonize without stereo instead of stripping it ([9a241a0](https://github.com/cheminfo/openchemlib-search-wasm/commit/9a241a0a656dcebf4b1fe5be7191b69f72b92126))

## [1.2.0](https://github.com/cheminfo/openchemlib-search-wasm/compare/v1.1.0...v1.2.0) (2026-09-10)


### Features

* add getNoStereoHash and getNoStereoHashes ([#3](https://github.com/cheminfo/openchemlib-search-wasm/issues/3)) ([f9aec63](https://github.com/cheminfo/openchemlib-search-wasm/commit/f9aec63116d24640085662ba0859cd415ffed481))

## [1.1.0](https://github.com/cheminfo/openchemlib-search-wasm/compare/v1.0.0...v1.1.0) (2026-09-09)


### Features

* add getNoStereoTautomerHash and getNoStereoTautomerHashes ([cc6b6b9](https://github.com/cheminfo/openchemlib-search-wasm/commit/cc6b6b9c9a64b0a16683aec74fb782df55571593))

## 1.0.0 (2026-08-28)


### ⚠ BREAKING CHANGES

* take entries and a jpath, and return the result buffer
* return the result buffer instead of taking a caller-owned one
* reduce to batch substructure and similarity search over idcodes

### Features

* reduce to batch substructure and similarity search over idcodes ([7f6d5fb](https://github.com/cheminfo/openchemlib-search-wasm/commit/7f6d5fb5cf5d684561869b2cf258cb768d4795db))
* return the result buffer instead of taking a caller-owned one ([4230ebe](https://github.com/cheminfo/openchemlib-search-wasm/commit/4230ebea651441dc505091d2b658cad1352a077e))
* take entries and a jpath, and return the result buffer ([4fb2d0d](https://github.com/cheminfo/openchemlib-search-wasm/commit/4fb2d0d93f8c51341c2b06c4263d6b03e974912f))


### Bug Fixes

* **benchmark:** repair the worker scan for the current API ([1ee1688](https://github.com/cheminfo/openchemlib-search-wasm/commit/1ee168872ae95019580ceb130d1f08b52e4ddd3b))
* **build:** stamp the gzip header OS byte, so wasm/ is machine-independent ([049cdfe](https://github.com/cheminfo/openchemlib-search-wasm/commit/049cdfed108fc0ddf873a9b515983b22b2a64b05))
