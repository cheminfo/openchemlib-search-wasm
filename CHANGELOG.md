# Changelog

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
