const Chaos = [
	"[name] == FalRune # # [maxquantity] == 1",
	"[name] == OhmRune",
	"[name] == UmRune",
	"[name] == suwayyah && [quality] >= normal && [quality] <= superior # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 3 # [maxquantity] == 1",
	"[name] == suwayyah && [quality] == normal # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 0 # [maxquantity] == 1",
];
NTIP.arrayLooping(Chaos);
// Cube to Fal rune
if (!me.getItem(sdk.items.runes.Lem)) {
	Config.Recipes.push([Recipe.Rune, "Io Rune"]);
	Config.Recipes.push([Recipe.Rune, "Lum Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ko Rune"]);
}
// Cube to Ohm rune
if (!me.getItem(sdk.items.runes.Ohm)) {
	Config.Recipes.push([Recipe.Rune, "Um Rune"]);
	Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
	Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
	Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
	Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
}
Config.Recipes.push([Recipe.Socket.Weapon, "suwayyah", Roll.NonEth]);
Config.Runewords.push([Runeword.Chaos, "suwayyah"]);


Config.KeepRunewords.push("[type] == assassinclaw # [plusskillwhirlwind] == 1");
