/**
*  @filename    barbarian.LevelingBuild.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Frenzy/War Cry build for after respecOneB
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
		["dexterity", 136], ["strength", 150], ["vitality", 125],
		["strength", 185], ["vitality", "all"],
	],
	skills: [
		// Total points at time of respec 79
		[sdk.skills.SwordMastery, 11, true],     // total left 68
		[sdk.skills.FindItem, 1, true],          // total left 66
		[sdk.skills.DoubleSwing, 9, true],       // total left 56
		[sdk.skills.NaturalResistance, 5, true], // total left 51
		[sdk.skills.Frenzy, 9, true],            // total left 42
		[sdk.skills.Berserk, 5, true],           // total left 35
		[sdk.skills.WarCry, 5, true],            // total left 25
		[sdk.skills.BattleCommand, 1, true],     // total left 24
		[sdk.skills.BattleOrders, 8, true],      // total left 16
		[sdk.skills.Taunt, 16, true],            // total left 0
		// End of respec points, Start of Leveling build - total points left to use 31
		[sdk.skills.Taunt, 20, false],           // charlvl 75 -> total left 27
		[sdk.skills.BattleOrders, 10, false],    // charlvl 77 -> total left 25
		[sdk.skills.SwordMastery, 20, false],    // charlvl 84 -> total left 18
		[sdk.skills.Frenzy, 20, false], 		 // total left 7
		[sdk.skills.BattleOrders, 15, false],    // total left 0
	],

	active: function () {
		return (me.charlvl > Config.respecOne && me.charlvl > Config.respecOneB && me.getSkill(sdk.skills.WarCry, 0) >= 5 && !Check.finalBuild().active());
	},
};
