/**
*  @filename    Developer.js
*  @author      theBGuy
*  @desc        Tools/Settings for Kolbot-SoloPlay
*  @contributor Butterz - Added more options for Bumpers,Socket & Imbue. GlobalSettings. Profile timer Array/static. DisplaySettings.
*
*/

/**
 * @todo
 * - add override to GlobalAccount here to allow per profile options
 * - add name choices in similar manner, would have to experiment with max lengths allowed as a prefix
 */
const Developer = {
  // @desc - Global Account Configuration
  GlobalSettings: {
      Account: "",      // Specify a global account name (max 12 chars + suffix length, max total 15).
      Password: "",     // Define a global password for the generated accounts.
      // @desc - Configuration for character name.
      Enable: false,    // Activate global character naming.
      Name: "",         // Specify a global character name prefix.
      // @desc - Configuration for game information.
      GSLabel: false,   // If true, adds the global settings prefix label before the game name.
      GameName: "",     // Core game name; the profile number will be auto-appended.
      GamePass: ""      // Define the game's password.
  },
  // @desc - Configure what information is displayed in the D2bot# status window.
  DisplaySettings: {
    GameType: false,        // Indicate if the game is online (showing IP Address) or offline (marked as singleplayer).
    Online: false,          // Show the online account name (blank in singleplayer).
    GameName: false,        // Show the game name (blank in singleplayer).
    ClockInConsole: false   // Display Total, InGame, and OOG (Out Of Game) time.
  },
  // @desc - Configure profiles to manage IP usage. Helps calculate minimum game time based on profiles sharing the same IP connection to prevent temporary bans.
  ProfilesPerIP: {
    StaticProfiles: 1,   // Define the static number of profiles per IP (Recommended max: 8 profiles per IP).
    
    /**
     * Array of profiles, each detailing the corresponding number of IPs being used.
     * 
     * Example of how to add to the ProfilesArray 
     * ProfilesArray: [
     *  { ProfileName: 'SCL-PAL-001', IP: 1 },
     *  //Add additional profiles as required
     * ],
     */
    ProfilesArray: [],
  },
  // @desc - set to true if using the PlugY mod - allows use of larger stash
  plugyMode: false,
  // @desc - log game/bot statistics to .csv files located at SoloPlay/Data/
  logPerformance: true,
  // @desc - show in game overlay (see bottom of README.md for example)
  overlay: true,
  // @desc - log currently equipped items to D2Bot# charviewer tab
  logEquipped: false,
  //
  // @desc - Configuration settings for D2Bot# console message displays.
  Console: {
      HideChickens: true, // Set to true to suppress the display of "chicken" events in the console.
      HideDeaths: true    // Set to true to suppress the display of character deaths events in the console.
  },
  // @desc - enable ladder runewords in single player mode ONLY WORKS IF RUNEWORDS.TXT IS INSTALLED AND D2BS PROFILE IS CONFIGURED
  //   or patch.json has been updated (see Single Player Additions in README.md)
  addLadderRW: !me.profile.toLowerCase().contains("nl"),
  // @desc - hide casting animations for better stability (reduce d2bs crashes)
  forcePacketCasting: {
    enabled: true,
    // @desc - allow specific profiles to show casting animations without disabling it for every profile running (helpful when debugging)
    excludeProfiles: [""],
  },
  // @desc - For use with Bumper, Socketmule and Imbuemule tags to continuously create characters until the account reaches its capacity or set capacity.
  fillAccount: {
      Bumper: {
        Logging: false,      // Log character details to a file.
        Enabled: false,      // Activate multi-character creation.
        Level: 40,           // Level at which to stop: 20 (Normal), 40 (Nightmare), 60 (Hell).
        Count: 18,           // Number of characters per account (max: 18).
        NextAccount: false   // Use a new account when the current one is full.
      },
      SocketMules: {
        Logging: false,      // Log character details to a file.
        Enabled: false,      // Activate multi-character creation.
        Count: 18,           // Number of characters per account (max: 18).
        NextAccount: false   // Use a new account when the current one is full.
      },
      ImbueMules: {
        Logging: false,      // Log mule details to a file.
        Enabled: false,      // Activate multi-character creation.
        Level: 30,           // Target level to stop. The character progresses until the imbue quest is ready, and then continues until the specified level is reached before stopping.
        Count: 18,           // Mules to create per account (max: 18).
        NextAccount: false   // Use a new account when the current one is full.
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
