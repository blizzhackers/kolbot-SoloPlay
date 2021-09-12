/*
 *    @filename 	Sorceress.SteppingBuild.js
 *	  @author	  	theBGuy
 *    @desc    		Sorceress Blizzard build for after respecOne and before respecOneB - respecs at 65
 */

var build = {
	caster: true,
	skillstab: 10, //cold
	wantedskills: [59, 55, 65], // blizzard, gspike, cold mastery
	usefulskills: [45, 37, 42], // ice blast, warmth, static
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["energy", 69], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 200], ["strength", 100],
		["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		// Total skills at respec = 25 
		[37, 1], // Warmth -> points left 24
		[40, 1], // Frozen Armor -> points left 23
		[42, 1], // Static -> points left 22
		[54, 4], // Teleport -> points left 17
		[59, 1], // blizzard -> points left 12
		[45, 15], // Ice blast -> points left 0
		[65, 1, false], // cold mastery
		[64, 1, false], // frozen orb
		[59, 20, false], // blizzard 20
		[45, 20, false], // Ice blast
		[65, 5], // cold mastery
		[55, 20, false], // gspike 20
	]
};
