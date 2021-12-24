/*
 *    @filename   	Druid.Wind.js
 *	  @author	  	theBGuy
 *    @desc      	Druid Wind build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Tornado, -1, sdk.skills.Tornado, -1, sdk.skills.ArticBlast, -1];
			Config.LowManaSkill = [-1, -1];
			Config.SummonAnimal = "Grizzly";
			Config.SummonSpirit = "Oak Sage";
		}
	},
};
