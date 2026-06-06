// Types for the generated TeaVM WasmGC runtime (runtime.js).
export interface TeaVMInstance {
  exports: Record<string, unknown>;
}
export function load(
  src: BufferSource | string,
  options?: unknown,
): Promise<TeaVMInstance>;
