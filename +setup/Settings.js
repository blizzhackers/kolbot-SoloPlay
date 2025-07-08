/**
*  @filename    Settings.js
*  @author      theBGuy
*  @desc        Global Settings for Kolbot-SoloPlay for per profile advanced configuration @see AdvancedSettings.js
*
*/

/**
 * @exports Settings
 * @typedef {typeof Settings} SettingsInterface
 */

/**
 * @todo
 * - add override to GlobalAccount here to allow per profile options
 * - add name choices in similar manner, would have to experiment with max lengths allowed as a prefix
 */

const Settings = {
  /**
   * @desc - set to true if using the PlugY mod - allows use of larger stash
   */
  plugyMode: false,
  /**
   * @desc - log game/bot statistics to .csv files located at SoloPlay/.soloplay/
   */
  logPerformance: true,
  /**
   * @desc - show in game overlay (see bottom of README.md for example)
   */
  overlay: true,
  /**
   * @desc - show Total, InGame, and OOG (out of game) time in the D2bot# status window
   */
  displayClockInConsole: false,
  /**
   * @desc - log currently equipped items to D2Bot# charviewer tab
   */
  logEquipped: false,
  /**
   * @desc - disable printing chicken info in D2Bot console
   */
  hideChickens: true,
  /**
   * @desc - enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
   *   or patch.json has been updated (see Single Player Additions in README.md)
   */
  addLadderRW: !me.profile.toLowerCase().includes("nl"),
  /**
   * @desc - hide casting animations for better stability (reduce d2bs crashes)
   */
  forcePacketCasting: true,
  /**
   * @desc - stop a profile once it reaches a certain level (0 for disabled)
   */
  stopAtLevel: 0,
  /**
   * @desc - allows a profile to loaded without starting any of the scripts. enables chat commands for testing. See Scripts/developermode.js for more info.
   */
  developerMode: false,
  /**
   * @desc - Start profiles in testing mode, i.e "scl-sorc"
   */
  testingMode: false,
  /**
   * @desc [experimental don't use] - set email during account creation
   */
  setEmail: {
    enabled: false,
    // email: "",
    // domain: "",
    profiles: [],
    realms: ["asia"],
  },
  /**
   * @desc - enable/disable logging debug info to the console
   */
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
    showStack: false,
  },

  imbue: {
    // /**
    //  * @desc - 0 for disabled 18 for full account (or however much space is available)
    //  */
    // count: 0,
    /**
     * set to true in use with tag Imbuemule to make next character after reaching goal until account is full
     */
    fillAccount: false,
    /**
     * @desc - level to stop at
     */
    stopLevel: 30,
  },

  socket: {
    // /**
    //  * @desc - 0 for disabled 18 for full account (or however much space is available)
    //  */
    // count: 0,
    /**
     * set to true in use with tag Socketmule to make next character after reaching goal until account is full
     */
    fillAccount: false,
  },

  bumper: {
    // /**
    //  * @desc - 0 for disabled 18 for full account (or however much space is available)
    //  */
    // count: 0,
    /**
     * set to true in use with tag Bumper to make next character after reaching goal until account is full
     */
    fillAccount: false,
  },
};
