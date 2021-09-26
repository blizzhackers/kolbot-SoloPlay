var Inf = [
	"[name] == BerRune",
	"[name] == MalRune",
	"[name] == IstRune",
	"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [Sockets] == 0 # [maxquantity] == 1",
	"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= Superior # [Sockets] == 4 # [maxquantity] == 1",
];
NTIP.arrayLooping(Inf);

// Cube to Ber rune
if (Item.getQuantityOwned(me.getItem(sdk.runes.Ber) < 2)) {
	if (Check.haveItem("sword", "runeword", "Call To Arms")) {
		Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
		Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
		Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}

	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
}

Config.Recipes.push([Recipe.Socket.Weapon, "Giant Thresher"]);
Config.Recipes.push([Recipe.Socket.Weapon, "Great Poleaxe"]);
Config.Recipes.push([Recipe.Socket.Weapon, "Cryptic Axe"]);
Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

Config.Runewords.push([Runeword.Infinity, "Giant Thresher"]);
Config.Runewords.push([Runeword.Infinity, "Great Poleaxe"]);
Config.Runewords.push([Runeword.Infinity, "Cryptic Axe"]);
Config.Runewords.push([Runeword.Infinity, "Thresher"]);
Config.KeepRunewords.push("[type] == polearm # [convictionaura] >= 13");
