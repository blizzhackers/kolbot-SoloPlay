/**
*  @filename    ConfigOverrides.js
*  @author      theBGuy
*  @desc        Modded Config.js to work with SoloPlay
*
*/

includeIfNotIncluded("core/Config.js");

Config.init = function (notify) {
  const formats = ((className, profile, charname, realm) => ({
    // Class.Profile.js
    1: className + "." + profile + ".js",
    // Realm.Class.Charname.js
    2: realm + "." + className + "." + charname + ".js",
    // Class.Charname.js
    3: className + "." + charname + ".js",
    // Profile.js
    4: profile + ".js",
    // Class.js
    5: className + ".js",
  }))(sdk.player.class.nameOf(me.classid), me.profile, me.charname, me.realm);
  let configFilename = "";

  for (let i = 1; i <= 5; i++) {
    configFilename = formats[i];

    if (configFilename && FileTools.exists("libs/SoloPlay/Config/" + configFilename)) {
      break;
    }
  }

  try {
    if (!include("SoloPlay/Config/" + configFilename)) {
      throw new Error();
    }
    notify && console.log("ÿc2Loaded: ÿc9SoloPlay/Config/" + configFilename);
  } catch (e1) {
    console.error("ÿc1" + e1 + "\nÿc0If you are seeing this message you likely did not copy over all the files or are using the wrong kolbot version.");
    D2Bot.printToConsole("Please return to the kolbot-SoloPlay main github page and read the readMe. https://github.com/blizzhackers/kolbot-SoloPlay#readme", sdk.colors.D2Bot.Orange);

    throw new Error("Failed to load character config.");
  }

  if (Config.Silence && !Config.LocalChat.Enabled) {
    // Override the say function with print, so it just gets printed to console
    global._say = global.say;
    global.say = function (what) {
      console.log("Tryed to say: " + what);
    };
  }

  try {
    if (Config.AutoBuild.Enabled === true && include("SoloPlay/Functions/AutoBuild.js")) {
      AutoBuild.initialize();
    }
  } catch (e3) {
    console.log("ÿc8Error in libs/SoloPlay/Functions/AutoBuild.js (AutoBuild system is not active!)");
    console.error(e3);
  }
};
