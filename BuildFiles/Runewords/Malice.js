(function () {
  const Malice = [
    "[name] == IthRune # # [maxquantity] == 1",
    "[name] == ElRune # # [maxquantity] == 1",
    "[name] == EthRune # # [maxquantity] == 1",
    "[type] == sword && [flag] != ethereal && [quality] >= normal && [quality] <= superior && [wsm] <= 10 && [strreq] <= 150 # [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(Malice);

  Config.Runewords.push([Runeword.Malice, "crystalsword"]);
  Config.Runewords.push([Runeword.Malice, "broadsword"]);
  Config.Runewords.push([Runeword.Malice, "longsword"]);
  Config.Runewords.push([Runeword.Malice, "warsword"]);
  Config.Runewords.push([Runeword.Malice, "giantsword"]);
  Config.Runewords.push([Runeword.Malice, "flamberge"]);
  Config.Runewords.push([Runeword.Malice, "espandon"]);
  Config.Runewords.push([Runeword.Malice, "tusksword"]);
  Config.Runewords.push([Runeword.Malice, "zweihander"]);

  Config.KeepRunewords.push("[type] == sword # [enhanceddamage] >= 33 && [tohit] >= 50");
})();
