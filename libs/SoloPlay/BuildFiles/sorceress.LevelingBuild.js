/*
 *    @filename 	Sorceress.LevelingBuild.js
 *	  @author	  	theBGuy
 *    @desc    		Sorceress blizzballer build for after respecOneB
 */

let build = {
	caster: true,
	skillstab: sdk.skills.tabs.Cold,
	wantedskills: [sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.ColdMastery],
	usefulskills: [sdk.skills.GlacialSpike, sdk.skills.Meteor, sdk.skills.FireMastery, sdk.skills.StaticField],
	usefulStats: [sdk.stats.PassiveColdPierce, sdk.stats.PassiveColdMastery, sdk.stats.PassiveFireMastery, sdk.stats.PassiveFirePierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		["dexterity", 51], ["strength", 80], ["energy", 100], ["vitality", "all"]
	],
	expansionStats: [
		["energy", 50], ["strength", 48], ["vitality", 165],
		["strength", 61], ["vitality", 200], ["strength", 127],
		["vitality", 252], ["dexterity", "block"], ["vitality", "all"]
	],
	classicSkills: [
		// Total skills at respec = 70
		[sdk.skills.Warmth, 1], 	// points left 69
		[sdk.skills.FrozenArmor, 1], // points left 68
		[sdk.skills.StaticField, 6], // points left 62
		[sdk.skills.Teleport, 4], 	// points left 57
		[sdk.skills.Blizzard, 1], 	// points left 52
		[sdk.skills.Meteor, 8], 	// points left 39
		[sdk.skills.FireMastery, 1], // points left 38
		[sdk.skills.ColdMastery, 1], // points left 37
		[sdk.skills.FrozenOrb, 1], 	// points left 36
		[sdk.skills.FireBall, 10], 	// points left 30
		[sdk.skills.Blizzard, 20], 	// points left 11
		[sdk.skills.IceBlast, 12], 	// points left 0
		[sdk.skills.Meteor, 10],
		[sdk.skills.IceBlast, 20],
		[sdk.skills.ColdMastery, 17],
		[sdk.skills.FireBolt, 20],
	],
	expansionSkills: [
		// Total skills at respec = 70
		[sdk.skills.Warmth, 1], 	// points left 69
		[sdk.skills.FrozenArmor, 1], // points left 68
		[sdk.skills.StaticField, 1], // points left 67
		[sdk.skills.Teleport, 1], 	// points left 65
		[sdk.skills.Blizzard, 1], 	// points left 60
		[sdk.skills.Meteor, 1], 	// points left 54
		[sdk.skills.FireMastery, 1], // points left 53
		[sdk.skills.ColdMastery, 1], // points left 52
		[sdk.skills.FrozenOrb, 1], 	// points left 51
		[sdk.skills.FireBall, 20], 	// points left 33
		[sdk.skills.Blizzard, 20], 	// points left 13
		[sdk.skills.IceBlast, 15], 	// points left 0
		[sdk.skills.Meteor, 15],
		[sdk.skills.IceBlast, 20],
		[sdk.skills.Meteor, 20],
		[sdk.skills.ColdMastery, 5],
		[sdk.skills.FireBolt, 20],
	],
	stats: undefined,
	skills: undefined,

	active: function () {
		return (me.charlvl > Config.respecOne && me.charlvl > Config.respecOneB && me.getSkill(sdk.skills.FireMastery, 0) && !Check.finalBuild().active());
	},
};

// Has to be set after its loaded
build.stats = me.classic ? build.classicStats : build.expansionStats;
build.skills = me.classic ? build.classicSkills : build.classicSkills;
