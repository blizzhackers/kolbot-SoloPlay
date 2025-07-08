/**
*  @filename    StarterConfig.js
*  @author      theBGuy
*  @desc        Starter Configuration file for D2BotSoloPlay system
*
*/

(function (module) {
  // D2BotSoloPlay specific settings - for global settings see libs/starter/StarterConfig.js
  const StarterConfig = {
    InvalidPasswordDelay: 10, // Minutes to wait after getting Invalid Password message
    GameDoesNotExistTimeout: 600, // Seconds to wait before cancelling the 'Game does not exist.' screen
    DelayBeforeLogin: rand(5, 25), // Seconds to wait before logging in
    VersionErrorDelay: rand(5, 30), // Seconds to wait after 'unable to identify version' message

    // Global Account Settings.
    GlobalAccount: "", // Set value for a global account. (MAX Characters 12 plus AccountSuffixLength) 
    AccountSuffixLength: 3, // Set Global Account value for random numbers at the end of the name. (Minimum suffix 3)
    GlobalAccountPassword: "" // Set value for a global password for account generation.
  };

  module.exports = {
    StarterConfig: StarterConfig
  };
})(module);
