(function() {
	const BoTD = [
		"[name] == VexRune",
		"me.diff == 2 && [name] == HelRune # # [maxquantity] == 1",
		"[name] == ElRune # # [maxquantity] == 1",
		"[name] == EldRune # # [maxquantity] == 1",
		"[name] == ZodRune",
		"me.diff == 2 && [name] == EthRune # # [maxquantity] == 1",
		"[name] == colossusblade && [flag] == ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 6 # [maxquantity] == 1",
	];
	NTIP.buildList(BoTD);

	// Have Zod rune but do not have a base yet
	if (!Check.haveBase("colossusblade", 6) && me.getItem(sdk.items.runes.Zod)) {
		NTIP.addLine("[name] == colossusblade && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
	}

	Config.Recipes.push([Recipe.Socket.Weapon, "colossusblade", Roll.Eth]);
	Config.Runewords.push([Runeword.BreathoftheDying, "colossusblade"]);

	Config.KeepRunewords.push("[type] == sword # [ias] >= 60 && [enhanceddamage] >= 350");
})();
