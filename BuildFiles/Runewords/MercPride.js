(function () {
  const Pride = [
    "[name] == ChamRune",
    "[name] == SurRune",
    "[name] == IoRune ## [maxquantity] == 1",
    "[name] == LoRune",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [flag] == ethereal && [quality] == normal # [Sockets] == 0 # [maxquantity] == 1",
    "([name] == thresher || [name] == crypticaxe || [name] == greatpoleaxe || [name] == giantthresher) && [quality] >= normal && [quality] <= Superior # [Sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(Pride);

  const needSur = function () {
    return !me.getItem(sdk.items.runes.Sur);
  };
  const needLo = function () {
    return !me.getItem(sdk.items.runes.Lo);
  };
  const needSurOrLo = function () {
    return needSur() || needLo();
  };
  // Cube to Sur/Lo rune
  if (needSur() || needLo()) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have || me.barbarian) {
      Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needSurOrLo }]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needSurOrLo }]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needSurOrLo }]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needSurOrLo }]);
      Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needSurOrLo }]);
    }
    
    Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needSur }]);
  }

  Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe"]);
  Config.Recipes.push([Recipe.Socket.Weapon, "thresher"]);

  Config.Runewords.push([Runeword.Pride, "giantthresher"]);
  Config.Runewords.push([Runeword.Pride, "greatpoleaxe"]);
  Config.Runewords.push([Runeword.Pride, "crypticaxe"]);
  Config.Runewords.push([Runeword.Pride, "thresher"]);

  Config.KeepRunewords.push("[type] == polearm # [concentrationaura] >= 16");
})();
