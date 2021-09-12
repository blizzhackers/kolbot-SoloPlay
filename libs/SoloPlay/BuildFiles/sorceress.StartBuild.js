/*
 *    @filename   	sorceress.startBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc       	sorceress Blova build for before respecOne - respecs at level 26
 */

var build = {
	caster: true,
	skillstab: 9, //lightning
	wantedskills: [38, 42], // charged bolt, static
	usefulskills: [40, 49], // frozen armor, lightning
	mercAuraName: "Holy Freeze",
	mercAuraWanted: 114,
	mercDiff: 1,
	stats: [
		["energy", 40], ["vitality", 15], ["energy", 45],
		["vitality", 20], ["energy", 50], ["strength", 15],
		["vitality", 25], ["energy", 60], ["vitality", 40],
		["strength", 35], ["vitality", "all"]
	],
	skills: [
		[38, 4, false], // charged Bolt -> charlvl 3 (3 lvls + den)
		[40, 1], // Frozen Armor -> charlvl 4
		[43, 1], // Telekinesis -> charlvl 5
		[44, 1], // Frost Nova -> charlvl 6
		[42, 4], // Static -> charlvl 10
		[48, 7], // Nova -> charlvl 17
		[54, 1], // Teleport -> charlvl 18
		[42, 6], // Static -> charlvl 20
		[39, 1], // ice bolt -> charlvl 21
		[45, 1], // ice blast -> charlvl 22
		[55, 1], // gspike -> charlvl 
		[45, 3], // ice blast -> charlvl 23
		[59, 6, false], // blizzard -> charlvl 29 (never gets here)
		[65, 1, false], // cold mastery -> charlvl 30 (never gets here)
	]
};
