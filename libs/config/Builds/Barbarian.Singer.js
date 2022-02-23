/*
 *    @filename   	Barbarian.Singer.js
 *	  @author	  	theBGuy
 *    @desc      	Barbarian Singer build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.BattleCry, sdk.skills.WarCry, -1, sdk.skills.WarCry, -1];
			Config.LowManaSkill = [0, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			SetUp.belt();
			Config.MPBuffer = 4;
			Config.HPBuffer = 2;
		}
	},
};
