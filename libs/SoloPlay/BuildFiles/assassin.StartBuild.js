/**
 *    @filename   assassin.StartBuild.js
 *	  @author	  theBGuy
 *    @desc       assassin build for before respecOne
 */

var build = {
	caster: true,
	skillstab: 48, // traps
	wantedskills: [251, 262], // fireblast, wake of fire
	usefulskills: [264, 268], // Cloak of shadows, shadow warrior
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["vitality", 35], ["energy", 35], ["strength", 33], ["dexterity", 33],
		["vitality", 50], ["strength", 46], ["dexterity", 46],
		["vitality", 70], ["strength", 50], ["dexterity", 50],
		["energy", 50], ["vitality", "all"]
	],
	skills: [
		[251, 4, false], // fireblast -> level 4
		[252, 1], // claw mastery -> level 5 (den)
		[253, 1], // physic hammer -> level 6
		[258, 5], // burst of speed -> level 11
		[262, 1, false], // wake of fire -> level 12
		[264, 1, true], // CoS -> level 13
		[262, 10, false], // wake of fire -> level 24
		[251, 6, false], // fireblast -> level 26
		[262, 20, false], // wake of fire -> level 36
		[251, 10], // fireblast -> level 42
	]
};
