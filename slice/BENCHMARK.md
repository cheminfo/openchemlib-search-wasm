<!-- Build flags: optimizationLevel=FULL, strict=false (no bounds checks), assertionsRemoved=true -->

# Substructure benchmark — 3000 molecules (10k.sdf sample), best-of-N ms

## Build: parse + fingerprint index

| Engine | ms | vs GWT |
|---|--:|--:|
| Native Java (HotSpot) | 1215.0 | 8.2× |
| WASM (TeaVM WasmGC) | 1734.4 | 5.8× |
| GWT-JS (current) | 9991.0 | 1× |

molecules built: Java 3000, WASM 3000, GWT 2999

## Search, NO index (SSSearcher — isomorphism on every molecule)

| Query | Hits | Java | WASM | GWT | WASM vs GWT |
|---|--:|--:|--:|--:|--:|
| `c1ccccc1` | 1339 | 2.6 | 4.8 | 17.9 | 3.7× |
| `c1ccncc1` | 122 | 2.2 | 3.9 | 15.6 | 4.0× |
| `C(=O)O` | 729 | 2.5 | 3.9 | 15.2 | 3.9× |
| `C(=O)Nc1ccccc1` | 32 | 2.0 | 3.4 | 13.0 | 3.8× |
| `S(=O)(=O)N` | 15 | 2.8 | 4.1 | 13.7 | 3.4× |
| `c1ccc2ccccc2c1` | 79 | 3.6 | 5.9 | 30.7 | 5.2× |

## Search, WITH index (SSSearcherWithIndex — fingerprint screen then isomorphism)

| Query | Hits | Java | WASM | GWT | WASM vs GWT |
|---|--:|--:|--:|--:|--:|
| `c1ccccc1` | 1339 | 2.0 | 3.8 | 17.7 | 4.7× |
| `c1ccncc1` | 122 | 0.4 | 0.6 | 3.3 | 5.5× |
| `C(=O)O` | 729 | 0.8 | 1.3 | 5.9 | 4.4× |
| `C(=O)Nc1ccccc1` | 32 | 0.3 | 0.5 | 3.7 | 7.0× |
| `S(=O)(=O)N` | 15 | 0.2 | 0.3 | 1.7 | 5.4× |
| `c1ccc2ccccc2c1` | 79 | 2.5 | 4.0 | 22.9 | 5.7× |

✓ hit counts agree across Java, WASM and GWT for every query
