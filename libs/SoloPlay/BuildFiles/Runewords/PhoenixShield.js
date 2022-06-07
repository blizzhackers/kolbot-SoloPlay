const PhoenixRunes = [
	"[name] == VexRune",
	"[name] == LoRune",
	"[name] == JahRune",
	"[name] == monarch && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1"
];
NTIP.arrayLooping(PhoenixRunes);
// Cube to vex and Keep cubing to Jah rune
if (!me.getItem(sdk.items.runes.Jah)) {
	if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Vex) < 2)) {
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	}
	(Item.getQuantityOwned(me.getItem(sdk.items.runes.Vex) > 1) && !me.getItem(sdk.items.runes.Jah) && Config.Recipes.push([Recipe.Rune, "Vex Rune"]));
}
// Cube to Lo and Keep cubing to Jah rune
if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Lo) > 1) && me.checkItem({name: sdk.locale.items.HeartoftheOak}).have) {
	if (!me.getItem(sdk.items.runes.Jah)) {
		Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}
	!me.getItem(sdk.items.runes.Jah) && Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
}
// Cube to Jah rune
if (me.checkItem({name: sdk.locale.items.Enigma}).have && !me.getItem(sdk.items.runes.Jah)) {
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
}

if (!Check.haveBase("shield", 4)) {
	NTIP.addLine("[name] == monarch && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
}

Config.Recipes.push([Recipe.Socket.Shield, "monarch", Roll.NonEth]);
Config.Runewords.push([Runeword.Phoenix, "monarch"]);

Config.KeepRunewords.push("[type] == shield # [passivefirepierce] >= 28");
