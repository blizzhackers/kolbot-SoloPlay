/**
*  @filename    Sorceress.Stepping.js
*  @author      theBGuy
*  @desc        Blizzard build for after respecOne and before respecOneB - respecs at 65
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
			Config.AttackSkill = [-1, sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.Blizzard, sdk.skills.IceBlast, -1, -1];
			Config.BeltColumn = ["hp", "hp", "mp", "mp"];
			SetUp.belt();
			Config.HPBuffer = me.expansion && !me.normal ? 2 : 5;
			Config.MPBuffer = (me.expansion && !me.normal || Item. getEquippedItemmerc(sdk.body.RightArm).prefixnum === sdk.locale.items.Insight) ? 2 : 5;
			Config.SkipImmune = ["cold"];
		}
	},
};
