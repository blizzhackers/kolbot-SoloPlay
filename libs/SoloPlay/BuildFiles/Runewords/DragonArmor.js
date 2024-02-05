(function () {
  const DragonArmor = [
    "[name] == SurRune",
    "[name] == LoRune",
    "[name] == SolRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(DragonArmor);

  // Cube to Sur rune
  if (!me.getItem(sdk.items.runes.Sur)) {
    Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
  }

  // Have Sur and Lo rune before attempting to make runeword
  if (me.getItem(sdk.items.runes.Lo) && me.getItem(sdk.items.runes.Sur)) {
    Config.Runewords.push([Runeword.Dragon, "archonplate", Roll.NonEth]);
  }

  Config.KeepRunewords.push("[type] == armor # [holyfireaura] >= 14");
})();
