/**
*  @filename    barbarian.StartBuild.js
*  @author      theBGuy
*  @credits     aim2kill (big shout out for all the testing an ideas for this build)
*  @desc        Double swing build for before respecOne
*
*/

let build = {
	caster: false,
	skillstab: sdk.skills.tabs.BarbCombat,
	wantedskills: [sdk.skills.BattleOrders, sdk.skills.Frenzy, sdk.skills.DoubleSwing, sdk.skills.SwordMastery],
	usefulskills: [sdk.skills.NaturalResistance, sdk.skills.IronSkin, sdk.skills.IncreasedSpeed, sdk.skills.Shout],
	mercDiff: sdk.difficulty.Nightmare,
	mercAct: 2,
	mercAuraWanted: "Might",
	stats: [
		["strength", 35], ["dexterity", 27], ["vitality", 45],
		["strength", 48], ["dexterity", 30], ["vitality", 55],
		["strength", 55], ["dexterity", 39], ["vitality", 65],
		["strength", 60], ["dexterity", 40], ["vitality", 75],
		["strength", 71], ["dexterity", 49], ["vitality", "all"],
	],
	skills: [
		[sdk.skills.Bash, 1],               // charlevel 2
		[sdk.skills.Howl, 1],               // charlevel 3
		[sdk.skills.DoubleSwing, 6, false], // charlevel 9
		[sdk.skills.SwordMastery, 5],       // charlevel 13
		[sdk.skills.Taunt, 1],              // charlevel 14
		[sdk.skills.SwordMastery, 6],       // charlevel 15
		[sdk.skills.IronSkin, 1],           // charlevel 18
		[sdk.skills.BattleCry, 1],          // charlevel 18
		[sdk.skills.SwordMastery, 9],
		[sdk.skills.DoubleThrow, 1],
		[sdk.skills.Shout, 1],
		[sdk.skills.Taunt, 3, false],
		[sdk.skills.Frenzy, 1],
		[sdk.skills.BattleOrders, 4, false],
		[sdk.skills.Taunt, 20],
	],

	active: function () {
		return me.charlvl < Config.respecOne && !me.getSkill(sdk.skills.WarCry, 0);
	},
};
