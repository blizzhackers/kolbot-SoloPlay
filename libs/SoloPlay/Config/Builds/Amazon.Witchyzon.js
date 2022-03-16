/*
 *    @filename   	Amazon.Witchyzon.js
 *	  @author	  	theBGuy
 *    @desc      	Amazon witchwild bowazon build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Strafe, -1, sdk.skills.Strafe, -1, sdk.skills.MagicArrow, -1];
			Config.LowManaSkill = [0, -1];
		}
	},
};
