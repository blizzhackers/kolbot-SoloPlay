/**
 *    @filename   necromancer.LevelingBuild.js
 *	  @author	  isid0re, theBGuy
 *    @desc       explosionmancer necro build for after respecOne
 */

var build = {
	caster: true,
	skillstab: sdk.skills.tabs.PoisonBone,
	wantedskills: [sdk.skills.CorpseExplosion, sdk.skills.BoneSpear],
	usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.BoneArmor, sdk.skills.Decrepify, sdk.skills.BoneWall, sdk.skills.BonePrison, sdk.skills.BoneSpirit, sdk.skills.Teeth],
	mercAuraName: "Might",
	mercAuraWanted: sdk.skills.Might,
	mercDiff: 1,
	stats: [
		["strength", 48], ["vitality", 165], ["strength", 61],
		["vitality", 252], ["strength", 156], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.AmplifyDamage, 1],
		[sdk.skills.Teeth, 1],
		[sdk.skills.BoneArmor, 1],
		[sdk.skills.Weaken, 1],
		[sdk.skills.CorpseExplosion, 1],
		[sdk.skills.ClayGolem, 1],
		[sdk.skills.Terror, 1],
		[sdk.skills.GolemMastery, 1],
		[sdk.skills.BoneWall, 1],
		[sdk.skills.BoneSpear, 1],
		[sdk.skills.Decrepify, 1],
		[sdk.skills.SummonResist, 1],
		[sdk.skills.BonePrison, 1],
		[sdk.skills.DimVision, 1],
		[sdk.skills.BoneSpear, 20, false],
		[sdk.skills.BoneSpirit, 1, false],
		[sdk.skills.Attract, 1],
		[sdk.skills.BonePrison, 20, false],
		[sdk.skills.CorpseExplosion, 20, false],
		[sdk.skills.BoneWall, 20, false],
		[sdk.skills.Teeth, 20, false],
	]
};
