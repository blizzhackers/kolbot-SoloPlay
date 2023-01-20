(function() {
	let highTier = "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher)";
	let lowTier = "([name] == voulge || [name] == scythe || [name] == poleaxe || [name] == halberd || [name] == warscythe || [name] == bill || [name] == battlescythe || [name] == partizan || [name] == grimscythe)";
	const Insight = [
		(highTier + " && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1"),
		"!me.hell && " + lowTier + " && [quality] >= normal && [quality] <= superior && [flag] != runeword # [sockets] == 4 # [maxquantity] == 1",
		(highTier + " && [quality] >= normal && [quality] <= superior && [flag] != runeword # [sockets] == 4 # [maxquantity] == 1"),
	];
	NTIP.arrayLooping(Insight);

	if (!me.hell && Item.getEquippedItemMerc(sdk.body.RightArm).prefixnum !== sdk.locale.items.Insight && !Check.haveBase("polearm", 4)) {
		NTIP.addLine("[name] == voulge && [flag] != ethereal && [quality] == normal && [level] >= 26 && [level] <= 40 # [sockets] == 0 # [maxquantity] == 1");
	}

	Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
	Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
	Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
	Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

	Config.Runewords.push([Runeword.Insight, "giantthresher"]);
	Config.Runewords.push([Runeword.Insight, "greatpoleaxe"]);
	Config.Runewords.push([Runeword.Insight, "crypticaxe"]);
	Config.Runewords.push([Runeword.Insight, "thresher"]);
	Config.Runewords.push([Runeword.Insight, "grimscythe"]);
	Config.Runewords.push([Runeword.Insight, "partizan"]);
	Config.Runewords.push([Runeword.Insight, "battlescythe"]);
	Config.Runewords.push([Runeword.Insight, "bill"]);
	Config.Runewords.push([Runeword.Insight, "Warscythe"]);
	Config.Runewords.push([Runeword.Insight, "halberd"]);
	Config.Runewords.push([Runeword.Insight, "poleaxe"]);
	Config.Runewords.push([Runeword.Insight, "scythe"]);
	Config.Runewords.push([Runeword.Insight, "voulge"]);

	Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
})();
