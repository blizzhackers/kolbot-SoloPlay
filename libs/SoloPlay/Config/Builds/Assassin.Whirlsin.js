/*
 *    @filename   	Assassin.Whirlsin.js
 *	  @author	  	theBGuy
 *    @desc      	Assassin whirlwind end game build
 */


js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.UseTraps = true;
			Config.AttackSkill = [-1, sdk.skills.Whirlwind, -1, sdk.skills.Whirlwind, -1, -1, -1];
			Config.Traps = [sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry, sdk.skills.DeathSentry];
			Config.BossTraps = [-1, -1, -1, -1, -1];
		}
	},
};
