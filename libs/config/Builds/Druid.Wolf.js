/*
 *    @filename   	Druid.Wolf.js
 *	  @author	  	theBGuy
 *    @desc      	Druid Fury wolf build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Fury, sdk.skills.FeralRage, sdk.skills.Fury, sdk.skills.FeralRage, sdk.skills.Rabies, -1];
			Config.LowManaSkill = [0, 0];
			Config.Wereform = "Werewolf";
			Config.SummonAnimal = "Grizzly";
			Config.SummonSpirit = "Heart of Wolverine";
		}
	},
};
