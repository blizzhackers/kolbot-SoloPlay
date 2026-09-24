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
  // --- names below moved off SoloPlay globals.d.ts value declarations when the type layer
  // was standardized (namespace -> interface, 2026-08-01); the parent generator no longer
  // scans submodule d.ts, so this manifest is the single source for SoloPlay lint globals ---
  // Core singletons
  "NPCAction": "writable",
  "Quest": "writable",
  "SoloWants": "writable",
  "AutoEquip": "writable",
  "Mercenary": "writable",
  "SetUp": "writable",
  "Check": "writable",
  // Tools/
  "CharData": "writable",
  "Tracker": "writable",
  // OOG/OOGOverrides.js
  "LocationAction": "writable",
  // data/config surfaces (ambient consts in globals.d.ts; runtime from their modules)
  "GameData": "writable",
  "AreaData": "writable",
  "Coords": "writable",
  "Settings": "writable",
  "SoloEvents": "writable",
  "Merc": "writable",
  "MercData": "writable",
  // Published on the thread global via `global.X = ...` (invisible to any top-level scan).
  // Core/DynamicTiers.js autoequip scorers:
  "tierscore": "writable",
  "mercscore": "writable",
  "secondaryscore": "writable",
  "charmscore": "writable",
  "chargeditemscore": "writable",
  // Core/Polyfills.js timer polyfills (the engine timer is not thread-safe):
  "setTimeout": "writable",
  "clearTimeout": "writable",
  "_setTimeout": "writable",
};
