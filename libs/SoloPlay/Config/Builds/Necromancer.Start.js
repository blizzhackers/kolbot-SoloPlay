/**
*  @filename    necromancer.Start.js
*  @author      theBGuy, isid0re
*  @desc        Bonemancer build for before respecOne
*
*/
js_strict(true);

includeIfNotIncluded("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.TownHP = me.hardcore ? 0 : 35;
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 6;
			Config.MPBuffer = 6;
			Config.AttackSkill = [-1, 0, 0, 0, 0, -1, -1];
			Config.LowManaSkill = [0, 0];
			Config.Golem = "Clay";
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Teeth, -1, sdk.skills.Teeth, -1, -1, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 6;
		}
	},

	18:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Teeth, -1, sdk.skills.Teeth, -1, -1, -1];
			Config.ExplodeCorpses = sdk.skills.CorpseExplosion;

			if (me.getSkill(sdk.skills.BoneSpear, sdk.skills.subindex.HardPoints)) {
				Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
			}
		}
	},
};
