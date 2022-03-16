/*
 *    @filename   	Druid.Start.js
 *	  @author	  	theBGuy
 *    @desc      	Druid Fire start build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		//SkillPoints: [-1],			// This doesn't matter. We don't have skill points to spend at lvl 1
		//StatPoints: [-1,-1,-1,-1,-1],	// This doesn't matter. We don't have stat points to spend at lvl 1
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.SkipImmune = ["fire"];
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 4;
			Config.MPBuffer = 4;
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.SummonVine = 1; // 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
		}
	},

	4:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Firestorm, -1, sdk.skills.Firestorm, -1, 0, 0];
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
			Config.AttackSkill = [-1, sdk.skills.Firestorm, -1, sdk.skills.Firestorm, -1, 0, 0];
			Config.TownHP = me.hardcore ? 0 : 35;
		}
	},

	7:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Firestorm, -1, sdk.skills.Firestorm, -1, 0, 0];
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (me.getSkill(sdk.skills.Fissure, 0)) {
				Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, 0, 0];
			}
		}
	},

	13:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Fissure, sdk.skills.Firestorm, sdk.skills.Fissure, sdk.skills.Firestorm, 0, 0];
			Config.SummonVine = 2; // 0 = disabled, 1 / "Poison Creeper", 2 / "Carrion Vine", 3 / "Solar Creeper"
		}
	},
};
