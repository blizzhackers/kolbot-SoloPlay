/*
 *    @filename   	Sorceress.Blova.js
 *	  @author	  	theBGuy
 *    @desc      	Sorceress Blizzard + Nova build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Blizzard, sdk.skills.Nova, -1, sdk.skills.IceBlast];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["lightning and cold"];
			Config.HPBuffer = me.expansion ? 1 : 5;
			Config.MPBuffer = me.expansion ? 1 : 5;
		}
	},
};
