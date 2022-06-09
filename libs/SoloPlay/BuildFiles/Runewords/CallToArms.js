let CTA = [
	"[name] == AmnRune # # [maxquantity] == 1",
	"[name] == RalRune # # [maxquantity] == 1",
	"[name] == MalRune",
	"[name] == IstRune",
	"[name] == OhmRune",
];
NTIP.arrayLooping(CTA);

// Have Ohm before collecting base
if (me.getItem(sdk.items.runes.Ohm)) {
	NTIP.addLine("[name] == crystalsword && [quality] >= normal && [quality] <= superior # [sockets] == 5 # [maxquantity] == 1");

	// Have Ohm+Mal+Ist rune but do not have a base yet
	if (me.getItem(sdk.items.runes.Ist) && me.getItem(sdk.items.runes.Mal) && !Check.haveBase("crystalsword", 5)) {
		NTIP.addLine("[name] == crystalsword && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
		Config.Recipes.push([Recipe.Socket.Weapon, "crystalsword"]);
	}
}

// Cube to Mal rune
if (!me.getItem(sdk.items.runes.Mal)) {
	Config.Recipes.push([Recipe.Rune, "Um Rune"]);
}

// Cube to Ohm Rune
if (!me.getItem(sdk.items.runes.Ohm)) {
	Config.Recipes.push([Recipe.Rune, "Lem Rune"]);
	Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Um Rune"]);
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);

	if (me.checkItem({name: sdk.locale.items.HeartoftheOak}).have || ["Zealer", "Smiter", "Auradin", "Meteorb", "Blizzballer", "Cold"].indexOf(SetUp.finalBuild) > -1) {
		Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
	}
}

Config.Runewords.push([Runeword.CallToArms, "crystalsword"]);
Config.KeepRunewords.push("[type] == sword # [plusskillbattleorders] >= 1");
