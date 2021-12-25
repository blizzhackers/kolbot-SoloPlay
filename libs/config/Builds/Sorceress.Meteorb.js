/*
 *    @filename   	Sorceress.Meteorb.js
 *	  @author	  	theBGuy
 *    @desc      	Sorceress Meteor + Frozen Orb build
 */
 

js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Meteor, sdk.skills.FireBall, sdk.skills.Meteor, sdk.skills.FireBall, sdk.skills.FrozenOrb, sdk.skills.GlacialSpike];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["fire and cold"];
			Config.HPBuffer = me.expansion ? 1 : 5;
			Config.MPBuffer = me.expansion ? 1 : 5;
		}
	},
};
