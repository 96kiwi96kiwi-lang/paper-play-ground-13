/** Refuse execution instructions the spot adapters do not forward. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present execInst, execInstruction, or
 * instruction is refused: placeLimitOrder / placeMarketOrder do not send an
 * execution instruction, so PostOnly, ReduceOnly, or CloseOnTrigger packed in
 * that field would be ignored and the base amount would still trade as a
 * normal spot order. Zero is present and is refused. postOnly, reduceOnly, and
 * closeOnTrigger remain their own floors. This is an instruction floor, not a
 * halt, and does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function execInstReason(
  execInst: unknown,
  execInstruction?: unknown,
  instruction?: unknown,
): string | null {
  if (present(execInst)) {
    return "Execution instruction is not supported; the adapter would place a normal spot order";
  }
  if (present(execInstruction)) {
    return "Execution-instruction alias is not supported; the adapter would place a normal spot order";
  }
  if (present(instruction)) {
    return "Instruction is not supported; the adapter would place a normal spot order";
  }
  return null;
}
