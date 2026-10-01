// Types for the generated TeaVM WasmGC runtime. This committed declaration is
// copied to dist/runtime.d.ts by build/embed-wasm.mjs, next to the generated
// dist/runtime.js it describes.
export interface TeaVMInstance {
  exports: Record<string, unknown>;
}

export interface LoadOptions {
  memory?: {
    /**
     * The maximum the linear memory may grow to, in bytes, and the maximum the `WebAssembly.Memory`
     * is declared with. Defaults to 2 GiB, which every instantiation then declares.
     */
    maxSize?: number;
    /** The smallest the linear memory is created at, in bytes. */
    minSize?: number;
    /** A memory to instantiate against instead of creating one. */
    external?: WebAssembly.Memory;
  };
  /**
   * Called with the import object once the runtime has installed its own entries, so one of them
   * can be replaced before instantiation. `teavmConsole` is the entry that matters here: the
   * runtime fills it with character sinks that call `console.log` and `console.error`.
   */
  installImports?: (imports: Record<string, unknown>) => void;
}

export function load(
  src: BufferSource | string,
  options?: LoadOptions,
): Promise<TeaVMInstance>;
