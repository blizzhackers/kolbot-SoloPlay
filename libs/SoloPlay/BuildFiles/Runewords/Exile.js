(function () {
  const Exile = [
    "[name] == VexRune",
    "[name] == OhmRune",
    "[name] == IstRune",
    "[name] == DolRune # # [maxquantity] == 1",
    "[name] == sacredtarge && [quality] >= normal && [quality] <= superior # [fireresist] >= 30 && [sockets] == 4 # [maxquantity] == 1",
  ];
  NTIP.buildList(Exile);

  const wanted = {
    classid: sdk.items.SacredTarge,
    mode: sdk.items.mode.inStorage,
    sockets: 4,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  if (!me.getOwned(wanted).length) {
    NTIP.addLine("[name] == sacredtarge && [quality] == normal && [flag] == ethereal # [fireresist] >= 30 && [sockets] == 0 # [maxquantity] == 1");
  }

  Config.Recipes.push([Recipe.Socket.Shield, "sacredtarge"]);
  Config.Runewords.push([Runeword.Exile, "sacredtarge"]);
  Config.KeepRunewords.push("[type] == auricshields # [defianceaura] >= 13");
})();
