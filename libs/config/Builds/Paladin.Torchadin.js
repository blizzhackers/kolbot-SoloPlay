/*
 *    @filename 	Paladin.Torchadin.js
 *	  @author	  	theBGuy
 *    @desc    		End game Torchadin build (Holy Fire) uses HoJ + Dragon
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.Vigor = false;
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Conviction, sdk.skills.Zeal, sdk.skills.Conviction, -1, -1];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["fire and physical"];
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
