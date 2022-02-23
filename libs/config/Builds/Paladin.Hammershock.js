/**
 *    @filename   paladin.Hammershock.js
 *	  @author	  theGuy
 *    @desc       End-game Hybrid hammerdin build (BlessedHammer/HolyShock)
 */


js_strict(true);

if (!isIncluded("SoloPlay/Functions/Globals.js")) { include("SoloPlay/Functions/Globals.js"); }
SetUp.include();

let AutoBuildTemplate = {
	1:	{
		Update: function () {
			Config.Vigor = false;
			Config.AttackSkill = [-1, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.BlessedHammer, sdk.skills.Concentration, sdk.skills.Zeal, sdk.skills.HolyShock];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["magic and lightning and physical"];	// Don't think this ever happens but should skip if it does

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			SetUp.belt();
		}
	},
};
