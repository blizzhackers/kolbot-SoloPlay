/**
 *    @filename   barbarian.StartBuild.js
 *	  @author	  theBGuy
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
		[127, 3, false], // Sword Mastery -> charlvl 8
		[126, 2, false], // Bash -> charlvl 9
		[127, 4, false], // Sword Mastery -> charlvl 10
		[126, 3, false], // Bash -> charlvl 11
		[139, 1, false], // Stun -> charlvl 12
		[127, 5, false], // Sword Mastery -> charlvl 13
		[126, 4, false], // Bash -> charlvl 14
		[127, 6, false], // Sword Mastery -> charlvl 15
		[126, 5, false], // Bash -> charlvl 16
		[144, 1, true], // Concentrate -> charlvl 18
		[146, 1, true], // Battle Cry -> charlvl 18
		[145, 1, false], // Iron Skin -> charlvl 18
		[127, 7, false], // Sword Mastery -> charlvl 19
		[126, 6, false], // Bash -> charlvl 20
		[127, 8, false], // Sword Mastery -> charlvl 21
		[126, 7, false], // Bash -> charlvl 22
		[127, 9, false], // Sword Mastery -> charlvl 23
		[126, 8, false], // Bash -> charlvl 24
		[149, 1, true], // Battle Orders -> charlvl 24
	]
};
