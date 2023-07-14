(function () {
  const DreamShield = [
    "[name] == IoRune # # [maxquantity] == 1",
    "[name] == JahRune",
    "[name] == PulRune",
    "[name] == sacredtarge && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [fireresist] >= 45 && [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(DreamShield);

  /** @type {GetOwnedSettings} */
  const wanted = {
    classid: sdk.items.SacredTarge,
    mode: sdk.items.mode.inStorage,
    sockets: 3,
    /** @param {ItemUnit} item */
    cb: function (item) {
      return item.isBaseType;
    }
  };

  if (!me.getOwned(wanted).length) {
    NTIP.addLine("[name] == sacredtarge && [flag] != ethereal && [quality] == normal # [fireresist] >= 45 && [sockets] == 0 # [maxquantity] == 1");
  }

  Config.Recipes.push([Recipe.Socket.Shield, "sacredtarge", Roll.NonEth]);
  Config.Runewords.push([Runeword.Dream, "sacredtarge"]);
  Config.KeepRunewords.push("[type] == auricshields # [holyshockaura] >= 15");
})();
