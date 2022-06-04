/**
*  @filename    necromancer.LevelingBuild.js
*  @author      theBGuy, isid0re
*  @desc        explosionmancer build for after respecOne
*
*/

// TODO: test summonnovamancer for classic (wouldn't be able to farcast diablo though :( )

let build = {
	caster: true,
	skillstab: sdk.skills.tabs.PoisonandBone,
	wantedskills: [sdk.skills.CorpseExplosion, sdk.skills.BoneSpear],
	usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.BoneArmor, sdk.skills.Decrepify, sdk.skills.BoneWall, sdk.skills.BonePrison, sdk.skills.BoneSpirit, sdk.skills.Teeth],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	classicStats: [
		["dexterity", 51], ["strength", 80], ["energy", 100], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 48], ["vitality", 165], ["strength", 61],
		["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		// Total skills at respec = 29
		[sdk.skills.Decrepify, 1],    // points left 25
		[sdk.skills.SummonResist, 1], // points left 22
		[sdk.skills.BonePrison, 1],   // points left 16
		[sdk.skills.Attract, 1],      // points left 13
		[sdk.skills.BoneSpear, 9],    // points left 5
		[sdk.skills.BonePrison, 3],   // points left 3
		[sdk.skills.BoneSpear, 20, false],
		[sdk.skills.BoneSpirit, 1, false],
		[sdk.skills.BonePrison, 20, false],
		[sdk.skills.CorpseExplosion, 20, false],
		[sdk.skills.BoneWall, 20, false],
		[sdk.skills.Teeth, 20, false],
	],
	stats: undefined,

	active: function () {
		return (me.charlvl > Config.respecOne && me.charlvl > Config.respecOneB && me.getSkill(sdk.skills.BonePrison, 0) >= 1 && !Check.finalBuild().active());
	},
};

// Has to be set after its loaded
build.stats = me.classic ? build.classicStats : build.expansionStats;
