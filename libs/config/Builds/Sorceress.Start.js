/*
 *    @filename   	sorceress.start.js
 *	  @author	  	theBGuy
 *    @desc       	sorceress Blova build for before respecOne - respecs at level 26
 */

js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.FireBolt, -1, sdk.skills.FireBolt, -1, 0, 0];
			Config.LowManaSkill = [0, 0];
			Config.BeltColumn = ["hp", "hp", "hp", "hp"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.HPBuffer = 2;
			Config.MPBuffer = 10;
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (!!me.getSkill(sdk.skills.IceBolt, 1)) {
				Config.AttackSkill = [-1, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.ChargedBolt, sdk.skills.IceBolt, sdk.skills.IceBolt, 0];
			} else {
				Config.AttackSkill = [-1, sdk.skills.ChargedBolt, (me.getSkill(sdk.skills.FireBolt, 1) ? sdk.skills.FireBolt : -1), sdk.skills.ChargedBolt, (me.getSkill(sdk.skills.FireBolt, 1) ? sdk.skills.FireBolt : -1), 0, 0];
			}
			Config.LowManaSkill = [0, 0];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.Nova, sdk.skills.ChargedBolt, sdk.skills.FrostNova, sdk.skills.IceBolt];
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			Config.DodgeHP = 50;
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			if (!!me.getSkill(sdk.skills.Blizzard, 0)) {
				Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Blizzard, sdk.skills.Nova, sdk.skills.Nova, sdk.skills.ChargedBolt];
			}
		}
	},
};
