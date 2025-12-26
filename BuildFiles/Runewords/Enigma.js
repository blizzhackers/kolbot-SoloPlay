/**
 * Runeword configuration for Enigma
 * IIFE for scope
 */
(function () {
  const Enigma = [
    "[name] == JahRune",
    "[name] == IthRune # # [maxquantity] == 1",
    "[name] == BerRune",
  ];
  NTIP.buildList(Enigma);

  let _haveEnigma = false;
  const haveEnigma = function () {
    if (_haveEnigma) {
      return true;
    }
    _haveEnigma = me.checkItem({ name: sdk.locale.items.Enigma }).have;
    return _haveEnigma;
  };
  
  // Cube to Jah rune
  const needJah = function () {
    if (haveEnigma()) {
      // If we have Enigma, we do not need Jah rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Jah);
  };
  if (!me.getItem(sdk.items.runes.Jah)) {
    Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needJah }]);
    Config.Recipes.push([Recipe.Rune, "Jah Rune", { condition: needJah }]);
  }

  // Cube to Ber rune
  const needBer = function () {
    if (haveEnigma()) {
      // If we have Enigma, we do not need Ber rune
      return false;
    }
    return !me.getItem(sdk.items.runes.Ber);
  };
  if (!me.getItem(sdk.items.runes.Ber)) {
    Config.Recipes.push([Recipe.Rune, "Ist Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Gul Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Vex Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Ohm Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Lo Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Sur Rune", { condition: needBer }]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune", { condition: needBer }]);
  }

  // Have Ber and Jah runes before looking for normal base
  if (me.getItem(sdk.items.runes.Ber) && me.getItem(sdk.items.runes.Jah)) {
    Config.Runewords.push([Runeword.Enigma, "mageplate", Roll.NonEth, 100]);
    Config.Runewords.push([Runeword.Enigma, "duskshroud", Roll.NonEth, 100]);
    Config.Runewords.push([Runeword.Enigma, "wyrmhide", Roll.NonEth, 100]);
    Config.Runewords.push([Runeword.Enigma, "scarabhusk", Roll.NonEth, 100]);

    NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1");
  } else {
    NTIP.addLine("([name] == mageplate || [name] == scarabhusk || [name] == wyrmhide || [name] == duskshroud) && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 10 && [sockets] == 3 # [maxquantity] == 1");
  }

  Config.KeepRunewords.push("[type] == armor # [itemallskills] == 2");
})();
