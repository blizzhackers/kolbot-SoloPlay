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
		["vitality", 65], ["strength", 53], ["dexterity", 118], 
		["vitality", 100], ["strength", 118], ["dexterity", 151], 
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		[10, 1, false], // Jab 1 // -> charlvl 2
		[8, 1, false], // Inner Sight 1 // -> charlvl 3
		[9, 2, false], // Critical Strike 2 // -> charlvl 5
		[14, 1, false], // Power Strike 1 // -> charlvl 6
		[13, 1, false], // Dodge 1 // -> charlvl 7
		[14, 4, false], // Power Strike 4 // -> charlvl 11
		[17, 1, false], // Slow Missles 1 // -> charlvl 12
		[18, 1, false], // Avoid 1 // -> charlvl 13
		[14, 8, false], // Power Strike 8 // -> charlvl 17
		[24, 1, false], // Charged Strike 1 // -> charlvl 18
		[23, 1, false], // Penetrate 1 // -> charlvl 18
		[24, 5, false], // Charged Strike 5 // -> charlvl 23
		[29, 1, false], // Evade 1 // charLvl 24
		[28, 1, false], // Decoy 1 // -> charlvl 25
		[24, 9, false], // Charged Strike 9 // -> charlvl 29
		[32, 1, false], // Valkyrie 1 // -> charlvl 30
		[34, 1, false], // Lightning Strike 1 // -> charlvl 31
		[24, 20, false], // Charged Strike 20 // -> charlvl 42
		[28, 5, false], // Decoy 5 // -> charlvl 47
		[34, 20, false], // Lightning Strike 20 // -> charlvl 63
		[35, 10, false], // Lightning Fury 20 // -> charlvl ? 
		[25, 20, true], // Plague Javelin 10 // -> charlvl ?
		[35, 20, false], // Lightning Fury 20 // -> charlvl ? 
		[32, 17, false], // Valkyrie 20 // -> charlvl ? 
		[14, 20, false], // Power Strike 20 // -> charlvl ?
	]
};
