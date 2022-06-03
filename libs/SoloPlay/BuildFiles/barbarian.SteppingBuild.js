/**
*  @filename    barbarian.SteppingBuild.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Frenzy/War Cry build for after respecOne and before respecOneB
*
*/

let build = {
	caster: false,
	skillstab: sdk.skills.tabs.CombatBarb,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing, sdk.skills.SwordMastery],
	usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed, sdk.skills.Shout, sdk.skills.FindItem],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 71], ["dexterity", 50], ["vitality", 100],
		["strength", 85], ["dexterity", 60], ["vitality", 110],
		["strength", 103], ["dexterity", 79], ["vitality", 125],
		["dexterity", 94], ["strength", 125], ["vitality", 130],
		["strength", 140], ["vitality", 135], ["strength", 150],
		["vitality", "all"],
	],
	skills: [
		// Total points at time of respec 33
		[sdk.skills.SwordMastery, 9, true],       // total left 24
		[sdk.skills.FindItem, 1, true],           // total left 22
		[sdk.skills.Taunt, 1, true],              // total left 21
		[sdk.skills.BattleOrders, 4, true],       // total left 16
		[sdk.skills.BattleCommand, 1, true],      // charlvl 15
		[sdk.skills.NaturalResistance, 1, true],  // total left 13
		[sdk.skills.Frenzy, 2, true],             // total left 7
		[sdk.skills.WarCry, 1, true],             // total left 5
		[sdk.skills.DoubleSwing, 5, true],        // total left 0
		// End of respec points, Start of Stepping build
		[sdk.skills.NaturalResistance, 2, false], // charlvl 31
		[sdk.skills.WarCry, 2, false],            // charlvl 32
		[sdk.skills.NaturalResistance, 3, false], // charlvl 33
		[sdk.skills.WarCry, 3, false],            // charlvl 34
		[sdk.skills.Taunt, 11, false],            // charlvl 45
		[sdk.skills.NaturalResistance, 4, false], // charlvl 46
		[sdk.skills.Frenzy, 6, false],            // charlvl 50
		[sdk.skills.WarCry, 5, false],            // charlvl 52
		[sdk.skills.Frenzy, 9, false],            // charlvl 53
		[sdk.skills.BattleOrders, 6, false],      // charlvl 54
		[sdk.skills.NaturalResistance, 5, false], // charlvl 56
		[sdk.skills.WarCry, 6, false],            // charlvl 59
		[sdk.skills.SwordMastery, 20, false],     // charlvl 67
		[sdk.skills.Taunt, 20, false],            // charlvl 76
	],

	active: function () {
		return me.charlvl > Config.respecOne && me.charlvl < Config.respecOneB && me.getSkill(sdk.skills.NaturalResistance, 0) && !me.getSkill(sdk.skills.Berserk, 0);
	},
};
