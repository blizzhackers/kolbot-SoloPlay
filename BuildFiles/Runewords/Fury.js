(function () {
  const Fury = [
    "[name] == JahRune",
    "[name] == GulRune",
    "[name] == EthRune ## [maxquantity] == 1",
    "[name] == suwayyah && [quality] >= normal && [quality] <= superior # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 3 # [maxquantity] == 1",
    "[name] == suwayyah && [quality] == normal # ([assassinskills]+[shadowdisciplinesskilltab]+[skillvenom]+[skilldeathsentry]+[skillfade]+[skillshadowmaster]) >= 1 && [sockets] == 0 # [maxquantity] == 1",
  ];
  NTIP.buildList(Fury);

  Config.Runewords.push([Runeword.Fury, "suwayyah"]);

  Config.KeepRunewords.push("[type] == assassinclaw # [lifeleech] >= 6 && [ias] == 40 && [itemdeadlystrike] == 33");
})();
