/**
*  @filename    druid.Start.js
*  @author      theBGuy
*  @desc        Fire elemental build for before respecOne
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
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.SkipImmune = ["fire"];
			Config.BeltColumn = me.charlvl < 7 ? ["hp", "hp", "hp", "mp"] : ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 4;
			Config.MPBuffer = 4;
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.SummonVine = 1; // "Poison Creeper"
			if (Skill.canUse(sdk.skills.Firestorm)) {
				Config.AttackSkill = [-1, sdk.skills.Firestorm, -1, sdk.skills.Firestorm, -1, 0, 0];
			} else {
				Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			}
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (Skill.canUse(sdk.skills.Fissure)) {
				Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, 0, 0];
			}
		}
	},

	13:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, 0, 0];
			Config.SummonVine = 2; // "Carrion Vine"
		}
	},
};
