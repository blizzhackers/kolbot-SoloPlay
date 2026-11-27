(function () {
  const Sanctuary = [
    "[name] == KoRune # # [maxquantity] == 2",
    "[name] == MalRune",
    "[name] == hyperion && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(Sanctuary);

  // Cube to Mal rune
  const needMal = function () {
    return !me.getItem(sdk.items.runes.Mal);
  };
  if (needMal()) {
    Config.Recipes.push([Recipe.Rune, "Mal Rune", { condition: needMal }]);
  }

  // Cube to Ko rune
  const needKos = function () {
    return me.getOwned({ classid: sdk.items.runes.Ko }).length < 2;
  };
  if (needKos()) {
    Config.Recipes.push([Recipe.Rune, "Io Rune", { condition: needKos }]);
    Config.Recipes.push([Recipe.Rune, "Lum Rune", { condition: needKos }]);
    Config.Recipes.push([Recipe.Rune, "Ko Rune", { condition: needKos }]);
  }

  if (!me.getOwned({ classid: sdk.items.Hyperion, sockets: 3 }).length) {
    if (Storage.Stash.UsedSpacePercent() < 75) {
      NTIP.addLine("[name] == hyperion && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Socket.Shield, "hyperion", Roll.NonEth]);
    }
  }

  Config.Runewords.push([Runeword.Sanctuary, "hyperion", Roll.NonEth, 99]);

  Config.KeepRunewords.push("[type] == shield # [fhr] >= 20 && [enhanceddefense] >= 130 && [fireresist] >= 50");
})();
