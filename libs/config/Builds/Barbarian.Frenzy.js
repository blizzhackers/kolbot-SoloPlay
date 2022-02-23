/*
 *    @filename   	Barbarian.Frenzy.js
 *	  @author	  	theBGuy
 *    @desc      	Barbarian frenzy build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

// preattack, primary skill for bosses, backup immune skill for bosses, primary skill for others, backup others
// Config.AttackSkill = [0, 0, 0, 0, 0];

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.WarCry, sdk.skills.Frenzy, -1, sdk.skills.Frenzy, -1];
			Config.LowManaSkill = me.getSkill(sdk.skills.DoubleSwing, 1) >= 9 ? [sdk.skills.DoubleSwing, 0] : [0, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			SetUp.belt();
			Config.MPBuffer = 2;
			Config.HPBuffer = 2;
		}
	},
};
