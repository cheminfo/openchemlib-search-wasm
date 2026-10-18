import { Molecule, SSSearcher } from 'openchemlib';

const HIGHLIGHT = '#f59e0b';

/**
 * Draws a query fragment, its query features written on the atoms.
 * @param idCode - The fragment.
 * @param id - The id of the SVG element, unique on the page.
 * @param size - Width and height, in pixels.
 * @returns The SVG, or an empty string when the idcode cannot be read.
 */
export function depictFragment(idCode: string, id: string, size = 150): string {
  try {
    const fragment = Molecule.fromIDCode(idCode);
    fragment.setFragment(true);
    return fragment.toSVG(size, size, id, {
      autoCrop: true,
      autoCropMargin: 8,
      suppressChiralText: true,
    });
  } catch {
    return '';
  }
}

/**
 * Draws a query fragment scaled into a fixed box, so every row of a list is the same height.
 * @param idCode - The fragment.
 * @param id - The id of the SVG element, unique on the page.
 * @param width - The box width, in pixels.
 * @param height - The box height, in pixels.
 * @returns The SVG, or an empty string when the idcode cannot be read.
 */
export function depictThumbnail(
  idCode: string,
  id: string,
  width: number,
  height: number,
): string {
  try {
    const fragment = Molecule.fromIDCode(idCode);
    fragment.setFragment(true);
    return fragment.toSVG(width, height, id, {
      factorTextSize: 1.1,
      suppressChiralText: true,
    });
  } catch {
    return '';
  }
}

/**
 * Draws a molecule with the atoms and bonds of its first match of any of the fragments shaded.
 *
 * The match comes from `openchemlib-js`, whose `SSSearcher` lacks the exclude-group fix the
 * WebAssembly build carries: when it finds no match, the molecule is drawn unshaded.
 * @param idCode - The molecule.
 * @param fragments - The idcodes the key is the OR of.
 * @param id - The id of the SVG element, unique on the page.
 * @param size - Width and height, in pixels.
 * @returns The SVG, or an empty string when the idcode cannot be read.
 */
export function depictMatch(
  idCode: string,
  fragments: string[],
  id: string,
  size = 170,
): string {
  let molecule: Molecule;
  try {
    molecule = Molecule.fromIDCode(idCode);
  } catch {
    return '';
  }
  const { atoms, bonds } = firstMatch(molecule, fragments);
  const svg = molecule.toSVG(size, size, id, {
    autoCrop: true,
    autoCropMargin: 8,
    suppressChiralText: true,
  });
  if (atoms.length === 0) return svg;
  const selectors: string[] = [];
  for (const atom of atoms) selectors.push(`#${id} [id="${id}:Atom:${atom}"]`);
  const bondSelectors: string[] = [];
  for (const bond of bonds) {
    bondSelectors.push(`#${id} [id="${id}:Bond:${bond}"]`);
  }
  const style = [
    `${selectors.join(',')}{opacity:0.45;fill:${HIGHLIGHT}}`,
    bondSelectors.length > 0
      ? `${bondSelectors.join(',')}{opacity:0.45;stroke:${HIGHLIGHT}}`
      : '',
  ].join('');
  return svg.replace('</style>', `${style}</style>`);
}

function firstMatch(
  molecule: Molecule,
  fragments: string[],
): { atoms: number[]; bonds: number[] } {
  const searcher = new SSSearcher();
  searcher.setMolecule(molecule);
  for (const idCode of fragments) {
    let fragment: Molecule;
    try {
      fragment = Molecule.fromIDCode(idCode, false);
    } catch {
      continue;
    }
    fragment.setFragment(true);
    searcher.setFragment(fragment);
    if (searcher.findFragmentInMolecule({ countMode: 'firstMatch' }) === 0) {
      continue;
    }
    const match = searcher.getMatchList()[0] ?? [];
    const atoms: number[] = [];
    for (const atom of match) if (atom >= 0) atoms.push(atom);
    const bonds: number[] = [];
    for (let bond = 0; bond < fragment.getAllBonds(); bond++) {
      const first = match[fragment.getBondAtom(0, bond)] ?? -1;
      const second = match[fragment.getBondAtom(1, bond)] ?? -1;
      if (first < 0 || second < 0) continue;
      const found = molecule.getBond(first, second);
      if (found >= 0) bonds.push(found);
    }
    return { atoms, bonds };
  }
  return { atoms: [], bonds: [] };
}
