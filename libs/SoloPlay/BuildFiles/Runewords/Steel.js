var Steel = [
	"[name] == TirRune # # [maxquantity] == 2",
	"[name] == ElRune # # [maxquantity] == 2",
];
NTIP.arrayLooping(Steel);

if (Item.getEquippedItem(5).tier < 500 && Item.getEquippedItem(5).tier > 395) {
	NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 && [class] == elite # [sockets] == 2 # [maxquantity] == 1");
} else if (Item.getEquippedItem(5).tier < 500 && Item.getEquippedItem(5).tier > 278) {
	NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 && [class] > normal # [sockets] == 2 # [maxquantity] == 1");
} else {
	NTIP.addLine("[type] == sword && [flag] != ethereal && [quality] == superior && [wsm] <= 10 && [strreq] <= 150 # [enhanceddamage] >= 10 && [sockets] == 2 # [maxquantity] == 1");
}

Config.Runewords.push([Runeword.Steel, "shortsword"]);
Config.Runewords.push([Runeword.Steel, "scimitar"]);
Config.Runewords.push([Runeword.Steel, "sabre"]);
Config.Runewords.push([Runeword.Steel, "crystalsword"]);
Config.Runewords.push([Runeword.Steel, "broadsword"]);
Config.Runewords.push([Runeword.Steel, "longsword"]);
Config.Runewords.push([Runeword.Steel, "warsword"]);
Config.Runewords.push([Runeword.Steel, "giantsword"]);
Config.Runewords.push([Runeword.Steel, "flamberge"]);
Config.Runewords.push([Runeword.Steel, "gladius"]);
Config.Runewords.push([Runeword.Steel, "cutlass"]);
Config.Runewords.push([Runeword.Steel, "shamshir"]);
Config.Runewords.push([Runeword.Steel, "dimensionalblade"]);
Config.Runewords.push([Runeword.Steel, "battlesword"]);
Config.Runewords.push([Runeword.Steel, "runesword"]);
Config.Runewords.push([Runeword.Steel, "ancientsword"]);
Config.Runewords.push([Runeword.Steel, "espandon"]);
Config.Runewords.push([Runeword.Steel, "tusksword"]);
Config.Runewords.push([Runeword.Steel, "zweihander"]);
Config.Runewords.push([Runeword.Steel, "falcata"]);
Config.Runewords.push([Runeword.Steel, "ataghan"]);
Config.Runewords.push([Runeword.Steel, "elegantblade"]);
Config.Runewords.push([Runeword.Steel, "phaseblade"]);
Config.Runewords.push([Runeword.Steel, "conquestsword"]);
Config.Runewords.push([Runeword.Steel, "crypticsword"]);
Config.Runewords.push([Runeword.Steel, "mythicalsword"]);

Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 20 && [ias] >= 25");
