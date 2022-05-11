/*
 *    @filename   	Paladin.Sancdreamer.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin end game Sancdreamer build
 */


js_strict(true);

!isIncluded("SoloPlay/Functions/Globals.js") && include("SoloPlay/Functions/Globals.js");
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.Vigor = false;
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.Sanctuary, sdk.skills.Zeal, sdk.skills.Sanctuary, -1, -1];
			Config.LowManaSkill = [-1, -1];

			Config.SkipImmune = ["lightning and magic and physical"];	// Don't think this ever happens but should skip if it does

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
