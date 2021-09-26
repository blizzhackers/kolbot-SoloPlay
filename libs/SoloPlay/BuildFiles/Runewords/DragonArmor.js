var DragonArmor = [
	"[name] == SurRune",
	"[name] == LoRune",
	"[name] == SolRune # # [maxquantity] == 1",
];
NTIP.arrayLooping(DragonArmor);

// Cube to Sur rune
if (!me.getItem(sdk.runes.Sur)) {
	Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
}

// Have Sur and Lo rune before attempting to make runeword
if (me.getItem(sdk.runes.Lo) && me.getItem(sdk.runes.Sur)) {
	Config.Runewords.push([Runeword.Dragon, "archonplate", Roll.NonEth]);
}

Config.KeepRunewords.push("[type] == armor # [holyfireaura] >= 14");
