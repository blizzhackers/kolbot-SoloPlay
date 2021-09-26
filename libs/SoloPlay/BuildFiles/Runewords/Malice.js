var Malice = [
	"[name] == IthRune # # [maxquantity] == 1",
	"[name] == ElRune # # [maxquantity] == 1",
	"[name] == EthRune # # [maxquantity] == 1",
	"[Type] == Sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 3 # [maxquantity] == 1",
];
NTIP.arrayLooping(Malice);

Config.Runewords.push([Runeword.Malice, "Crystal Sword"]);
Config.Runewords.push([Runeword.Malice, "Broad Sword"]);
Config.Runewords.push([Runeword.Malice, "Long Sword"]);
Config.Runewords.push([Runeword.Malice, "War Sword"]);
Config.Runewords.push([Runeword.Malice, "Giant Sword"]);
Config.Runewords.push([Runeword.Malice, "Flamberge"]);
Config.Runewords.push([Runeword.Malice, "Espandon"]);
Config.Runewords.push([Runeword.Malice, "Tusk Sword"]);
Config.Runewords.push([Runeword.Malice, "Zweihander"]);

Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 33 && [tohit] >= 50");
