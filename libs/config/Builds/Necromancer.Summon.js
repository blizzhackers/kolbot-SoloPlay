/*
 *    @filename   	Necromancer.Summon.js
 *	  @author	  	theBGuy
 *    @desc      	Necromancer Summonmancer build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Teeth, 0, sdk.skills.Teeth, 0, -1, -1];
			Config.LowManaSkill = [0, 0];
			Config.ActiveSummon = true;
			Config.Skeletons = "max";
			Config.SkeletonMages = "max";
			Config.Revives = "max";
			Config.Golem = "Clay";
		}
	},
};
