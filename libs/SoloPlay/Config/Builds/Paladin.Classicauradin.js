/*
 *    @filename   	Paladin.Classicauradin.js
 *	  @author	  	theBGuy
 *    @desc      	Paladin Classic Auradin build (Holy Shock/Freeze)
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		Update: function () {
			Config.Vigor = false;
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["lightning and cold and physical"];	// Don't think this ever happens but should skip if it does

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
