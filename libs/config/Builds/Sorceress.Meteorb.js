/*
 *    @filename   	Sorceress.Meteorb.js
 *	  @author	  	theBGuy
 *    @desc      	Sorceress meteorb build
 */

js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, 56, 47, 56, 47, 64, 55];
			Config.LowManaSkill = [0, 0];
			Config.SkipImmune = ["fire and cold"];
		}
	},
};
