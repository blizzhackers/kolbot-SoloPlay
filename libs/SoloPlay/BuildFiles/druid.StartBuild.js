/**
 *    @filename   druid.StartBuild.js
 *	  @author	  isid0re, theBGuy
 *    @desc       druid fire build for before respecOne
 */

let build = {
	caster: true,
	skillstab: 42, // elemental
	wantedskills: [225, 234], // firestorm, fissure
	usefulskills: [229], // molten boulder
	mercAuraName: "Blessed Aim",
	mercAuraWanted: 108,
	mercDiff: 0,
	stats: [
		["vitality", 70],
		["strength", 35],
		["energy", 85],
		["vitality", "all"]
	],
	skills: [
		[222, 2, false], // poison creeper
		[225, 4, false], // firestorm
		[229, 1], // molten boulder
		[225, 7, false], // firestorm
		[234, 1], // fissure
		[231, 1], // carrion vine
		[234, 8, false], // fissure
		[225, 11, false], // firestorm
		[234, 20, false], // fissure
		[225, 18, false], // firestorm
	]
};
