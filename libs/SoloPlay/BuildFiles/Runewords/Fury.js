const Fury = [
	"[name] == JahRune",
	"[name] == GulRune",
	"[name] == EthRune ## [maxquantity] == 1",
	"[name] == suwayyah && [quality] >= normal && [quality] <= superior # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 3 # [maxquantity] == 1",
	"[name] == suwayyah && [quality] == normal # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 0 # [maxquantity] == 1",
];
NTIP.arrayLooping(Fury);
// Cube to Gul and Keep cubing to Jah rune
if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Gul) < 2)) {
	if (!me.getItem(sdk.items.runes.Jah)) {
		Config.Recipes.push([Recipe.Rune, "Um Rune"]);
		Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
		Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
		Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}
	me.checkItem({name: sdk.locale.items.ChainofHonor}).have && Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
}
// Cube to Jah
if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Lo) < 2) && me.checkItem({name: sdk.locale.items.ChainofHonor}).have) {
	if (!me.getItem(sdk.items.runes.Jah)) {
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
	}
}

Config.Recipes.push([Recipe.Socket.Weapon, "suwayyah", Roll.NonEth]);
Config.Runewords.push([Runeword.Fury, "suwayyah"]);

Config.KeepRunewords.push("[type] == assassinclaw # [itemallskills] == 2 && [ias] == 40 && [itemdeadlystrike] == 33");
