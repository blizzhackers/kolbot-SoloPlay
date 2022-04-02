/*
 *    @filename   	Necromancer.Leveling.js
 *	  @author	  	theBGuy
 *    @desc      	Necromancer Explosionmancer leveling build
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
			Config.LowManaSkill = [-1, -1];
			Config.ExplodeCorpses = sdk.skills.CorpseExplosion; // Explode corpses.
			Config.Golem = "Clay"; // Golem.
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
		}
	},
};