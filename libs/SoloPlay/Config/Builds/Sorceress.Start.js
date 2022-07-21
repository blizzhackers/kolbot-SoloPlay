/**
*  @filename    Sorceress.Start.js
*  @author      isid0re, theBGuy
*  @desc        Blova build for before respecOne - respecs at level 26
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
			Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
			Config.FieldID.Enabled = !Misc.checkQuest(4, 0);
			Config.FieldID.UsedSpace = 0;

			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 10;
			Config.AttackSkill = [-1, sdk.skills.FireBolt, -1, sdk.skills.FireBolt, -1, 0, 0];
			Config.LowManaSkill = [0, 0];
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.ScanShrines.indexOf(sdk.shrines.Combat) === -1 && Config.ScanShrines.push(sdk.shrines.Combat);
			Config.FieldID.Enabled = !Misc.checkQuest(4, 0);
			Config.FieldID.UsedSpace = 0;

			Config.TownHP = me.hardcore ? 0 : 35;
			Config.LowManaSkill = [0, 0];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			if (!!me.getSkill(sdk.skills.IceBolt, sdk.skills.subindex.SoftPoints)) {
				Config.AttackSkill = [-1, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.IceBolt, 0];
			} else {
				Config.AttackSkill = [-1, sdk.skills.ChargedBolt, (me.getSkill(sdk.skills.FireBolt, sdk.skills.subindex.SoftPoints) ? sdk.skills.FireBolt : -1), sdk.skills.ChargedBolt, (me.getSkill(sdk.skills.FireBolt, sdk.skills.subindex.SoftPoints) ? sdk.skills.FireBolt : -1), 0, 0];
			}
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.FrostNova, sdk.skills.IceBolt];
			Config.DodgeHP = 50;
			Config.DodgeRange = me.getSkill(sdk.skills.Blizzard) ? 15 : 7;
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (!!me.getSkill(sdk.skills.Blizzard, sdk.skills.subindex.HardPoints)) {
				Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Nova, sdk.skills.ChargedBolt];
			}
		}
	},
};
