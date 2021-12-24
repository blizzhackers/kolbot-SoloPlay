/*
 *    @filename   	Druid.Elemental.js
 *	  @author	  	theBGuy
 *    @desc      	Druid Fire build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.ArticBlast, -1];
			Config.LowManaSkill = [0, 0];
			Config.SummonAnimal = "Grizzly";
			Config.SummonSpirit = "Oak Sage";
		}
	},
};
