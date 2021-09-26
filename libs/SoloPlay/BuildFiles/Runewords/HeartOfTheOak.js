var HotO = [
	"[name] == ThulRune # # [maxquantity] == 1",
	"[name] == PulRune",
	"[name] == KoRune # # [maxquantity] == 1",
	"[name] == VexRune",
];
NTIP.arrayLooping(HotO);

// Have Vex rune before looking for base
if (me.getItem(sdk.runes.Vex)) {
	NTIP.addLine("([name] == flail || [name] == knout) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");
}

// Cube to Vex rune
if (!me.getItem(sdk.runes.Vex)) {
	Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
	Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Um Rune"]);
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
}

Config.Runewords.push([Runeword.HeartoftheOak, "knout"]);
Config.Runewords.push([Runeword.HeartoftheOak, "flail"]);
Config.KeepRunewords.push("[type] == mace # [itemallskills] == 3");
