(function () {
  // Jah/Mal/Jah/Sur/Jah/Ber
  const LW = [
    "[name] == JahRune",
    "[name] == MalRune",
    "[name] == SurRune",
    "[name] == BerRune",
    "[name] == phaseblade && [quality] >= normal && [quality] <= superior # [sockets] == 6 # [maxquantity] == 1",
  ];
  NTIP.buildList(LW);
  // Cube to Jah/Sur rune
  const needJah = function () {
    return !me.getItem(sdk.items.runes.Jah);
  };
  const needSur = function () {
    return !me.getItem(sdk.items.runes.Sur);
  };
  const needBer = function () {
    return !me.getItem(sdk.items.runes.Ber);
  };
  const needSurOrBer = function () {
    return needSur() || needBer();
  };
  const needSurBerOrJah = function () {
    return needJah() || needSur() || needBer();
  };
  if (!me.getItem(sdk.items.runes.Jah) || !me.getItem(sdk.items.runes.Sur)) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needSurBerOrJah }]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needSurBerOrJah }]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needSurBerOrJah }]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needSurBerOrJah }]);
      Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needSurBerOrJah }]);
    }

    Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needSurOrBer }]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needBer }]);

    if (!me.getItem(sdk.items.runes.Jah)) {
      Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needJah }]);
      Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needJah }]);
      Config.Recipes.push([Recipe.Rune, "Jah Rune", { condition: needJah }]);
    }
    
    Config.Runewords.push([Runeword.LastWish, "phaseblade"]);
    Config.KeepRunewords.push("[type] == sword # [mightaura] >= 17");
  }
})();
