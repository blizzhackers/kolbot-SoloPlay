/*
 *    @filename   	Druid.Plaguewolf.js
 *	  @author	  	theBGuy
 *    @desc      	Druid Fury/Rabies wolf build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [sdk.skills.FeralRage, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Fury, sdk.skills.Rabies, sdk.skills.Rabies, -1];
			Config.LowManaSkill = [0, 0];
			Config.Wereform = "Werewolf";
			Config.SummonAnimal = "Grizzly";
			Config.SummonSpirit = "Heart of Wolverine";
		}
	},
};
