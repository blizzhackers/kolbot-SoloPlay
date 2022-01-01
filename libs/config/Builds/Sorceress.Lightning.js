/*
 *    @filename   	Sorceress.Lightning.js
 *	  @author	  	theBGuy
 *    @desc      	Sorceress Pure light build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Lightning, sdk.skills.ChainLightning, sdk.skills.ChainLightning, sdk.skills.Lightning, -1, -1];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["lightning"];
		}
	},
};
