/**
 *		@filename	necromancer.StartBuild.js
 *		@author		theBGuy, isid0re
 *		@desc		necro build for before respecOne (Bonemancer)
 */

let build = {
	caster: true,
	skillstab: sdk.skills.tabs.PoisonandBone,
	wantedskills: [sdk.skills.Teeth, sdk.skills.BoneSpear],
	usefulskills: [sdk.skills.AmplifyDamage, sdk.skills.BoneArmor, sdk.skills.Decrepify, sdk.skills.BoneWall],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 20], ["vitality", 70], ["strength", 35],
		["energy", 85], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.Teeth, 4], 			// charlvl 4
		[sdk.skills.AmplifyDamage, 1], 	// charlvl 5
		[sdk.skills.ClayGolem, 1], 		// charlvl 6
		[sdk.skills.BoneArmor, 1], 		// charlvl 7
		[sdk.skills.Weaken, 1], 		// charlvl 8
		[sdk.skills.DimVision, 1], 		// charlvl 9
		[sdk.skills.Teeth, 7], 			// charlvl 11
		[sdk.skills.GolemMastery, 1], 	// charlvl 12
		[sdk.skills.IronMaiden, 1], 	// charlvl 13
		[sdk.skills.CorpseExplosion, 1], // charlvl 14
		[sdk.skills.BoneWall, 3], 		// charlvl 17
		[sdk.skills.BoneSpear, 6], 		// charlvl 23
		[sdk.skills.Decrepify, 1], 		// charlvl 24
		[sdk.skills.BoneSpear, 20], 	// charlvl -> Until respec at 26
	],

	active: function () {
		return me.charlvl < Config.respecOne && !me.getSkill(sdk.skills.BonePrison, 0);
	},
};
