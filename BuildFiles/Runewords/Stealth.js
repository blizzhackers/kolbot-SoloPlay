(function () {
  if (!me.checkItem({ name: sdk.locale.items.Stealth }).have && me.normal) {
    const stealthRunes = [
      "[name] == TalRune # # [maxquantity] == 1",
      "[name] == EthRune # # [maxquantity] == 1",
    ];
    NTIP.buildList(stealthRunes);
  }

  const stealthArmor = [
    "!me.hell && ([name] == studdedleather || [name] == lightplate) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
    "([name] == ghostarmor || [name] == serpentskinarmor || [name] == mageplate) && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1",
  ];
  NTIP.buildList(stealthArmor);

  if (me.equipped.get(sdk.body.Armor).tier < 200) {
    NTIP.addLine("[name] == breastplate && [flag] != ethereal && [quality] >= normal && [quality] <= superior # [sockets] == 2 # [maxquantity] == 1");
  }

  Config.Runewords.push([Runeword.Stealth, "mageplate"]);
  Config.Runewords.push([Runeword.Stealth, "serpentskinarmor"]);
  Config.Runewords.push([Runeword.Stealth, "ghostarmor"]);
  Config.Runewords.push([Runeword.Stealth, "lightplate"]);
  Config.Runewords.push([Runeword.Stealth, "breastplate"]);
  Config.Runewords.push([Runeword.Stealth, "studdedleather"]);

  Config.KeepRunewords.push("[type] == armor # [frw] == 25");
})();
