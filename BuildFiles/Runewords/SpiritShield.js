(function () {
  const SpiritRunes = [
    "[name] == TalRune # # [maxquantity] == 1",
    "[name] == ThulRune # # [maxquantity] == 1",
    "[name] == OrtRune # # [maxquantity] == 1",
    "[name] == AmnRune # # [maxquantity] == 1",
  ];
  NTIP.buildList(SpiritRunes);

  /** @type {GetOwnedSettings} */
  const wanted = {
    classid: sdk.items.Monarch,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  if (me.paladin) {
    NTIP.addLine("([name] == targe || [name] == rondache || [name] == heraldicshield || [name] == aerinshield || [name] == akarantarge || [name] == akaranrondache || [name] == gildedshield ||[name] == protectorshield || [name] == sacredtarge) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [fireresist] > 0 && [sockets] == 4");
    NTIP.addLine("([name] == targe || [name] == rondache || [name] == heraldicshield || [name] == aerinshield || [name] == akarantarge || [name] == akaranrondache || [name] == gildedshield ||[name] == protectorshield || [name] == sacredtarge) && [flag] != ethereal && [quality] == normal # [fireresist] > 0 && [sockets] == 0");

    Config.Runewords.push([Runeword.Spirit, "targe"]);
    Config.Runewords.push([Runeword.Spirit, "rondache"]);
    Config.Runewords.push([Runeword.Spirit, "heraldicshield"]);
    Config.Runewords.push([Runeword.Spirit, "aerinshield"]);
    Config.Runewords.push([Runeword.Spirit, "akarantarge"]);
    Config.Runewords.push([Runeword.Spirit, "akaranrondache"]);
    Config.Runewords.push([Runeword.Spirit, "protectorshield"]);
    Config.Runewords.push([Runeword.Spirit, "gildedshield"]);
    Config.Runewords.push([Runeword.Spirit, "sacredtarge"]);

    Config.Recipes.push([Recipe.Socket.Shield, "targe"]);
    Config.Recipes.push([Recipe.Socket.Shield, "rondache"]);
    Config.Recipes.push([Recipe.Socket.Shield, "heraldicshield"]);
    Config.Recipes.push([Recipe.Socket.Shield, "aerinshield"]);
    Config.Recipes.push([Recipe.Socket.Shield, "akarantarge"]);
    Config.Recipes.push([Recipe.Socket.Shield, "akaranrondache"]);
    Config.Recipes.push([Recipe.Socket.Shield, "protectorshield"]);
    Config.Recipes.push([Recipe.Socket.Shield, "gildedshield"]);
    Config.Recipes.push([Recipe.Socket.Shield, "sacredtarge"]);

    Config.KeepRunewords.push("[type] == auricshields # [fcr] >= 25 && [maxmana] >= 89");
  } else {
    NTIP.addLine("[name] == monarch && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 4 # [maxquantity] == 1");

    if (!me.getOwned(wanted).length) {
      NTIP.addLine("[name] == monarch && [flag] != ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
    }

    Config.Recipes.push([Recipe.Socket.Shield, "monarch", Roll.NonEth]);
    Config.Runewords.push([Runeword.Spirit, "monarch"]);
  }

  Config.KeepRunewords.push("[type] == shield # [fcr] >= 25 && [maxmana] >= 89");
})();
