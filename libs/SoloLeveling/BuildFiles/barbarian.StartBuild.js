/**
 *    @filename   barbarian.StartBuild.js
 *	  @author	  theBGuy
 *	  @credits	  aim2kill (big shout out for all the testing an ideas for this build)
 *    @desc       barb build for before respecOne
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
		["strength", 30], ["dexterity", 27], ["strength", 35], ["vitality", 40],
        ["strength", 48], ["dexterity", 39], ["vitality", 50],
        ["strength", 56], ["dexterity", 45], ["vitality", 60],
        ["strength", 58], ["dexterity", 50], ["vitality", 70],
        ["strength", 71], ["vitality", "all"],
	],
	skills: [
		[126, 1, false], // Bash -> charlvl 2
		[130, 1, false], // Howl -> charlvl 3
		[127, 2, false], // Sword Mastery -> charlvl 4 (1 point from den)
		[133, 1, false], // Double Swing -> charlvl 6
		[137, 1, false], // Taunt -> charlvl 6
		[127, 3, false], // Sword Mastery -> charlvl 8
		[133, 2, false], // Double Swing -> charlvl 9
		[127, 4, false], // Sword Mastery -> charlvl 10
		[133, 4, false], // Double Swing -> charlvl 11
		[127, 8, false], // Sword Mastery -> charlvl 16
		[143, 1, true], // Leap Attack -> charlvl 18
		[146, 1, true], // Battle Cry -> charlvl 18
		[145, 1, false], // Iron Skin -> charlvl 18
		[147, 1, false], // Frenzy -> charlvl 24
		[149, 1, true], // Battle Orders -> charlvl 24
		[147, 4, false], // Frenzy -> charlvl 24
		[127, 13, false], // Sword Mastery 29
		[137, 20, false], // Taunt -> charlvl 6
	]
};
