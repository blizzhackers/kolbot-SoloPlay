const Enigma = [
	"[name] == JahRune",
	"[name] == IthRune # # [maxquantity] == 1",
	"[name] == BerRune",
];
NTIP.arrayLooping(Enigma);

// Cube to Jah rune
if (!me.getItem(sdk.items.runes.Jah)) {
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
}

// Cube to Ber rune
if (!me.getItem(sdk.items.runes.Ber)) {
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
	Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
}

// Have Ber and Jah runes before looking for normal base
if (me.getItem(sdk.items.runes.Ber) && me.getItem(sdk.items.runes.Jah)) {
	if (!Check.haveBase("armor", 3)) {
		NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && ([quality] == normal # ([sockets] == 3 || [sockets] == 0) || ([quality] == superior # [sockets] == 3)) # [maxquantity] == 1");
	} else {
		NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 3 # [maxquantity] == 1");
	}

	Config.Recipes.push([Recipe.Socket.Armor, "mageplate", Roll.NonEth]);
	Config.Recipes.push([Recipe.Socket.Armor, "duskshroud", Roll.NonEth]);
	Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", Roll.NonEth]);
	Config.Recipes.push([Recipe.Socket.Armor, "scarabhusk", Roll.NonEth]);
	
	Config.Runewords.push([Runeword.Enigma, "mageplate", Roll.NonEth]);
	Config.Runewords.push([Runeword.Enigma, "duskshroud", Roll.NonEth]);
	Config.Runewords.push([Runeword.Enigma, "wyrmhide", Roll.NonEth]);
	Config.Runewords.push([Runeword.Enigma, "scarabhusk", Roll.NonEth]);
}

Config.KeepRunewords.push("[type] == armor # [itemallskills] == 2");
