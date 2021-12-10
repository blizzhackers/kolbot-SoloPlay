//	/d2bs/kolbot/libs/config/Builds/Paladin.Classicauradin.js

js_strict(true);

if (!isIncluded("common/Cubing.js")) {
	include("common/Cubing.js");
}

if (!isIncluded("common/Prototypes.js")) {
	include("common/Prototypes.js");
}

if (!isIncluded("common/Runewords.js")) {
	include("common/Runewords.js");
}

if (!isIncluded("common/Town.js")) {
	include("common/Town.js");
}

let AutoBuildTemplate = {

	1:	{
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
			Config.LowManaSkill = [-1, -1];
			Config.SkipImmune = ["lightning and cold and physical"];	// Don't think this ever happens but should skip if it does
			

			Config.BeltColumn = ["hp", "hp", "mp", "rv"];
			Config.MinColumn[0] = Config.BeltColumn[0] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[1] = Config.BeltColumn[1] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[2] = Config.BeltColumn[2] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;
			Config.MinColumn[3] = Config.BeltColumn[3] !== "rv" ? Math.max(1, Storage.BeltSize() - 1) : 0;

			Config.Vigor = false;
		}
	},

	2:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	3:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	4:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	5:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	6:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	7:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	8:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	9:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	10:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	11:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	12:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	13:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	14:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	15:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	16:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	17:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	18:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	19:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	20:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	21:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	22:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	23:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	24:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	25:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	26:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	27:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	28:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	29:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	30:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	31:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	32:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	33:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	34:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	35:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	36:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	37:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	38:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	39:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	40:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	41:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	42:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	43:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	44:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	45:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	46:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	47:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	48:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	49:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	50:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	51:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	52:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	53:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	54:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	55:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	56:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	57:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	58:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	59:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	60:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	61:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	62:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	63:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	64:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];
		}
	},

	65:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	66:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	67:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	68:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	69:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	70:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	71:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	72:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	73:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	74:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	75:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	76:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	77:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	78:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	79:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	80:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	81:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	82:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	83:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	84:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	85:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	86:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	87:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	88:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	89:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	90:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	91:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	92:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	93:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	94:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	95:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	96:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	97:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	98:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	},

	99:	{
		SkillPoints: [-1],
		StatPoints: [-1, -1, -1, -1, -1],
		Update: function () {
			Config.AttackSkill = [-1, sdk.skills.Zeal, sdk.skills.HolyShock, sdk.skills.Zeal, sdk.skills.Shock, sdk.skills.Zeal, sdk.skills.HolyFreeze];

		}
	}
};
