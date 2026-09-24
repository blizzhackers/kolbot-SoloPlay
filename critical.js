/**
* @filename    critical.js
* @author      theBGuy
* @desc        Simple loader file for the critical components of soloplay, without these we can't run
* 
*/

// Include SoloPlay's setting config & apply advanced override if applicable
include("SoloPlay/Settings/Settings.js");
(function () {
  // Handle advanced settings overrides
  const AdvancedSettings = require("./Settings/AdvancedSettings");
  if (AdvancedSettings.hasOwnProperty(me.profile)) {
    deepMerge(Settings, AdvancedSettings[me.profile]);
  }
})();

// Include SoloPlay's Core Tool librarys
include("SoloPlay/Tools/Tracker.js");
include("SoloPlay/Tools/CharData.js");
