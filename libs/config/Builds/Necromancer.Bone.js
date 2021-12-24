/*
 *    @filename   	Necromancer.Bone.js
 *	  @author	  	theBGuy
 *    @desc      	Necromancer Bone build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
			Config.LowManaSkill = [0, 0];
			Config.Curse[0] = sdk.skills.Decrepify; // Boss curse.
			Config.Curse[1] = sdk.skills.Amplify; // Other monsters curse.
			Config.ExplodeCorpses = sdk.skills.CorpseExplosion; // Explode corpses.
			Config.Golem = "Clay"; // Golem.
		}
	},
};
