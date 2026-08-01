// SoloPlay's cross-file global surface - OWNED BY THIS SUBMODULE.
// The parent repo's eslint.config.mjs imports this for its SoloPlay-scoped config block, so
// adding/renaming a deliberate cross-file global here never requires a parent tooling edit.
// Every entry is a top-level declaration in a SoloPlay file that OTHER files read as a bare
// identifier (verified by scope-aware analysis, 2026-08-01 - same-name locals don't count).
// Script-file top-levels (Scripts/*.js quest functions) are deliberately NOT globals: they
// are dispatched by string through LoaderOverrides/SoloIndex, never referenced by identifier.
export default {
  // Core/Globals.js utilities read across the whole submodule
  "myPrint": "writable",
  // BuildFiles class-family contract: base class files declare it for sibling builds
  "CharInfo": "writable",
  // Tools/SoloIndex.js script-index, read by LoaderOverrides + Scripts
  "SoloIndex": "writable",
  // Core/CharmEquip.js, read by the Core override family
  "CharmEquip": "writable",
  // Core/NTIPOverrides.js list helper, read by AutoMule/Runewords overrides
  "NTIPList": "writable",
  // Tools/Overlay.js, read by Threads/ToolsThread.js
  "Overlay": "writable",
  // Core/TownOverrides.js task list, read by Core/NPCAction.js
  "wantedTasks": "writable",
  // Core/Globals.js: const Overrides = require("../../modules/Override") (JSDoc-tagged @global)
  "Overrides": "writable",
  // tsc-emitted helper in Modules/Mock.js, read by Modules/MockItem.js
  "__spreadArray": "writable",
};
