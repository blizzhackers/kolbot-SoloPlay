(function () {
	let low = [
		sdk.items.Voulge, sdk.items.Scythe, sdk.items.Poleaxe,
		sdk.items.Halberd, sdk.items.WarScythe
	].map(el => "[name] == " + el).join(" || ");

	let mid = [
		sdk.items.Bill, sdk.items.BattleScythe,
		sdk.items.Partizan, sdk.items.GrimScythe
	].map(el => "[name] == " + el).join(" || ");

	let high = [
		sdk.items.Thresher, sdk.items.CrypticAxe,
		sdk.items.GreatPoleaxe, sdk.items.GiantThresher
	].map(el => "[name] == " + el).join(" || ");
	
	const Insight = [
		(high + " && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1"),
		(high + " && [quality] >= normal && [quality] <= superior && [flag] != runeword # [sockets] == 4 # [maxquantity] == 1"),
		mid + " && [quality] >= normal && [quality] <= superior && [flag] != runeword # [sockets] == 4 # [maxquantity] == 1",
	];

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
	
	if (!me.hell) {
		Insight.push(low + " && [quality] >= normal && [quality] <= superior && [flag] != runeword # [sockets] == 4 # [maxquantity] == 1");
		Config.Runewords.push([Runeword.Insight, "Warscythe"]);
		Config.Runewords.push([Runeword.Insight, "halberd"]);
		Config.Runewords.push([Runeword.Insight, "poleaxe"]);
		Config.Runewords.push([Runeword.Insight, "scythe"]);
		Config.Runewords.push([Runeword.Insight, "voulge"]);
	}
	
	NTIP.buildList(Insight);

	if (!me.hell && Item.getMercEquipped(sdk.body.RightArm).prefixnum !== sdk.locale.items.Insight && !Check.haveBase("polearm", 4)) {
		NTIP.addLine("[name] == voulge && [flag] != ethereal && [quality] == normal && [level] >= 26 && [level] <= 40 # [sockets] == 0 # [maxquantity] == 1");
	}

	Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
})();
