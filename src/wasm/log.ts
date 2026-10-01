/** Which of Java's two standard streams a line came from. */
export type LogStream = 'stdout' | 'stderr';

/** Called with one line OpenChemLib wrote to a standard stream. */
export type LogHandler = (message: string, stream: LogStream) => void;

/** TeaVM imports one character sink per stream; it writes a character at a time. */
interface TeaVMConsole {
  putcharStdout: (code: number) => void;
  putcharStderr: (code: number) => void;
}

const NEWLINE = 10;

let handler: LogHandler | null = null;

/**
 * Routes what OpenChemLib writes to Java's standard streams wherever you want it.
 *
 * Nothing is written anywhere by default, and that is the point: OpenChemLib prints
 * `Tautomer count exceeds maximum: <idcode>` for every molecule whose tautomers it stops
 * enumerating, which an import emits thousands of times, and the generated TeaVM runtime maps that
 * onto `console.log` — the same stream a host writing structured logs is using, whose output it
 * then corrupts. The message says nothing a caller can act on; the hash is still returned and still
 * identifies the molecule. So the default is to drop it, and a host that wants it says where.
 *
 * It applies whether or not the module has been instantiated yet, so it can be set at startup or
 * around one call.
 *
 * ```js
 * setLogHandler((message, stream) => logger.debug({ stream }, message));
 * ```
 * @param next - Called once per line, or `null` to go back to discarding them.
 */
export function setLogHandler(next: LogHandler | null): void {
  handler = next;
}

/**
 * Builds the `teavmConsole` import that replaces the generated runtime's own, which calls
 * `console.log` and `console.error`.
 * @returns The import object to install over it.
 */
export function createConsoleImport(): TeaVMConsole {
  return {
    putcharStdout: lineSink('stdout'),
    putcharStderr: lineSink('stderr'),
  };
}

/**
 * Collects characters into a line and hands each finished one to the current handler.
 * @param stream - The stream these characters belong to.
 * @returns The per-character callback the runtime imports.
 */
function lineSink(stream: LogStream): (code: number) => void {
  let line = '';
  return (code: number) => {
    if (code === NEWLINE) {
      handler?.(line, stream);
      line = '';
    } else {
      line += String.fromCodePoint(code);
    }
  };
}
