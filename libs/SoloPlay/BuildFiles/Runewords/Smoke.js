if (!Check.haveItem("armor", "runeword", "Smoke") && !me.hell) {
	// Cube to Lum Rune
	if (!me.getItem(sdk.runes.Lum)) {
		Config.Recipes.push([Recipe.Rune, "Io Rune"]);
	}

	var smokeRunes = [
		"[name] == NefRune # # [maxquantity] == 1",
		"[name] == LumRune # # [maxquantity] == 1",
	];
	NTIP.arrayLooping(smokeRunes);
}

// Have Lum rune before looking for base
if (me.getItem(sdk.runes.Lum)) {
	NTIP.addLine("([name] == demonhidearmor || [name] == duskshroud || [name] == ghostarmor || [name] == lightplate || [name] == mageplate || [name] == serpentskinarmor || [name] == trellisedarmor || [name] == wyrmhide) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1");
}

Config.Runewords.push([Runeword.Smoke, "demonhidearmor"]);
Config.Runewords.push([Runeword.Smoke, "duskshroud"]);
Config.Runewords.push([Runeword.Smoke, "ghostarmor"]);
Config.Runewords.push([Runeword.Smoke, "lightplate"]);
Config.Runewords.push([Runeword.Smoke, "mageplate"]);
Config.Runewords.push([Runeword.Smoke, "serpentskinarmor"]);
Config.Runewords.push([Runeword.Smoke, "trellisedarmor"]);
Config.Runewords.push([Runeword.Smoke, "wyrmhide"]);

Config.KeepRunewords.push("[type] == armor # [fireresist] == 50");
