/**
*  @filename    amazon.StartBuild.js
*  @author      theBGuy
*  @desc        Charged Strike build for before respecOne
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
	stats: [
		["strength", 34], ["vitality", 30], ["dexterity", 47],
		["vitality", 45], ["strength", 47], ["dexterity", 65],
		["vitality", "all"],
	],
	skills: [
		[sdk.skills.Jab, 1, false],            // charlvl 2
		[sdk.skills.InnerSight, 1, false],     // charlvl 3
		[sdk.skills.CriticalStrike, 2, false], // charlvl 4
		[sdk.skills.PowerStrike, 1, false],    // charlvl 6
		[sdk.skills.Dodge, 1, false],          // charlvl 6
		[sdk.skills.PowerStrike, 5, false],    // charlvl 10
		[sdk.skills.SlowMissiles, 1, false],   // charlvl 12
		[sdk.skills.Avoid, 1, false],          // charlvl 12
		[sdk.skills.PowerStrike, 8, false],    // charlvl 15
		[sdk.skills.ChargedStrike, 1, false],  // charlvl 18
		[sdk.skills.Penetrate, 1, false],      // charlvl 18
		[sdk.skills.ChargedStrike, 5, false],  // charlvl 22
		[sdk.skills.Evade, 1, false],          // charLvl 24
		[sdk.skills.Decoy, 1, false],          // charlvl 24
		[sdk.skills.ChargedStrike, 20, false], // respec at 30
	],

	active: function () {
		return me.charlvl < Config.respecOne && !Skill.canUse(sdk.skills.LightningStrike);
	},
};
