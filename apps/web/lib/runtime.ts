export function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}
