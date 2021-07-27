/**
 *    @filename   barbarian.SteppingBuild.js
 *	  @author	  theBGuy
 *    @desc       barb stepping stone build for after Start but before Leveling
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
		["strength", 25], ["dexterity", 25], ["vitality", 30],
		["strength", 48], ["dexterity", 39], ["vitality", 50],
		["strength", 55], ["dexterity", 45], ["vitality", 60],
		["strength", 58], ["dexterity", 58], ["vitality", 70],
		["strength", 85], ["dexterity", 60], ["vitality", 80],
		["strength", 103], ["dexterity", 79], ["vitality", 90],
		["dexterity", 136], ["strength", 150], ["vitality", "all"],
	],
	skills: [
		[126, 1, false], // Bash -> charlvl 2
		[130, 1, false], // Howl -> charlvl 3
		[127, 2, false], // Sword Mastery -> charlvl 4 (1 point from den)
		[133, 1, false], // Double Swing -> charlvl 6
		[137, 1, false], // Taunt -> charlvl 6
		[138, 1, false], // Shout -> charlvl 7
		[127, 6, false], // Sword Mastery -> charlvl 11
		[139, 1, false], // Stun -> charlvl 12
		[127, 8, false], // Sword Mastery -> charlvl 15
		[144, 1, true], // Concentrate -> charlvl 18
		[146, 1, true], // Battle Cry -> charlvl 18
		[145, 1, false], // Iron Skin -> charlvl 18
		[143, 1, true], // Leap Attack -> charlvl 20
		[127, 12, false], // Sword Mastery -> charlvl 22
		[147, 1, true], // Frenzy -> charlvl 24
		[149, 1, false], // Battle Orders -> charlvl 24
		[147, 2, false], // Frenzy -> charlvl 25
		[149, 2, false], // Battle Orders -> charlvl 26
		[147, 3, false], // Frenzy -> charlvl 26
		[149, 3, false], // Battle Orders -> charlvl 27
		[147, 4, false], // Frenzy -> charlvl 27
		[149, 4, false], // Battle Orders -> charlvl 28
		[151, 1, true], // Whirlwind -> charlvl 30
		[154, 1, true], // War Cry -> charlvl 30
		[155, 1, true], // Battle Command -> charlvl 31
		[153, 3, true], // Natural Resistance 5 // charLvl 34 (enough res to get out or normal)
		[151, 6, true], // Whirlwind -> charlvl 39
		[147, 5, false], // Frenzy -> charlvl 36
		[127, 13, false], // Sword Mastery -> charlvl 46
		[147, 6, false], // Frenzy -> charlvl 38
		[127, 14, false], // Sword Mastery -> charlvl 46
		[147, 7, false], // Frenzy -> charlvl 40
		[127, 15, false], // Sword Mastery -> charlvl 46
		[147, 8, false], // Frenzy -> charlvl 42
		[127, 16, false], // Sword Mastery -> charlvl 46
		[147, 9, false], // Frenzy -> charlvl 44
		[133, 8, true], // Double Swing -> charlvl 6
		[127, 20, false], // Sword Mastery -> charlvl 46
		[153, 5, true], // Natural Resistance 5
		[149, 20, false], // Battle Orders -> charlvl 69
		[147, 20, false], // Frenzy -> charlvl 61
	]
};
