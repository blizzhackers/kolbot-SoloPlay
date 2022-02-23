/*
 *    @filename   	Barbarian.Uberconc.js
 *	  @author	  	theBGuy
 *    @desc      	Barbarian concentration build meant for doing ubers
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

// preattack, primary skill for bosses, backup immune skill for bosses, primary skill for others, backup others
// Config.AttackSkill = [0, 0, 0, 0, 0];

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Concentrate, sdk.skills.Berserk, sdk.skills.Concentrate, sdk.skills.Berserk];
			Config.LowManaSkill = [0, 0];
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
