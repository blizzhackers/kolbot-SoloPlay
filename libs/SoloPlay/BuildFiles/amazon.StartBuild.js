/*
 *    @filename   amazon.StartBuild.js
 *	  @author	  theBGuy
 *    @desc       amazon build for before respecOne
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
		["vitality", "all"],
	],
	skills: [
		[10, 1, false], 	// Jab 				-> charlvl 2
		[8, 1, false], 		// Inner Sight 		-> charlvl 3
		[9, 2, false], 		// Critical Strike 	-> charlvl 4
		[14, 1, false], 	// Power Strike 	-> charlvl 6
		[13, 1, false], 	// Dodge			-> charlvl 6
		[14, 5, false], 	// Power Strike		-> charlvl 10
		[17, 1, false], 	// Slow Missles		-> charlvl 12
		[18, 1, false], 	// Avoid 			-> charlvl 12
		[14, 8, false], 	// Power Strike 	-> charlvl 15
		[24, 1, false], 	// Charged Strike 	-> charlvl 18
		[23, 1, false], 	// Penetrate 		-> charlvl 18
		[24, 5, false], 	// Charged Strike 	-> charlvl 22
		[29, 1, false], 	// Evade 			-> charLvl 24
		[28, 1, false], 	// Decoy 			-> charlvl 24
		[24, 20, false], 	// Charged Strike 	-> respec at 30
	]
};
