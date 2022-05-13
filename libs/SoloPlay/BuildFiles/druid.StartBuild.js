/**
 *		@filename	druid.StartBuild.js
 *		@author		isid0re, theBGuy
 *		@desc		druid fire build for before respecOne
 */

let build = {
	caster: true,
	skillstab: 42, // elemental
	wantedskills: [sdk.skills.Firestorm, sdk.skills.Fissure],
	usefulskills: [sdk.skills.MoltenBoulder],
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
		[sdk.skills.PoisonCreeper, 2, false],
		[sdk.skills.Firestorm, 4, false],
		[sdk.skills.MoltenBoulder, 1],
		[sdk.skills.Firestorm, 7, false],
		[sdk.skills.Fissure, 1],
		[sdk.skills.CarrionVine, 1],
		[sdk.skills.Fissure, 8, false],
		[sdk.skills.Firestorm, 11, false],
		[sdk.skills.Fissure, 20, false],
		[sdk.skills.Firestorm, 18, false],
	],

	active: function () {
		return me.charlvl < Config.respecOne && !me.getSkill(sdk.skills.Tornado, 0);
	},
};
