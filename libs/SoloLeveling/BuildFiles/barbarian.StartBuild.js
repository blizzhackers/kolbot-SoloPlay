/**
*   @filename   barbarian.StartBuild.js
*   @author     theBGuy
*   @credits    aim2kill (big shout out for all the testing an ideas for this build)
*   @desc       barb build for before respecOne
*/

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 147, 133, 127, 151], // Battle Orders, Frenzy, Double Swing, Sword Mastery, whirlwind
	usefulskills: [153, 145, 148, 146], // Natural Resistance, Iron Skin, Increased Speed, concentrate
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
        ["strength", 35], ["dexterity", 27], ["vitality", 45],
        ["strength", 48], ["dexterity", 30], ["vitality", 55],
        ["strength", 55], ["dexterity", 39], ["vitality", 65],
        ["strength", 60], ["dexterity", 40], ["vitality", 75],
        ["strength", 71], ["dexterity", 49], ["vitality", "all"],
	],
	skills: [
        [126, 1], // Bash -> Level 2
        [130, 1], // Howl -> Level 3
        [133, 6, false], // Double Swing -> Level 9
        [127, 5], // Sword Mastery -> Level 13
        //[141, 1], // Increased Stamina
        [137, 1], // Taunt  -> Level 14
        [127, 6], // Sword Mastery -> Level 15
        [145, 1], // Iron Skin  -> Level 18
        [146, 1], // Battle Cry  -> Level 18
        [127, 9], // Sword Mastery
        [140, 1], // Double Throw
        [138, 1], // Shout
        [147, 1], // Frenzy
        //[148, 1], // Increased Speed
        [149, 4, false], // Battle Orders
        [137, 20], // Taunt
    ]
};
