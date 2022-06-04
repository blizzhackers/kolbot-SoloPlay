/**
*  @filename    Sorceress.startBuild.js
*  @author      isid0re, theBGuy
*  @desc        Blova build for before respecOne - respecs at level 26
*
*/

let build = {
	caster: true,
	skillstab: sdk.skills.tabs.Lightning,
	wantedskills: [sdk.skills.ChargedBolt, sdk.skills.StaticField],
	usefulskills: [sdk.skills.FrozenArmor, sdk.skills.Lightning],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	stats: [
		["energy", 40], ["vitality", 15], ["energy", 45],
		["vitality", 20], ["energy", 50], ["strength", 15],
		["vitality", 25], ["energy", 60], ["vitality", 40],
		["strength", 35], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.ChargedBolt, 3, false], // charlvl 2 (2 lvls + den)
		[sdk.skills.IceBolt, 1],            // charlvl 4
		[sdk.skills.FrozenArmor, 1],        // charlvl 4
		[sdk.skills.Telekinesis, 1],        // charlvl 5
		[sdk.skills.FrostNova, 1],          // charlvl 6
		[sdk.skills.StaticField, 4],        // charlvl 10
		[sdk.skills.Nova, 7],               // charlvl 17
		[sdk.skills.Teleport, 1],           // charlvl 18
		[sdk.skills.StaticField, 6],        // charlvl 20
		[sdk.skills.IceBlast, 1],           // charlvl 22
		[sdk.skills.GlacialSpike, 1],       // charlvl 
		[sdk.skills.IceBlast, 3],           // charlvl 23
		[sdk.skills.Blizzard, 6, false],    // charlvl 29 (never gets here)
		[sdk.skills.ColdMastery, 1, false], // charlvl 30 (never gets here)
	],

	active: function () {
		return me.charlvl < Config.respecOne && !me.getSkill(sdk.skills.ColdMastery, 0);
	},
};
