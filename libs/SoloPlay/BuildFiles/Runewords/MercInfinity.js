(function () {
  const Inf = [
    "[name] == BerRune",
    "[name] == MalRune",
    "[name] == IstRune",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [Sockets] == 0 # [maxquantity] == 1",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= Superior # [Sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(Inf);

  // Cube to Ber rune
  if (me.findItems(sdk.items.runes.Ber).length < 2) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || me.barbarian) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }

    Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
    Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
  }

  Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

  Config.Runewords.push([Runeword.Infinity, "giantthresher"]);
  Config.Runewords.push([Runeword.Infinity, "greatpoleaxe"]);
  Config.Runewords.push([Runeword.Infinity, "crypticaxe"]);
  Config.Runewords.push([Runeword.Infinity, "thresher"]);

  Config.KeepRunewords.push("[type] == polearm # [convictionaura] >= 12");
})();
