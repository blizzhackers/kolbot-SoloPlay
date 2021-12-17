/**
 *    @filename  	paladin.startBuild.js
 *	  @author	  	isid0re, theBGuy
 *    @desc     	paladin build for before respecOne, respecs at 19
 */

// Paladin Base Info:
// 	Strength: 25,
// 	Dexterity: 20,
// 	Vitality: 25,
// 	Energy: 15,

let build = {
	caster: false,
	skillstab: sdk.skills.tabs.PalaCombat,
	wantedskills: [sdk.skills.Zeal, sdk.skills.HolyFire],
	usefulskills: [(me.getSkill(sdk.skills.HolyFire, 1) ? sdk.skills.Sacrifice : sdk.skills.Might), sdk.skills.ResistFire],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["vitality", 80],
		["dexterity", 27],
		["strength", 47],
		["vitality", "all"],
	],
	skills: [
		// Total skills points by respec = 20
		[sdk.skills.Might, 1],			// charlevel -> 2
		[sdk.skills.ResistFire, 4],		// charlevel -> 5
		[sdk.skills.HolyFire, 3],		// charlevel -> 8
		[sdk.skills.Sacrifice, 1],		// charlevel -> 9
		[sdk.skills.Smite, 1],			// charlevel -> 10
		[sdk.skills.Zeal, 1],			// charlevel -> 12
		[sdk.skills.Charge, 1],			// charlevel -> 12
		[sdk.skills.Zeal, 4],			// charlevel -> 15
		[sdk.skills.HolyFire, 6],		// charlevel -> 17
		[sdk.skills.ResistFire, 16]		// respec at 19
	]
};
