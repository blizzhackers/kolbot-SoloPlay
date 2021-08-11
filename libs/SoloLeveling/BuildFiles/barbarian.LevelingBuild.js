/**
 *		@filename   barbarian.LevelingBuild.js
 *		@author	  	theBGuy
 *		@desc       barb build for before respecTwo
 */

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 147, 133, 127], // Battle Orders, Frenzy, Double Swing, Sword Mastery
	usefulskills: [153, 145, 148, 138], // Natural Resistance, Iron Skin, Increased Speed, Shout
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		// Total points at time of respec 79
		[127, 13, true], // Sword Mastery -> total left 66
		[133, 9, true], // Double Swing -> total left 56
		[153, 5, true], // Natural Resistance -> total left 51
		[147, 9, true], // Frenzy -> total left 42
		[152, 5, true], // Berserk -> total left 35
		[154, 5, true], // War Cry -> total left 25
		[155, 1, true], // Battle Command -> total left 24
		[149, 8, true], // Battle Orders -> total left 16
		[137, 16, true], // Taunt -> total left 0
		// End of respec points, Start of Leveling build - total points left to use 31
		[137, 20, false], // Taunt -> charlvl 75 -> total left 27
		[149, 10, false], // Battle Orders -> charlvl 77 -> total left 25
		[127, 20, false], // Sword Mastery -> charlvl 84 -> total left 18
		[147, 20, false], // Frenzy -> total left 7
		[149, 15, false], // Battle Orders -> total left 0
	]
};
