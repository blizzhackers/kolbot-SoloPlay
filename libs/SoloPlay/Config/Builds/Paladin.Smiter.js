/*
 *    @filename   	Paladin.Smiter.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin Smiter build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Smite, sdk.skills.Fanaticism, sdk.skills.Smite, sdk.skills.Fanaticism, sdk.skills.BlessedHammer, sdk.skills.Concentration];
			Config.LowManaSkill = [0, sdk.skills.Fanaticism];
		}
	},
};
