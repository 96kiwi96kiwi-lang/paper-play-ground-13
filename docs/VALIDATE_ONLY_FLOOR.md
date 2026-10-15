# Validate-only floor

`test`, `dryRun`, and `validateOnly` are rehearsal flags used by some exchange APIs to check an order without placing it.

The paper and KuCoin adapters place one plain spot order and do not honor a test, dry-run, or validate-only flag, so a rehearsal intent would otherwise be ignored and the base size would rest or fill for real.

A present `test`, `dryRun`, or `validateOnly` (including zero or "0") is refused before the adapter. Omitted, null, false, and blank still pass.

This is a rehearsal floor, not a halt, and does not flatten positions. It does not count against `maxRejectsInWindow`.

Default mode remains paper. No secrets.
