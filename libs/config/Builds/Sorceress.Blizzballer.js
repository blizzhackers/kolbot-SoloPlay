/*
 *    @filename   	Sorceress.Blizzballer.js
 *	  @author	  	theBGuy
 *    @desc      	Sorceress Blizzard + Fireball build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.Blizzard, sdk.skills.FireBall, sdk.skills.Meteor, sdk.skills.GlacialSpike];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["fire and cold"];
		}
	},
};
