/*
 *    @filename 	Sorceress.BlizzballerBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc    		Sorceress blizzballer build for after respecOne
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
		["energy", 50], ["strength", 48], ["vitality", 165], ["strength", 61], ["vitality", 200], ["strength", 127], ["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		// Total skills at respec = 31 (27 skill points + 4 quest skill points)
		[37, 1], // Warmth -> points left 30
		[40, 1], // Frozen Armor -> points left 29
		[42, 1], // Static -> points left 28
		[54, 1], // Teleport -> points left 26
		[59, 1], // blizzard -> points left 21
		[47, 16], // fireball 15 -> points left 5
		[56, 1], // meteor -> points left 1
		[61, 1, false], // Fire Mastery
		[65, 1, false], // cold mastery
		[47, 20], // fireball 20
		[59, 20], // blizzard 20
		[55, 15], // gspike	15
		[56, 15], // meteor 15
		[55, 20], // gspike 20
		[56, 20], // meteor 20
		[65, 5], // cold mastery
		[36, 20], // Fire Bolt
	]
};
