(function () {
  const Sanctuary = [
    "[name] == KoRune # # [maxquantity] == 2",
    "[name] == MalRune",
    "[name] == hyperion && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(Sanctuary);

  // Cube to Mal rune
  if (!me.getItem(sdk.items.runes.Mal)) {
    Config.Recipes.push([Recipe.Rune, "Um Rune"]);
  }

  // Cube to Ko rune
  if (!me.getItem(sdk.items.runes.Ko)) {
    Config.Recipes.push([Recipe.Rune, "Hel Rune"]);
    Config.Recipes.push([Recipe.Rune, "Io Rune"]);
    Config.Recipes.push([Recipe.Rune, "Lum Rune"]);
  }

  if (!me.getOwned({ classid: sdk.items.Hyperion, sockets: 3 }).length) {
    if (Storage.Stash.UsedSpacePercent() < 75) {
      NTIP.addLine("[name] == hyperion && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
      Config.Recipes.push([Recipe.Socket.Shield, "hyperion", Roll.NonEth]);
    }
  }

  Config.Runewords.push([Runeword.Sanctuary, "hyperion"]);

  Config.KeepRunewords.push("[type] == shield # [fhr] >= 20 && [enhanceddefense] >= 130 && [fireresist] >= 50");
})();
