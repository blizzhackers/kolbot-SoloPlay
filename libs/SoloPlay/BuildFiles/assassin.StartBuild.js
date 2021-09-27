/**
 *    @filename   assassin.StartBuild.js
 *	  @author	  theBGuy
 *    @desc       assassin build for before respecOne
 */

var build = {
	caster: true,
	skillstab: sdk.skills.tabs.Traps,
	wantedskills: [sdk.skills.FireBlast, sdk.skills.WakeOfFire],
	usefulskills: [sdk.skills.CloakOfShadows, sdk.skills.ShadowWarrior],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["vitality", 35], ["energy", 35], ["strength", 33], ["dexterity", 33],
		["vitality", 50], ["strength", 46], ["dexterity", 46],
		["vitality", 70], ["strength", 50], ["dexterity", 50],
		["energy", 50], ["vitality", "all"]
	],
	skills: [
		[sdk.skills.FireBlast, 4, false], 		// level 4
		[sdk.skills.ClawMastery, 1], 			// level 5 (den)
		[sdk.skills.PhysicHammer, 1], 			// level 6
		[sdk.skills.BurstofSpeed, 5], 			// level 11
		[sdk.skills.WakeOfFire, 1, false], 		// level 12
		[sdk.skills.CloakOfShadows, 1, true], 	// level 13
		[sdk.skills.WakeOfFire, 10, false], 	// level 24
		[sdk.skills.FireBlast, 6, false], 		// level 26
		[sdk.skills.WakeOfFire, 20, false], 	// level 36
		[sdk.skills.FireBlast, 10], 			// level 42
	]
};
