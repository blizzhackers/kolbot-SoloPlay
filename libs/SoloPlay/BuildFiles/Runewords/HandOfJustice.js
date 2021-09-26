var HoJ = [
	"[name] == SurRune",
	"[name] == ChamRune",
	"[name] == AmnRune # # [maxquantity] == 1",
	"[name] == LoRune",
	"[name] == phaseblade && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
];
NTIP.arrayLooping(HoJ);

// Cube to Lo rune
if (!me.getItem(sdk.runes.Lo)) {
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Vex Rune"]);

	if (Check.haveItem("sword", "runeword", "Call To Arms")) {
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}
}

// Cube to Cham rune
if (!me.getItem(sdk.runes.Cham)) {
	Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
	Config.Recipes.push([Recipe.Rune, "Jah Rune"]);
}

Config.Runewords.push([Runeword.HandofJustice, "phaseblade"]);
Config.KeepRunewords.push("[type] == sword # [holyfireaura] >= 16");
