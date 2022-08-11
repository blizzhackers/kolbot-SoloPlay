const Grief = [
	"[name] == EthRune # # [maxquantity] == 1",
	"[name] == TirRune # # [maxquantity] == 1",
	"[name] == LoRune # # [maxquantity] == 1",
	"[name] == MalRune # # [maxquantity] == 1",
	"[name] == RalRune # # [maxquantity] == 1",
];
NTIP.arrayLooping(Grief);

if (me.getItem(sdk.items.runes.Lo)) {
	NTIP.addLine("[name] == phaseblade && [quality] >= normal && [quality] <= superior # [sockets] == 5 # [maxquantity] == 1");

	if (!Check.haveBase("phaseblade", 5)) {
		NTIP.addLine("[name] == phaseblade && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
		Config.Recipes.push([Recipe.Socket.Weapon, "phaseblade"]);
	}
} else {
	NTIP.addLine("[name] == phaseblade && [quality] == superior # [enhanceddamage] >= 10 && [sockets] == 5 # [maxquantity] == 1");
}

// Cube to Lo Rune
if (!me.getItem(sdk.items.runes.Lo)) {
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Vex Rune"]);

	if (me.checkItem({name: sdk.locale.items.CalltoArms}).have || ["Smiter", "Zealer"].indexOf(SetUp.finalBuild) === -1) {
		Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
	}
}

// Cube to Mal Rune
if (!me.getItem(sdk.items.runes.Mal)) {
	Config.Recipes.push([Recipe.Rune, "Pul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Um Rune"]);
}

if (SetUp.finalBuild === "Plaguewolf") {
	// Only start making Grief after Chains of Honor is made
	if (Check.haveItem("armor", "runeword", "Chains of Honor")) {
		Config.Runewords.push([Runeword.Grief, "phaseblade"]);
		Config.KeepRunewords.push("[type] == sword # [ias] >= 30");
	}
} else {
	Config.Runewords.push([Runeword.Grief, "phaseblade"]);
	Config.KeepRunewords.push("[type] == sword # [ias] >= 30 && [itemdeadlystrike] == 20 && [passivepoispierce] >= 20");
}
