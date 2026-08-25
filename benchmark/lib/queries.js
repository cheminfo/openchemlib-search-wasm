/**
 * The six benchmark queries, as SMILES and as the idcode both engines are given.
 *
 * They span the useful range of selectivity over the reference corpus — benzene matches 62.9% of
 * it, sulfonamide 2.6% — because a substructure search that fails early costs less than one that
 * has to walk the whole molecule, and a benchmark on one query alone would hide that.
 */
export const QUERIES = [
  { name: 'benzene', smiles: 'c1ccccc1', idCode: 'gFp@DiTt@@B' },
  { name: 'pyridine', smiles: 'c1ccncc1', idCode: 'gFx@@eJf`@@P' },
  { name: 'carboxyl', smiles: 'C(=O)O', idCode: 'eMDARVB' },
  { name: 'anilide', smiles: 'C(=O)Nc1ccccc1', idCode: 'difH@DAIVUxV`@@B' },
  { name: 'sulfonamide', smiles: 'S(=O)(=O)N', idCode: 'gChhMD@bNlA@' },
  {
    name: 'naphthalene',
    smiles: 'c1ccc2ccccc2c1',
    idCode: 'det@@DjYUX^d@@@@B',
  },
];

/**
 * Finds a query by name.
 * @param {string} name - One of the names in {@link QUERIES}.
 * @returns {{name: string, smiles: string, idCode: string}} The query.
 * @throws {Error} If no query carries that name.
 */
export function queryByName(name) {
  for (let i = 0; i < QUERIES.length; i++) {
    if (QUERIES[i].name === name) return QUERIES[i];
  }
  const names = QUERIES.map((query) => query.name).join(', ');
  throw new Error(`unknown query "${name}": pick one of ${names}`);
}
