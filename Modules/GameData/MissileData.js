(function (module) {
  /**
   * @typedef {Object} MissileData
   * @property {number} index - The missile's index.
   * @property {number} classID - The missile's class ID.
   * @property {string|number|undefined} internalName - The missile's internal name.
   * @property {number|undefined} velocity - The missile's velocity.
   * @property {number|undefined} velocityMax - The missile's maximum velocity.
   * @property {number|undefined} acceleration - The missile's acceleration.
   * @property {number|undefined} range - The missile's range.
   * @property {number|undefined} size - The missile's size.
   * @property {number|undefined} minDamage - The missile's minimum damage.
   * @property {number|undefined} maxDamage - The missile's maximum damage.
   * @property {string|number|undefined} eType - The missile's elemental type.
   * @property {number|undefined} eMin - The missile's minimum elemental damage.
   * @property {number|undefined} eMax - The missile's maximum elemental damage.
   * @property {Array.<string|number|undefined>} cltSubMissiles - The missile's client sub-missiles.
   */
  const MISSILES_COUNT = 385;
  /** @type {MissileData[]} */
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
})(module);
