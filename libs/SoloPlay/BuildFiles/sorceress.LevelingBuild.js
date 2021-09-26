/*
 *    @filename 	Sorceress.LevelingBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc    		Sorceress blizzballer build for after respecOneB
 */

var build = {
	caster: true,
	skillstab: sdk.skills.tabs.Cold,
	wantedskills: [sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.ColdMastery],
	usefulskills: [sdk.skills.GlacialSpike, sdk.skills.Meteor, sdk.skills.FireMastery, sdk.skills.StaticField],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["energy", 50], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 200], ["strength", 127],
		["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
	],
	skills: [
		// Total skills at respec = 70
		[sdk.skills.Warmth, 1], 	// points left 69
		[sdk.skills.FrozenArmor, 1],// points left 68
		[sdk.skills.StaticField, 1],// points left 67
		[sdk.skills.Teleport, 1], 	// points left 65
		[sdk.skills.Blizzard, 1], 	// points left 60
		[sdk.skills.Meteor, 1], 	// points left 54
		[sdk.skills.FireMastery, 1],// points left 53
		[sdk.skills.ColdMastery, 1],// points left 52
		[sdk.skills.FrozenOrb, 1], 	// points left 51
		[sdk.skills.FireBall, 20], 	// points left 33
		[sdk.skills.Blizzard, 20], 	// points left 13
		[sdk.skills.IceBlast, 15], 	// points left 0
		[sdk.skills.Meteor, 15],
		[sdk.skills.IceBlast, 20],
		[sdk.skills.Meteor, 20],
		[sdk.skills.ColdMastery, 5],
		[sdk.skills.FireBolt, 20],
	]
};
