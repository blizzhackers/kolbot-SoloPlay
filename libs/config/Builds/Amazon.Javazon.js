/*
 *    @filename   	Amazon.Javazon.js
 *	  @author	  	theBGuy
 *    @desc      	Amazon lightning build
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1,-1,-1,-1,-1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.ChargedStrike, -1, sdk.skills.LightningStrike, -1, -1, -1];
			Config.TownHP = me.playertype ? 0 : Config.TownCheck ? 35 : 0;
			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
			Config.HPBuffer = 2;
			Config.MPBuffer = 4;
		}
	},
};
