/*
 *    @filename 	Sorceress.LevelingBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc    		Sorceress blizzballer build for after respecOneB
 */

var build = {
	caster: true,
	skillstab: 10, //cold
	wantedskills: [59, 47, 65], // blizzard, fireball, cold mastery
	usefulskills: [55, 56, 61, 42], // glacial spike, meteor, fire mastery, static
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["energy", 50], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 200], ["strength", 127],
		["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		// Total skills at respec = 70
		[37, 1], // Warmth -> points left 69
		[40, 1], // Frozen Armor -> points left 68
		[42, 1], // Static -> points left 67
		[54, 1], // Teleport -> points left 65
		[59, 1], // blizzard -> points left 60
		[56, 1], // meteor -> points left 54
		[61, 1], // Fire Mastery -> points left 53
		[65, 1], // cold mastery -> points left 52
		[64, 1], // frozen orb -> points left 51
		[47, 20], // fireball 20 -> points left 33
		[59, 20], // blizzard 20 -> points left 13
		[55, 15], // gspike	15
		[56, 15], // meteor 15
		[55, 20], // gspike 20
		[56, 20], // meteor 20
		[65, 5], // cold mastery
		[36, 20], // Fire Bolt
	]
};
