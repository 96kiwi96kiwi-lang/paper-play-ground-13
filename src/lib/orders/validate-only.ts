/** Refuse test and dry-run flags the spot adapters do not honor. Not a halt. */

/**
 * Omitted, null, false, and blank pass. A present test, dry-run, or
 * validate-only flag is refused: adapters place a real spot order, so a
 * rehearsal would rest or fill. This is a rehearsal floor, not a halt, and
 * does not flatten positions.
 */
function present(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

export function validateOnlyReason(
  test: unknown,
  dryRun?: unknown,
  validateOnly?: unknown,
): string | null {
  if (present(test)) {
    return "Test order is not supported; the adapter would place a real spot order";
  }
  if (present(dryRun)) {
    return "Dry run is not supported; the adapter would place a real spot order";
  }
  if (present(validateOnly)) {
    return "Validate only is not supported; the adapter would place a real spot order";
  }
  return null;
}
