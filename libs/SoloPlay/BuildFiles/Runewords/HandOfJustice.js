(function () {
  const HoJ = [
    "[name] == SurRune",
    "[name] == ChamRune",
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == LoRune",
    "[name] == phaseblade && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(HoJ);

  // Cube to Lo rune
  if (!me.getItem(sdk.items.runes.Lo)) {
    Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune"]);

    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    }
  }

  // Cube to Cham rune
  if (!me.getItem(sdk.items.runes.Cham)) {
    Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
    Config.Recipes.push([Recipe.Rune, "Jah Rune"]);
  }

  Config.Runewords.push([Runeword.HandofJustice, "phaseblade"]);
  Config.KeepRunewords.push("[type] == sword # [holyfireaura] >= 16");
})();
