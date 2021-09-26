/*
 *    @filename   	sorceress.startBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc       	sorceress Blova build for before respecOne - respecs at level 26
 */

var build = {
	caster: true,
	skillstab: 9, //lightning
	wantedskills: [sdk.skills.ChargedBolt, sdk.skills.StaticField],
	usefulskills: [sdk.skills.FrozenArmor, sdk.skills.Lightning],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["energy", 40], ["vitality", 15], ["energy", 45],
		["vitality", 20], ["energy", 50], ["strength", 15],
		["vitality", 25], ["energy", 60], ["vitality", 40],
		["strength", 35], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.ChargedBolt, 4, false], // charlvl 3 (3 lvls + den)
		[sdk.skills.FrozenArmor, 1], 		// charlvl 4
		[sdk.skills.Telekinesis, 1], 		// charlvl 5
		[sdk.skills.FrostNova, 1], 			// charlvl 6
		[sdk.skills.StaticField, 4], 		// charlvl 10
		[sdk.skills.Nova, 7], 				// charlvl 17
		[sdk.skills.Teleport, 1], 			// charlvl 18
		[sdk.skills.StaticField, 6], 		// charlvl 20
		[sdk.skills.IceBolt, 1], 			// charlvl 21
		[sdk.skills.IceBlast, 1], 			// charlvl 22
		[sdk.skills.GlacialSpike, 1], 		// charlvl 
		[sdk.skills.IceBlast, 3], 			// charlvl 23
		[sdk.skills.Blizzard, 6, false], 	// charlvl 29 (never gets here)
		[sdk.skills.ColdMastery, 1, false], // charlvl 30 (never gets here)
	]
};
