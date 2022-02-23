/*
 *    @filename   	Paladin.Zealer.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin Zealer build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Fanaticism, sdk.skills.Zeal, sdk.skills.Fanaticism, -1, -1];
			Config.LowManaSkill = [-1, -1];

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
