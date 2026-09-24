/**
*  @filename    AdvancedSettings.js
*  @author      theBGuy
*  @desc        Profile specific settings for soloplay.
*  @note        For general and global settings @see Settings.js
*
*/

(function (module) {
  /** @type {Record<string, Partial<SettingsInterface>>} */
  module.exports = {
    /**
    * Format *: "Profile Name": {settingsProperty: value}
    -----------------------------------------------------
    * Example * (don't edit this - it's just an example):
      "scl-sorc-001": {
        debugging: {
          showStack: true,
          pathing: true
        },
        logEquipped: true,
        forcePacketCasting: false
      },
      "scl-sorc-002": {
        imbue: {
          stopLevel: 30,
        },
      },
    */
    
    // Put your lines under this one. Multiple entries are separated by commas. No comma after the last one.
    // "scl-sorc-001": {
    //   debugging: {
    //     showStack: true,
    //     pathing: true
    //   },
    //   logEquipped: true,
    //   forcePacketCasting: false
    // },
  };
})(module);
