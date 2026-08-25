// Types for the generated TeaVM WasmGC runtime. This committed declaration is
// copied to dist/runtime.d.ts by build/embed-wasm.mjs, next to the generated
// dist/runtime.js it describes.
export interface TeaVMInstance {
  exports: Record<string, unknown>;
}
export function load(
  src: BufferSource | string,
  options?: unknown,
): Promise<TeaVMInstance>;
