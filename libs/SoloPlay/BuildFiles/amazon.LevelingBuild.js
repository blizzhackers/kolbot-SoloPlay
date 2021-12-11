/*
 *    @filename   amazon.LevelingBuild.js
 *	  @author	  theBGuy
 *    @desc       amazon build for after respecOne
 */

var build = {
	caster: false,
	skillstab: sdk.skills.tabs.JavelinSpear,
	wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
	usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	mercAuraName: "Holy Freeze",
	mercAuraWanted: sdk.skills.HolyFreeze,
	mercDiff: 1,
	stats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47],
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118],
		["vitality", 100], ["strength", 118], ["dexterity", 151],
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		// Points at respec 71
		[sdk.skills.Valkyrie, 1], 			// points left 64
		[sdk.skills.LightningFury, 1], 		// points left 57
		[sdk.skills.LightningStrike, 1], 	// points left 56
		[sdk.skills.Pierce, 1], 			// points left 53
		[sdk.skills.ChargedStrike, 10], 	// points left 44
		[sdk.skills.LightningStrike, 10], 	// points left 35
		[sdk.skills.PlagueJavelin, 20], 	// points left 16
		[sdk.skills.Decoy, 5], 				// points left 11
		[sdk.skills.ChargedStrike, 15], 	// points left 7
		[sdk.skills.LightningStrike, 15], 	// points left 2
		[sdk.skills.ChargedStrike, 17], 	// points left 0
		[sdk.skills.LightningStrike, 20, false],
		[sdk.skills.ChargedStrike, 20, false],
		[sdk.skills.LightningFury, 20, false],
		[sdk.skills.Valkyrie, 17, false],
		[sdk.skills.PowerStrike, 20, false],
	]
};
