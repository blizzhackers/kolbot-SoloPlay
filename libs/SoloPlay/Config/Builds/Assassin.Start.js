/**
*  @filename    assassin.Start.js
*  @author      theBGuy
*  @desc        fire trap build for before respecOne
*
*/
js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 4;
			Config.MPBuffer = 2;
			Config.AttackSkill = [-1, 0, 0, 0, 0, 0, 0];
			Config.LowManaSkill = [0, 0];
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
			Config.AttackSkill = [-1, sdk.skills.FireBlast, -1, sdk.skills.FireBlast, -1, (me.getSkill(sdk.skills.PsychicHammer, sdk.skills.subindex.softpoints) ? sdk.skills.PsychicHammer : 0), 0];
			Config.UseBoS = true;
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.FireBlast, -1, sdk.skills.FireBlast, -1, (me.getSkill(sdk.skills.PsychicHammer, sdk.skills.subindex.softpoints) ? sdk.skills.PsychicHammer : 0), 0];
			Config.UseTraps = true;
			Config.Traps = [sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, -1, -1]; // Skill IDs for traps to be cast on all mosters except act bosses.
			Config.BossTraps = [sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire, sdk.skills.WakeofFire]; // Skill IDs for traps to be cast on act bosses.
		}
	},
};
