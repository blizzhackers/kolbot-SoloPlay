(function (module, require) {
  /**
   *  MissilesData
   */
  const MISSILES_COUNT = 385;
  const MissilesData = Array(MISSILES_COUNT);

  for (let i = 0; i < MissilesData.length; i++) {
    let index = i;
    MissilesData[i] = ({
      index: index,
      classID: index,
      internalName: getBaseStat("missiles", index, "Missile"),
      velocity: getBaseStat("missiles", index, "Vel"),
      velocityMax: getBaseStat("missiles", index, "MaxVel"),
      acceleration: getBaseStat("missiles", index, "Accel"),
      range: getBaseStat("missiles", index, "Range"),
      size: getBaseStat("missiles", index, "Size"),
      minDamage: getBaseStat("missiles", index, "MinDamage"),
      maxDamage: getBaseStat("missiles", index, "MaxDamage"),
      eType: getBaseStat("missiles", index, "EType"),
      eMin: getBaseStat("missiles", index, "EMin"),
      eMax: getBaseStat("missiles", index, "EMax"),
      cltSubMissiles: [getBaseStat("missiles", index, "CltSubMissile1"), getBaseStat("missiles", index, "CltSubMissile2"), getBaseStat("missiles", index, "CltSubMissile3")],
    });
  }
  module.exports = MissilesData;
})(module, require);
