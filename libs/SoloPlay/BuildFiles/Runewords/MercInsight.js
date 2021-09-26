var Insight = [
	"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1",
	"!me.hell && ([name] == voulge || [name] == scythe || [name] == poleaxe || [name] == halberd || [name] == warscythe || [name] == bill || [name] == battlescythe || [name] == partizan || [name] == grimscythe) && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
	"([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
];
NTIP.arrayLooping(Insight);

if (!me.hell && Item.getEquippedItemMerc(4).prefixnum !== sdk.locale.items.Insight && !Check.haveBase("polearm", 4)) {
	NTIP.addLine("[name] == voulge && [flag] != ethereal && [quality] == normal && [Level] >= 26 && [Level] <= 40 # [sockets] == 0 # [maxquantity] == 1");
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
