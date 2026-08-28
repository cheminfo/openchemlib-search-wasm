/**
 * Reads the idcode every entry carries, following a jpath.
 *
 * The jpath is the dot-separated form the rest of the ecosystem uses (`get-jpaths`,
 * `derived-props`): `idCode`, `molecule.idCode`, `spectra.0.idCode`. A numeric segment indexes an
 * array, because `array['0']` and `array[0]` are the same property.
 *
 * The path is split once and walked with a plain loop per entry, so a scan of 400,000 entries costs
 * one string split rather than 400,000 of them.
 * @param entries - The entries to read.
 * @param jpath - Where the idcode sits in each entry.
 * @returns One idcode per entry, in order. An entry with no string at the jpath gives an empty
 * string, which the scan reports as unparsable like any other idcode it cannot read.
 * @throws {Error} If no entry at all has a string there, which means the jpath is wrong rather than
 * the data.
 */
export function readIdCodes(
  entries: readonly unknown[],
  jpath: string,
): string[] {
  const segments = jpath.split('.');
  const idCodes = new Array<string>(entries.length);
  let found = 0;

  if (segments.length === 1) {
    const key = segments[0] as string;
    for (let i = 0; i < entries.length; i++) {
      const value = (entries[i] as Record<string, unknown> | null)?.[key];
      if (typeof value === 'string') {
        idCodes[i] = value;
        found++;
      } else {
        idCodes[i] = '';
      }
    }
  } else {
    for (let i = 0; i < entries.length; i++) {
      let value: unknown = entries[i];
      for (const segment of segments) {
        if (value === null || value === undefined) break;
        value = (value as Record<string, unknown>)[segment];
      }
      if (typeof value === 'string') {
        idCodes[i] = value;
        found++;
      } else {
        idCodes[i] = '';
      }
    }
  }

  if (found === 0 && entries.length > 0) {
    throw new Error(
      `no entry holds a string at jpath "${jpath}": pass the jpath option if the idcode is` +
        ' somewhere else',
    );
  }
  return idCodes;
}

/**
 * Turns whatever the caller passed into the array of idcodes the scan reads.
 *
 * An array of idcodes is used as it is — that is the hot path a worker scanning a decoded chunk
 * takes, and copying it would allocate one reference per molecule for nothing.
 * @param entries - Idcodes, or entries carrying one at `jpath`.
 * @param jpath - Where the idcode sits in an entry.
 * @returns The idcodes to scan.
 */
export function toIdCodes(
  entries: readonly unknown[],
  jpath: string,
): string[] {
  if (entries.length === 0) return [];
  if (typeof entries[0] === 'string') return entries as unknown as string[];
  return readIdCodes(entries, jpath);
}
