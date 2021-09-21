/*
 *    @filename   amazon.LevelingBuild.js
 *	  @author	  theBGuy
 *    @desc       amazon build for after respecOne
 */

var build = {
	caster: false,
	skillstab: 2, // Jav N Spear Skills
	wantedskills: [24, 34], // Charged Strike, Lightning Strike
	usefulskills: [9, 23, 32, 33], // Critical Strike, Penetrate, Valkyrie, Pierce
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47], 
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118], 
		["vitality", 100], ["strength", 118], ["dexterity", 151], 
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		// Points at respec 71
		[32, 1], 	// Valkyrie 1 -> points left 64
		[35, 1], 	// Lightning Fury -> points left 57
		[34, 1], 	// Lightning Strike -> points left 56
		[33, 1], 	// Pierce -> points left 53
		[24, 10], 	// Charged Strike -> points left 44
		[34, 10], 	// Lightning Strike -> points left 35
		[25, 20], 	// Plague Javelin -> points left 16
		[28, 5], 	// Decoy -> points left 11
		[24, 15], 	// Charged Strike -> points left 7
		[34, 15], 	// Lightning Strike -> points left 2
		[24, 17], 	// Charged Strike -> points left 0
		[34, 20, false], // Lightning Strike
		[24, 20, false], // Lightning Strike
		[35, 20, false], // Lightning Fury
		[32, 17, false], // Valkyrie
		[14, 20, false], // Power Strike
	]
};
