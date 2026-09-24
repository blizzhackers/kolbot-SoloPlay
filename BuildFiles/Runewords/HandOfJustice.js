(function () {
  const HoJ = [
    "[name] == SurRune",
    "[name] == ChamRune",
    "[name] == AmnRune # # [maxquantity] == 1",
    "[name] == LoRune",
    "[name] == phaseblade && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(HoJ);

  let _haveHoJ = false;
  const haveHoJ = function () {
    if (_haveHoJ) {
      return true;
    }
    _haveHoJ = me.checkItem({ name: sdk.locale.items.HandofJustice }).have;
    return _haveHoJ;
  };

  // Cube to Lo rune
  const needLo = function () {
    if (haveHoJ()) {
      // If we have Hand of Justice, we do not need Lo rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Lo);
  };
  if (!me.getItem(sdk.items.runes.Lo)) {
    Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needLo }]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needLo }]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needLo }]);
    Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needLo }]);

    if (me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
      Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needLo }]);
    }
  }

  // Cube to Cham rune
  const needCham = function () {
    if (haveHoJ()) {
      // If we have Hand of Justice, we do not need Cham rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Cham);
  };
  if (!me.getItem(sdk.items.runes.Cham)) {
    Config.Recipes.push([Recipe.Rune, "Jah Rune", { condition: needCham }]);
    Config.Recipes.push([Recipe.Rune, "Cham Rune", { condition: needCham }]);
  }

  Config.Runewords.push([Runeword.HandofJustice, "phaseblade", Roll.NonEth, 99]);
  Config.KeepRunewords.push("[type] == sword # [holyfireaura] >= 16");
})();
