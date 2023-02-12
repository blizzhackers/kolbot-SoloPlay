(function() {
	const Exile = [
		"[name] == VexRune",
		"[name] == OhmRune",
		"[name] == IstRune",
		"[name] == DolRune # # [maxquantity] == 1",
		"[name] == sacredtarge && [quality] >= normal && [quality] <= superior # [fireresist] >= 30 && [sockets] == 4 # [maxquantity] == 1",
	];
	NTIP.buildList(Exile);

	if (!Check.haveBase("sacredtarge", 4)) {
		NTIP.addLine("[name] == sacredtarge && [quality] == normal && [flag] == ethereal # [fireresist] >= 30 && [sockets] == 0 # [maxquantity] == 1");
	}

	Config.Recipes.push([Recipe.Socket.Shield, "sacredtarge"]);
	Config.Runewords.push([Runeword.Exile, "sacredtarge"]);
	Config.KeepRunewords.push("[type] == auricshields # [defianceaura] >= 13");
})();
