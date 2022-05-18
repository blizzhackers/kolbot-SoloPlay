/**
*  @filename    assassin.Leveling.js
*  @author      theBGuy
*  @desc        lightning trap build for after respecOne
*
*/
js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 256, 251, 256, 251, -1, -1];
			Config.LowManaSkill = [-1, -1];
			Config.UseTraps = true;
			Config.UseFade = true;
			Config.Traps = [271, 271, 271, 276, 276];
			Config.BossTraps = [271, 271, 271, 271, 271];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
			Config.DodgeHP = 75;
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 256, 251, 256, 251, -1, -1];
		}
	},
};
