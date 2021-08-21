/**
*   @filename   barbarian.StartBuild.js
*   @author     theBGuy
*   @credits    aim2kill (big shout out for all the testing an ideas for this build)
*   @desc       barb build for before respecOne
*/

var build = {
	caster: false,
	skillstab: 32, // Combat skills
	wantedskills: [149, 147, 133, 127], // Battle Orders, Frenzy, Double Swing, Sword Mastery
	usefulskills: [153, 145, 148, 146, 142], // Natural Resistance, Iron Skin, Increased Speed, Find Item
	mercAuraName: "Might",
	mercAuraWanted: 98,
	mercDiff: 1,
	stats: [
		["strength", 71], ["dexterity", 50], ["vitality", 100],
		["strength", 85], ["dexterity", 60], ["vitality", 110],
		["strength", 103], ["dexterity", 79], ["vitality", 125],
		["dexterity", 94], ["strength", 125], ["vitality", 130],
		["strength", 140], ["vitality", 135], ["strength", 150],
		["vitality", "all"],
    ],
	skills: [
		// Total points at time of respec 33
		[127, 9, true], // Sword Mastery -> total left 24
		[142, 1, true], // Find Item -> total left 22
		[137, 1, true], // Taunt -> total left 21
		[149, 4, true], // Battle Orders -> total left 16
		[155, 1, true], // Battle Command -> charlvl 15
		[153, 1, true], // Natural Resistance -> total left 13
		[147, 2, true], // Frenzy -> total left 7
		[154, 1, true], // War Cry -> total left 5
		[133, 5, true], // Double Swing -> total left 0
		// End of respec points, Start of Stepping build
		[153, 2, false], // Natural Resistance -> charlvl 31
		[154, 2, false], // War Cry -> charlvl 32
		[153, 3, false], // Natural Resistance -> charlvl 33
		[154, 3, false], // War Cry -> charlvl 34
		[137, 11, false], // Taunt -> charlvl 45
		[153, 4, false], // Natural Resistance -> charlvl 46
		[147, 6, false], // Frenzy -> charlvl 50
		[154, 5, false], // War Cry -> charlvl 52
		[147, 9, false], // Frenzy -> charlvl 53
		[149, 6, false], // Battle Orders -> charlvl 54
		[153, 5, false], // Natural Resistance -> charlvl 56
		[154, 6, false], // War Cry -> charlvl 59
		[127, 20, false], // Sword Mastery -> charlvl 67
		[137, 20, false], // Taunt -> charlvl 76
	]
};
