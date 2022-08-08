/**
*  @filename    amazon.LevelingBuild.js
*  @author      theBGuy
*  @desc        Lightning/poison javelin build for after respecOneB
*
*/

let build = {
	caster: false,
	skillstab: sdk.skills.tabs.JavelinandSpear,
	wantedskills: [sdk.skills.ChargedStrike, sdk.skills.LightningStrike],
	usefulskills: [sdk.skills.CriticalStrike, sdk.skills.Penetrate, sdk.skills.Valkyrie, sdk.skills.Pierce],
	usefulStats: [sdk.stats.PierceLtng, sdk.stats.PassiveLightningMastery, sdk.stats.PassiveLightningPierce],
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
	classicSkills: [
		// Points at respec 71
		[sdk.skills.Valkyrie, 1],              // points left 64
		[sdk.skills.Pierce, 1],                // points left 61
		[sdk.skills.LightningFury, 1],         // points left 57
		[sdk.skills.LightningStrike, 17],      // points left 37
		[sdk.skills.PlagueJavelin, 20],        // points left 18
		[sdk.skills.ChargedStrike, 15],        // points left 4
		[sdk.skills.Decoy, 5],                 // points left 0
		[sdk.skills.LightningStrike, 20, false],
		[sdk.skills.ChargedStrike, 20, false],
		[sdk.skills.PoisonJavelin, 20, false], // synergy for PlagueJavelin
		[sdk.skills.Valkyrie, 12, false],
		[sdk.skills.LightningFury, 20, false],
	],
	expansionSkills: [
		// Points at respec 71
		[sdk.skills.Valkyrie, 1],           // points left 64
		[sdk.skills.Pierce, 1],             // points left 61
		[sdk.skills.LightningFury, 1],      // points left 57
		[sdk.skills.LightningStrike, 15],   // points left 39
		[sdk.skills.ChargedStrike, 17],     // points left 23
		[sdk.skills.PlagueJavelin, 20],     // points left 4
		[sdk.skills.Decoy, 5],              // points left 0
		[sdk.skills.LightningStrike, 20, false],
		[sdk.skills.ChargedStrike, 20, false],
		[sdk.skills.LightningFury, 20, false],
		[sdk.skills.Valkyrie, 17, false],
		[sdk.skills.PowerStrike, 20, false],
	],
	stats: undefined,
	skills: undefined,

	active: function () {
		return (me.charlvl > CharInfo.respecOne && me.charlvl > CharInfo.respecTwo && me.getSkill(sdk.skills.PlagueJavelin, sdk.skills.subindex.HardPoints) === 20 && !Check.finalBuild().active());
	},
};

// Has to be set after its loaded
build.stats = me.classic ? build.classicStats : build.expansionStats;
build.skills = me.classic ? build.classicSkills : build.expansionSkills;
me.classic && build.usefulStats.push(sdk.stats.PassivePoisonMastery, sdk.stats.PassivePoisonPierce, sdk.stats.PiercePois);
