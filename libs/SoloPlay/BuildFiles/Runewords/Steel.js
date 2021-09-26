var Steel = [
	"[name] == TirRune # # [maxquantity] == 2",
	"[name] == ElRune # # [maxquantity] == 2",
];
NTIP.arrayLooping(Steel);

if (Item.getEquippedItem(5).tier < 500 && Item.getEquippedItem(5).tier > 395) {
	NTIP.addLine("[Type] == Sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 && [class] == elite # [sockets] == 2 # [maxquantity] == 1");
} else if (Item.getEquippedItem(5).tier < 500 && Item.getEquippedItem(5).tier > 278) {
	NTIP.addLine("[Type] == Sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 && [class] > normal # [sockets] == 2 # [maxquantity] == 1");
} else {
	NTIP.addLine("[Type] == Sword && [flag] != ethereal && [quality] == superior && [wsm] <= 10 && [strreq] <= 150 # [enhanceddamage] >= 10 && [sockets] == 2 # [maxquantity] == 1");
}

Config.Runewords.push([Runeword.Steel, "Short Sword"]);
Config.Runewords.push([Runeword.Steel, "Scimitar"]);
Config.Runewords.push([Runeword.Steel, "Sabre"]);
Config.Runewords.push([Runeword.Steel, "Crystal Sword"]);
Config.Runewords.push([Runeword.Steel, "Broad Sword"]);
Config.Runewords.push([Runeword.Steel, "Long Sword"]);
Config.Runewords.push([Runeword.Steel, "War Sword"]);
Config.Runewords.push([Runeword.Steel, "Giant Sword"]);
Config.Runewords.push([Runeword.Steel, "Flamberge"]);
Config.Runewords.push([Runeword.Steel, "Gladius"]);
Config.Runewords.push([Runeword.Steel, "Cutlass"]);
Config.Runewords.push([Runeword.Steel, "Shamshir"]);
Config.Runewords.push([Runeword.Steel, "Dimensional Blade"]);
Config.Runewords.push([Runeword.Steel, "Battle Sword"]);
Config.Runewords.push([Runeword.Steel, "Rune Sword"]);
Config.Runewords.push([Runeword.Steel, "Ancient Sword"]);
Config.Runewords.push([Runeword.Steel, "Espandon"]);
Config.Runewords.push([Runeword.Steel, "Tusk Sword"]);
Config.Runewords.push([Runeword.Steel, "Zweihander"]);
Config.Runewords.push([Runeword.Steel, "Falcata"]);
Config.Runewords.push([Runeword.Steel, "Ataghan"]);
Config.Runewords.push([Runeword.Steel, "Elegant Blade"]);
Config.Runewords.push([Runeword.Steel, "Phase Blade"]);
Config.Runewords.push([Runeword.Steel, "Conquest Sword"]);
Config.Runewords.push([Runeword.Steel, "Cryptic Sword"]);
Config.Runewords.push([Runeword.Steel, "Mythical Sword"]);

Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 20 && [ias] >= 25");
