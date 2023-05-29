(function() {
  const FaithRunes = [
    "[name] == OhmRune",
    "[name] == JahRune",
    "[name] == EldRune # # [maxquantity] == 1",
    "[name] == LemRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(FaithRunes);
  // Cube to Ohm and Keep cubing to Jah rune
  if (Item.getQuantityOwned(me.getItem(sdk.items.runes.Ohm) > 1) && me.checkItem({ name: sdk.locale.items.CalltoArms }).have) {
    if (!me.getItem(sdk.items.runes.Jah)) {
      Config.Recipes.push([Recipe.Rune, "Mal Rune"]);
      Config.Recipes.push([Recipe.Rune, "Ist Rune"]);
      Config.Recipes.push([Recipe.Rune, "Gul Rune"]);
      Config.Recipes.push([Recipe.Rune, "Vex Rune"]);
    }
    !me.getItem(sdk.items.runes.Jah) && Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
  }
  // Cube to Jah rune
  if (!me.getItem(sdk.items.runes.Jah) && me.checkItem({ name: sdk.locale.items.ChainofHonor }).have) {
    Config.Recipes.push([Recipe.Rune, "Ohm Rune"]);
    Config.Recipes.push([Recipe.Rune, "Lo Rune"]);
    Config.Recipes.push([Recipe.Rune, "Sur Rune"]);
    Config.Recipes.push([Recipe.Rune, "Ber Rune"]);
  }

  if (me.amazon) {
    if (me.getItem(sdk.items.runes.Lo) && me.getItem(sdk.items.runes.Jah)) {
      if (!Check.haveBase("amazonbow", 4)) {
        NTIP.addLine("[name] == grandmatronbow && [quality] == normal # [bowandcrossbowskilltab] == 3 && [sockets] == 0 # [maxquantity] == 1");
      }

      NTIP.addLine("[name] == grandmatronbow && [quality] >= normal && [quality] <= superior # [bowandcrossbowskilltab] >= 1 && [sockets] == 4 # [maxquantity] == 1");
    } else {
      NTIP.addLine("[name] == grandmatronbow && [quality] == superior # [bowandcrossbowskilltab] == 3 && [enhanceddamage] >= 5 && [sockets] == 4 # [maxquantity] == 1");
    }

    Config.Runewords.push([Runeword.Faith, "grandmatronbow"]);

    Config.Recipes.push([Recipe.Socket.Bow, "grandmatronbow"]);

  } else {
    if (me.getItem(sdk.items.runes.Lo) && me.getItem(sdk.items.runes.Jah)) {
      if (!Check.haveBase("amazonbow", 4)) {
        NTIP.addLine("([name] == wardbow || [name] == bladebow || [name] == diamonbow) && [quality] == superior # [enhanceddamage] >= 5 && [sockets] == 4 # [maxquantity] == 1");
      } else {
        NTIP.addLine("([name] == wardbow || [name] == bladebow || [name] == diamonbow) && [quality] == superior # [enhanceddamage] == 15 && [sockets] == 4 # [maxquantity] == 1");
      }

      Config.Runewords.push([Runeword.Faith, "wardbow"]);
      Config.Runewords.push([Runeword.Faith, "bladebow"]);
      Config.Runewords.push([Runeword.Faith, "diamonbow"]);
    }
  }

  Config.KeepRunewords.push("([type] == bow || [type] == amazonbow) && [flag] == runeword # [fanaticismaura] >= 12 && [itemallskills] >= 1");
})();
