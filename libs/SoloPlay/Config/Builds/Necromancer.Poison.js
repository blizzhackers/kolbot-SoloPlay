/*
 *    @filename   	Necromancer.Poison.js
 *	  @author	  	theBGuy
 *    @desc      	Necromancer Poison Nova build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.LowManaSkill = [0, 0];
			Config.AttackSkill = [-1, sdk.skills.PoisonNova, -1, sdk.skills.PoisonNova, -1, sdk.skills.BoneSpear, -1];
			Config.Curse[0] = sdk.skills.LowerResist; // Boss curse.
			Config.Curse[1] = sdk.skills.LowerResist; // Other monsters curse.
			Config.ExplodeCorpses = sdk.skills.CorpseExplosion; // Explode corpses.
			Config.Golem = "Clay"; // Golem.
		}
	},
};
