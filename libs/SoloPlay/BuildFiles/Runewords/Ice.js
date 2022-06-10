const IceRunes = [
	"[name] == AmnRune # # [maxquantity] == 1",
	"[name] == ShaelRune # # [maxquantity] == 1",
	"[name] == JahRune",
	"[name] == LoRune",
];
NTIP.arrayLooping(IceRunes);

// Cube to Lo and Keep cubing to Jah rune
if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Lo) > 1) && me.checkItem({name: sdk.locale.items.ChainofHonor}).have) {
	if (!me.getItem(sdk.items.runes.Jah)) {
		Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
		Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
		Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}
	!me.getItem(sdk.items.runes.Jah) && Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
}
// Cube to Jah rune
if (!me.getItem(sdk.items.runes.Jah) && me.checkItem({name: sdk.locale.items.ChainofHonor}).have) {
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
}

if (me.amazon) {
	NTIP.addLine("([name] == matriarchalbow || [name] == grandmatronbow) && [quality] == superior # [bowandcrossbowskilltab] == 3 && [enhanceddamage] >= 10 && [sockets] == 4 # [maxquantity] == 1");

	Config.Runewords.push([Runeword.Ice, "matriarchalbow"]);
	Config.Runewords.push([Runeword.Ice, "grandmatronbow"]);

	Config.Recipes.push([Recipe.Socket.Bow, "matriarchalbow"]);
	Config.Recipes.push([Recipe.Socket.Bow, "grandmatronbow"]);

	if (!Check.haveBase("amazonbow", 4) && me.getItem(sdk.items.runes.Lo) && me.getItem(sdk.items.runes.Jah)) {
		NTIP.addLine("([name] == matriarchalbow || [name] == grandmatronbow) && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
	}

	Config.KeepRunewords.push("[type] == amazonbow # [enhanceddamage] >= 140 && [passivecoldpierce] >= 25");

} else {
	NTIP.addLine("[type] == demoncrossbow && [quality] == superior # [enhanceddamage] >= 10 && [sockets] == 4 # [maxquantity] == 1");

	Config.Runewords.push([Runeword.Ice, "demoncrossbow"]);

	Config.Recipes.push([Recipe.Socket.Crossbow, "demoncrossbow"]);

	if (!Check.haveBase("crossbow", 4) && me.getItem(sdk.items.runes.Lo) && me.getItem(sdk.items.runes.Jah)) {
		NTIP.addLine("[name] == demoncrossbow && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
	}

	Config.KeepRunewords.push("[type] == demoncrossbow # [enhanceddamage] >= 140 && [passivecoldpierce] >= 25");

}



