/**
*  @filename    Developer.js
*  @author      theBGuy
*  @desc        Tools/Settings for Kolbot-SoloPlay
*  @contributor Butterz - Added more options for Bumpers,Socket & Imbue. GlobalSettings. Profile timer Array/static.
*
*/

/**
 * @todo
 * - add override to GlobalAccount here to allow per profile options
 * - add name choices in similar manner, would have to experiment with max lengths allowed as a prefix
 */
const Developer = {
  // @desc - Global Account Settings
  GlobalSettings: {
    Account: "", // Set a value for global accounts. MAX Characters 12 plus Suffix Length (Total 15).
    Password: "", // Set a value for global passwords for account generation.
    Enable: false, // Set to true to use the "Global Character Name" feature.
    Name: "", // Set a global character name.
  },
  // @desc - Set the number of profiles sharing the same IP in this file
  ProfilesPerIP: {
    StaticProfiles: 1// Change this value as needed (Max amount 8 profiles per IP).
    // Array of profiles with the corresponding number of IPs being used
    ProfilesArray: [
      //{ ProfileName: 'SCL-PAL-001', IPs: 1 },
      // Add more profiles here as needed
    ],
  }
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
  // @desc - disable printing death info in D2Bot console
  hideDeaths: true,
  // @desc - enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
  //   or patch.json has been updated (see Single Player Additions in README.md)
  addLadderRW: !me.profile.toLowerCase().contains("nl"),
  // @desc - hide casting animations for better stability (reduce d2bs crashes)
  forcePacketCasting: {
    enabled: true,
    // @desc - allow specific profiles to show casting animations without disabling it for every profile running (helpful when debugging)
    excludeProfiles: [""],
  },
  // @desc - set to true in use with tag Bumper, Socketmule, or Imbuemule to make next character after reaching goal until account is full
  fillAccount: {
    Bumper: {
      Logging: false, // Enable logging of the account and character names in a txt file
      Enabled: false, // Fill account
      Level: 40, // Set stop level for bumpers (20 Normal, 40 Nightmare, 60 Hell) (The objective/target must be achieved)
      Count: 10, // Number of character to fill on account (MAX 18)
    },
    SocketMules: {
      Logging: false, // Enable logging of the account and character names in a txt file
      Enabled: false, // Fill account
      Count: 18, // Number of character to create on account (MAX 18)
    },
    ImbueMules: {
      Logging: false, // Enable logging of the account and character names in a txt file
      Enabled: false, // Fill account
      Level: 30, // Set stop level for imbueMule (The objective/target must be achieved)
      Count: 18, // Number of character to create on account (MAX 18)
    },
  },
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

/**
 * @author Butterz
 * 
 * Calculates and sets the minimum game time based on profile data.
 * If the profile is found in the profiles array, calculates the minimum game time
 * using individual profile IP count. Otherwise, uses default settings.
 *
 * @returns {number} The calculated minimum game time.
 */

function calculateAndSetMinGameTime () {
  const maxAllowedProfilesPerIP = 8; // Maximum number of allowed profiles per single IP address
  
  try {
    const profilesArray = Developer.ProfilesPerIP.ProfilesArray;
    const profileInArray = profilesArray.find(profile => profile.ProfileName.toUpperCase() === me.profile.toUpperCase());

    // Initialize minGameTime based on profilesArray or default
    let minGameTime = Infinity;

    if (profileInArray) {
      // Calculate the MinGameTime based on individual profile IP count
      let clampedNumProfiles = Math.min(profileInArray.IP, maxAllowedProfilesPerIP);

      if (profileInArray.IP > maxAllowedProfilesPerIP) {
        throw new Error("Invalid IP value in ProfilesArray. Maximum allowed is " + maxAllowedProfilesPerIP);
      }

      minGameTime = calculateMinGameTime(clampedNumProfiles);
    } else {
      // Calculate the MinGameTime using default settings
      const numProfiles = Developer.ProfilesPerIP.StaticProfiles;
      let clampedNumProfiles = Math.min(numProfiles, maxAllowedProfilesPerIP);

      if (numProfiles > maxAllowedProfilesPerIP) {
        throw new Error("Invalid numProfiles value. Maximum allowed is " + maxAllowedProfilesPerIP);
      }

      minGameTime = calculateMinGameTime(clampedNumProfiles);
    }

    return minGameTime;
  } catch (error) {
    return 180;
  }
}

/**
 * @author Butterz
 * 
 * Calculates the minimum game time based on the number of profiles,
 * taking into account the maximum allowed profiles per IP address.
 *
 * @param {number} numProfiles - The number of profiles sharing the same IP address.
 * @returns {number} The calculated minimum game time.
 */

function calculateMinGameTime (numProfiles) {
  // Maximum number of allowed profiles per single IP address
  const maxAllowedProfilesPerIP = 8;

  // Default Game Time Configuration
  const defaultMinGameTime = 600; // Default game duration (in seconds) for a single profile on one IP address (Super Safe 10 minutes)

  // Calculate additional game time based on the number of profiles
  const additionalMinGameTimePerProfile = numProfiles >= 2 && numProfiles < 3 ? 300 : 0; // Adds 5 minutes (300 seconds) for each extra profile (Max 2 Profiles)
  const additionalProfileTimeSmallGroup = numProfiles >= 3 && numProfiles < 4 ? 900 : 0; // Adds 15 minutes (900 seconds) for smaller groups (Max 3 Profiles)
  const additionalProfileTimeLargeGroup = numProfiles >= 4 && numProfiles <= 8 ? 1500 : 0; // Adds 25 minutes (1500 seconds) for larger groups (Max 4-8 Profiles)

  // Calculate the MinGameTime using the configured settings
  const clampedNumProfiles = Math.min(numProfiles, maxAllowedProfilesPerIP);
  const additionalTime = (clampedNumProfiles - 1) * additionalMinGameTimePerProfile + additionalProfileTimeSmallGroup + additionalProfileTimeLargeGroup;

  // Calculate the final minimum game time
  const minGameTime = defaultMinGameTime + additionalTime;

  return minGameTime;
}

/**
 * @author Butterz
 * 
 * Validates the profile IP and numProfiles values, printing errors if necessary.
 *
 * @param {object} profileInArray - The profile information from profiles array.
 * @param {number} numProfiles - The number of profiles sharing the same IP address.
 */

function validateProfileIP(numProfiles) {
  const maxAllowedValue = 8; // Maximum number of allowed profiles per single IP address
  const minNotAllowed = 0; // Minimum allowed value for IP and numProfiles
  const profilesArray = Developer.ProfilesPerIP.ProfilesArray;
  const profileInArray = profilesArray.find(profile => profile.ProfileName.toUpperCase() === me.profile.toUpperCase());

  let errorMsg = "";

  if (numProfiles > maxAllowedValue || numProfiles < minNotAllowed) {
    errorMsg = 
      (
        profileInArray
          ? "The value exceeds the allowable limits. For the profile " + profileInArray.ProfileName + ", which has an associated IP value of " + profileInArray.IP
          : "The value exceeds the allowable static limits."
      )
      + (numProfiles > maxAllowedValue 
          ? " The maximum allowable limit is " + maxAllowedValue + ". Using the default value of 3 minutes."
          : " The minimum allowable limit is 1. Using the default value of 3 minutes."
      );
  }

  if (errorMsg) {
    D2Bot.printToConsole(errorMsg, sdk.colors.D2Bot.Red);
  }
}
