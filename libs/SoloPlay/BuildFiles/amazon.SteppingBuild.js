/*
 *    @filename   amazon.SteppingBuild.js
 *	  @author	  theBGuy
 *    @desc       amazon build for after respecOne and before respecOneB
 */

let build = {
	caster: false,
	skillstab: sdk.skills.tabs.JavelinSpear,
	wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
	usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Holy Freeze",
	classicStats: [
		 ["dexterity", 65], ["strength", 75], ["vitality", "all"]
	],
	expansionStats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47],
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", 65], ["strength", 53], ["dexterity", 118],
		["vitality", 100], ["strength", 118], ["dexterity", 151],
		["strength", 156], ["vitality", "all"],
	],
	skills: [
		// points at respec 33
		[sdk.skills.LightningStrike, 1], 		// points left 27
		[sdk.skills.Valkyrie, 1], 				// points left 20
		[sdk.skills.Penetrate, 1], 				// points left 18
		[sdk.skills.ChargedStrike, 13], 		// points left 6
		[sdk.skills.PowerStrike, 5], 			// points left 2
		[sdk.skills.LightningFury, 1], 			// points left 0
		[sdk.skills.LightningStrike, 20, false], // charlvl ?
		[sdk.skills.ChargedStrike, 20, false], 	// charlvl 52
		[sdk.skills.LightningFury, 20, false], 	// respec at 64
	],
	stats: undefined,

	active: function () {
		return me.charlvl > Config.respecOne && me.charlvl < Config.respecOneB && me.getSkill(sdk.skills.LightningStrike, 0) && me.getSkill(sdk.skills.PlagueJavelin, 0) <= 5;
	},
};

// Has to be set after its loaded
build.stats = me.classic ? build.classicStats : build.expansionStats;
