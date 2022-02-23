/*
 *    @filename   	Barbarian.Immortalwhirl.js
 *	  @author	  	theBGuy
 *    @desc      	Barbarian Immortal king set whirlwind build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.BattleCry, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1];
			Config.LowManaSkill = [0, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			SetUp.belt();
			Config.MPBuffer = 2;
			Config.HPBuffer = 2;
		}
	},
};
