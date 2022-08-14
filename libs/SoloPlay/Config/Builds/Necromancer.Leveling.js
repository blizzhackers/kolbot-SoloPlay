/**
*  @filename    necromancer.Leveling.js
*  @author      theBGuy
*  @desc        explosionmancer build for after respecOne
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
			Config.AttackSkill = [-1, sdk.skills.BoneSpear, -1, sdk.skills.BoneSpear, -1, -1, -1];
			Config.LowManaSkill = [sdk.skills.Teeth, -1];
			Config.ExplodeCorpses = sdk.skills.CorpseExplosion;
			Config.Golem = "Clay";
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion ? 2 : 4;
			Config.MPBuffer = me.expansion && me.charlvl < 80 ? 6 : me.classic ? 5 : 2;
		}
	},
};
