/**
*  @filename    Developer.js
*  @author      theBGuy
*  @desc        Tools/Settings for Kolbot-SoloPlay
*
*/

/**
 * @todo
 * - add override to GlobalAccount here to allow per profile options
 * - add name choices in similar manner, would have to experiment with max lengths allowed as a prefix
 */
const Developer = {
  // @desc - set to true if using the PlugY mod - allows use of larger stash
  plugyMode: false,
  // @desc - log game/bot statistics to .csv files located at SoloPlay/Data/
  logPerformance: true,
  // @desc - show in game overlay (see bottom of README.md for example)
  overlay: true,
  // @desc - show Total, InGame, and OOG (out of game) time in the D2bot# status window
  displayClockInConsole: false,
  // @desc - log currently equipped items to D2Bot# charviewer tab
  logEquipped: false,
  // @desc - disable printing chicken info in D2Bot console
  hideChickens: true,
  // @desc - enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
  //   or patch.json has been updated (see Single Player Additions in README.md)
  addLadderRW: !me.profile.toLowerCase().includes("nl"),
  // @desc - hide casting animations for better stability (reduce d2bs crashes)
  forcePacketCasting: {
    enabled: true,
    // @desc - allow specific profiles to show casting animations without disabling it for every profile running (helpful when debugging)
    excludeProfiles: [""],
  },
  // @desc - set to true in use with tag Bumper, Socketmule, or Imbuemule to make next character after reaching goal until account is full
  fillAccount: {
    bumpers: false,
    socketMules: false,
    imbueMule: false,
  },
  // @desc - set level for imbueMule to stop at
  imbueStopLevel: 30,
  // @desc - stop a profile once it reaches a certain level
  stopAtLevel: {
    enabled: false,
    profiles: [
      // ["scl-example-001", 60],
      // ["hcl-example-001", 40]
    ],
  },
  // @desc - allows a profile to loaded without starting any of the scripts. enables chat commands for testing. See Scripts/developermode.js for more info.
  developerMode: {
    enabled: false,
    // Enter in the profiles that you wish to start in developermode, i.e "scl-sorc"
    profiles: [""],
  },
  testingMode: {
    enabled: false,
    // Enter in the profiles that you wish to start in testing mode, i.e "scl-sorc"
    profiles: [""],
  },
  // @desc [experimental don't use] - set email during account creation
  setEmail: {
    enabled: false,
    //email: "",
    //domain: "",
    profiles: [],
    realms: ["asia"]
  },
  // @desc - enable/disable logging debug info to the console
  debugging: {
    smallCharm: false,
    largeCharm: false,
    grandCharm: false,
    baseCheck: false,
    junkCheck: false,
    autoEquip: false,
    crafting: false,
    pathing: false,
    skills: false,
    showStack: {
      enabled: false,
      // @desc - Enter in the profiles that you wish to see the stack walk for, this loads up guard.js and displays on the overlay
      profiles: [""],
    },
  },
};

// Set after Developer has been initialized - always load guard in developer mode
if (Developer.developerMode.enabled && Developer.developerMode.profiles.some(profile => profile.toLowerCase() === me.profile.toLowerCase())) {
  Developer.debugging.pathing = true;
  //Developer.debugging.skills = true;
  Developer.debugging.showStack.enabled = true;
  Developer.debugging.showStack.profiles.push(me.profile.toLowerCase());
}
