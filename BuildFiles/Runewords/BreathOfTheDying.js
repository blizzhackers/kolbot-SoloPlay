(function () {
  const BoTD = [
    "[name] == VexRune",
    "me.diff == 2 && [name] == HelRune # # [maxquantity] == 1",
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == EldRune # # [maxquantity] == 1",
    "[name] == ZodRune",
    "me.diff == 2 && [name] == EthRune # # [maxquantity] == 1",
    "[name] == colossusblade && [flag] == ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 6 # [maxquantity] == 1",
  ];
  NTIP.buildList(BoTD);

  /** @type {GetOwnedSettings} */
  const wanted = {
    classid: sdk.items.ColossusBlade,
    mode: sdk.items.mode.inStorage,
    sockets: 6,
    ethereal: true,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  // Have Zod rune but do not have a base yet
  if (!me.getOwned(wanted).length
    && me.getItem(sdk.items.runes.Zod)) {
    NTIP.addLine("[name] == colossusblade && [flag] == ethereal && [quality] == normal # [sockets] == 0 # [maxquantity] == 1");
  }

  Config.Recipes.push([Recipe.Socket.Weapon, "colossusblade", Roll.Eth]);
  Config.Runewords.push([Runeword.BreathoftheDying, "colossusblade"]);

  Config.KeepRunewords.push("[type] == sword # [ias] >= 60 && [enhanceddamage] >= 350");
})();
