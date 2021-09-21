/*
 *    @filename   amazon.SteppingBuild.js
 *	  @author	  theBGuy
 *    @desc       amazon build for after respecOne and before respecOneB
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
		// points at respec 33
		[34, 1], 	// Lightning Strike -> points left 27
		[32, 1], 	// Valkyrie 		-> points left 20
		[23, 1], 	// Penetrate 		-> points left 18
		[24, 13], 	// Charged Strike 	-> points left 6
		[14, 5], 	// Power Strike		-> pointe left 2
		[35, 1], 	// Lightning Fury 	-> points left 0
		[34, 20, false], 	// Lightning Strike -> charlvl ?
		[24, 20, false], 	// Charged Strike 	-> charlvl 52
		[35, 20, false], 	// Lightning Fury 	-> respec at 64
	]
};
