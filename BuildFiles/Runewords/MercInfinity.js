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
  const needBer = function () {
    return !me.getOwned({ classid: sdk.items.runes.Ber }).length < 2;
  };
  if (needBer()) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || me.barbarian) {
      Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needBer }]);
      Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needBer }]);
    }

    Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needBer }]);
  }

  Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

  Config.Runewords.push([Runeword.Infinity, "giantthresher", Roll.All, 100]);
  Config.Runewords.push([Runeword.Infinity, "greatpoleaxe", Roll.All, 100]);
  Config.Runewords.push([Runeword.Infinity, "crypticaxe", Roll.All, 100]);
  Config.Runewords.push([Runeword.Infinity, "thresher", Roll.All, 100]);

  Config.KeepRunewords.push("[type] == polearm # [convictionaura] >= 12");
})();
