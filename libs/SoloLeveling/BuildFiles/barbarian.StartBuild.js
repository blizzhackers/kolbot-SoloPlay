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
		/*[126, 1, false], // Bash -> charlvl 2
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
		[127, 12, false], // Sword Mastery -> charlvl 22
		[147, 1, true], // Frenzy -> charlvl 24
		[149, 1, true], // Battle Orders -> charlvl 24
		[147, 2, false], // Frenzy -> charlvl 25
		[149, 2, false], // Battle Orders -> charlvl 26
		[147, 3, false], // Frenzy -> charlvl 26
		[149, 3, false], // Battle Orders -> charlvl 27
		[147, 4, false], // Frenzy -> charlvl 27
		[149, 4, false], // Battle Orders -> charlvl 28
		[155, 1, true], // Battle Command -> charlvl 30
		[154, 1, true], // War Cry -> charlvl 30
		[153, 5, true], // Natural Resistance 5 // charLvl 35 (enough res to get out or normal)
		[147, 5, false], // Frenzy -> charlvl 36
		[149, 5, false], // Battle Orders -> charlvl 37
		[147, 6, false], // Frenzy -> charlvl 38
		[149, 6, false], // Battle Orders -> charlvl 39
		[147, 7, false], // Frenzy -> charlvl 40
		[149, 7, false], // Battle Orders -> charlvl 41
		[147, 8, false], // Frenzy -> charlvl 42
		[149, 8, false], // Battle Orders -> charlvl 43
		[147, 9, false], // Frenzy -> charlvl 44
		[149, 9, false], // Battle Orders -> charlvl 45
		[127, 11, false], // Sword Mastery -> charlvl 46
		[149, 10, false], // Battle Orders -> charlvl 47
		[127, 12, false], // Sword Mastery -> charlvl 46
		[149, 11, false], // Battle Orders -> charlvl 49
		[127, 13, false], // Sword Mastery -> charlvl 46
		[149, 12, false], // Battle Orders -> charlvl 51
		[127, 14, false], // Sword Mastery -> charlvl 46
		[149, 13, false], // Battle Orders -> charlvl 53 (BO now lasts 2 minutes)
		[127, 20, false], // Sword Mastery -> charlvl 46
		[149, 20, false], // Battle Orders -> charlvl 69
		[147, 20, false], // Frenzy -> charlvl 61*/
	]
};
