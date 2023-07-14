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
  if (!me.getItem(sdk.items.runes.Jah) || !me.getItem(sdk.items.runes.Sur)) {
    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }

    Config.Recipes.push([Recipe.Rune, "Lo Rune"]);

    if (!me.getItem(sdk.items.runes.Jah)) {
      Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
    }
    
    Config.Runewords.push([Runeword.LastWish, "phaseblade"]);
    Config.KeepRunewords.push("[type] == sword # [mightaura] >= 17");
  }
})();
