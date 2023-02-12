(function() {
	const DreamShield = [
		"[name] == IoRune # # [maxquantity] == 1",
		"[name] == JahRune",
		"[name] == PulRune",
		"[name] == sacredtarge && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [fireresist] >= 45 && [sockets] == 3 # [maxquantity] == 1",
	];
	NTIP.buildList(DreamShield);

	if (!Check.haveBase("sacredtarge", 3)) {
		NTIP.addLine("[name] == sacredtarge && [flag] != ethereal && [quality] == normal # [fireresist] >= 45 && [sockets] == 0 # [maxquantity] == 1");
	}

	Config.Recipes.push([Recipe.Socket.Shield, "sacredtarge", Roll.NonEth]);
	Config.Runewords.push([Runeword.Dream, "sacredtarge"]);
	Config.KeepRunewords.push("[type] == auricshields # [holyshockaura] >= 15");
})();
