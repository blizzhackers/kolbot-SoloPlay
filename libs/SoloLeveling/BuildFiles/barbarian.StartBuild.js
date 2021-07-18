/**
 *    @filename   barbarian.StartBuild.js
 *	  @author	  theBGuy
 *    @desc       barb build for before respecOne
 */

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 147, 133], // Battle Orders, Frenzy, Double Swing
	usefulskills: [153, 145, 148], // Natural Resistance, Iron Skin, Incresed Speed
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		/*["vitality", 30], ["strength", 37], ["dexterity", 25], 
		["strength", 55], ["dexterity", 39], ["vitality", 50],
		["strength", 85], ["dexterity", 60], ["vitality", 65], 
		["strength", 103], ["dexterity", 79], ["vitality", 80],
		["strength", 125], ["dexterity", 136], ["vitality", 105],
		["strength", 150], ["vitality", "all"],*/
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
		[130, 1, false], // Howl -> charlvl 4
		[127, 2, false], // Sword Mastery -> charlvl 3 (1 point from den)
		[133, 1, false], // Double Swing -> charlvl 6
		[138, 1, false], // Shout -> charlvl 6
		[139, 1, false], // Stun -> charlvl 12
		[133, 9, true], // Double Swing -> charlvl 14
		[146, 1, true], // Battle Cry -> charlvl 18
		[145, 1, true], // Iron Skin -> charlvl 18
		[127, 6, false], // Sword Mastery -> charlvl 23
		[147, 1, true], // Frenzy -> charlvl 24
		[149, 1, true], // Battle Orders -> charlvl 24
		[147, 2, false], // Frenzy -> charlvl 25
		[149, 2, false], // Battle Orders -> charlvl 26
		[147, 3, false], // Frenzy -> charlvl 26
		[149, 3, false], // Battle Orders -> charlvl 27
		[147, 4, false], // Frenzy -> charlvl 29
		[155, 1, true], // Battle Command -> charlvl 30
		[154, 1, true], // War Cry -> charlvl 30
		[153, 5, true], // Natural Resistance 5 // charLvl 35 (enough res to get out or normal)
		[147, 5, false], // Frenzy -> charlvl 36
		[149, 4, false], // Battle Orders -> charlvl 37
		[147, 6, false], // Frenzy -> charlvl 38
		[149, 5, false], // Battle Orders -> charlvl 39
		[147, 7, false], // Frenzy -> charlvl 40
		[149, 6, false], // Battle Orders -> charlvl 41
		[147, 8, false], // Frenzy -> charlvl 42
		[149, 7, false], // Battle Orders -> charlvl 43
		[147, 9, false], // Frenzy -> charlvl 44
		[149, 8, false], // Battle Orders -> charlvl 45
		[147, 10, false], // Frenzy -> charlvl 46
		[149, 9, false], // Battle Orders -> charlvl 47
		[147, 11, false], // Frenzy -> charlvl 48
		[149, 10, false], // Battle Orders -> charlvl 49
		[147, 12, false], // Frenzy -> charlvl 50
		[149, 11, false], // Battle Orders -> charlvl 51
		[147, 13, false], // Frenzy -> charlvl 52
		[149, 12, false], // Battle Orders -> charlvl 53 (BO now lasts 2 minutes, so lets max Frenzy)
		[147, 20, false], // Frenzy -> charlvl 61
		[149, 20, false], // Battle Orders -> charlvl 69
	]
};