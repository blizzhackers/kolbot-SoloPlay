(function () {
  const DreamHelm = [
    "[name] == IoRune # # [maxquantity] == 1",
    "[name] == JahRune",
    "[name] == PulRune",
    "[name] == bonevisage && [flag] != ethereal && [quality] == superior # [enhanceddefense] >= 15 && [sockets] == 3 # [maxquantity] == 1",
  ];
  NTIP.buildList(DreamHelm);

  Config.Runewords.push([Runeword.Dream, "bonevisage"]);
  Config.KeepRunewords.push("[type] == helm # [holyshockaura] >= 15");
})();
