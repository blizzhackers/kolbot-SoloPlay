/**
*  @filename    CastPlanner.js
*  @desc        Expected-damage skill choice for the sorceress.
*               A cast lands a cast animation (plus missile travel or a fall delay) after it is sent, so each
*               modelled skill is scored by the damage it is expected to deal where the monsters will be when it
*               lands, summed over every monster it would hit.
*
*               Motion model: a walking/running monster moves straight toward unit.targetx/targety (its path
*               target) at its current speed in yards per second, slowed when chilled, and stops there. Missiles
*               move about 1.1 x their missiles.txt Vel yards per second.
*/

(function (module, require) {
  const MonsterData = require("./GameData/MonsterData");
  const FPS = 25;
  // measured missile speed / missiles.txt Vel (yards per second per Vel unit)
  const MISSILE_SPEED_SCALE = 1.1;
  // how far ahead we trust the motion model (seconds)
  const MAX_HORIZON = 2.5;
  // extra weight for champions / uniques / bosses: killing them first matters more than raw damage
  const SPECIAL_WEIGHT = 1.5;
  const MONSTER_SEARCH_RANGE = 40;

  /**
   * Geometry per skill.
   * kind: "missile" (single target, travel time), "splash" (missile that bursts), "area" (lands at the point
   * after a delay; Blizzard spreads its hits over a duration), "orb" (Frozen Orb path + nova of bolts).
   */
  const SKILL_MODEL = {};
  SKILL_MODEL[sdk.skills.FireBolt] = { kind: "missile", fallbackVel: 18 };
  SKILL_MODEL[sdk.skills.IceBolt] = { kind: "missile", fallbackVel: 18 };
  SKILL_MODEL[sdk.skills.IceBlast] = { kind: "missile", fallbackVel: 18 };
  SKILL_MODEL[sdk.skills.FireBall] = { kind: "splash", radius: 3, fallbackVel: 18 };
  SKILL_MODEL[sdk.skills.GlacialSpike] = { kind: "splash", radius: 3, fallbackVel: 18 };
  SKILL_MODEL[sdk.skills.Meteor] = { kind: "area", radius: 4, delay: 1.0, duration: 0 };
  SKILL_MODEL[sdk.skills.Blizzard] = { kind: "area", radius: 4.5, delay: 0.3, duration: 3.5 };
  SKILL_MODEL[sdk.skills.FrozenOrb] = { kind: "orb", delay: 0.5 };

  const missileSpeedCache = {};

  /** @param {number} skillId @returns {number} yards per second */
  const missileSpeed = function (skillId) {
    if (missileSpeedCache[skillId] !== undefined) return missileSpeedCache[skillId];
    let vel = 0;
    try {
      const msl = getBaseStat("skills", skillId, "srvmissile");
      if (typeof msl === "number" && msl > 0) {
        vel = getBaseStat("missiles", msl, "Vel");
      }
    } catch (e) {
      vel = 0;
    }
    if (!(vel > 0)) {
      vel = (SKILL_MODEL[skillId] && SKILL_MODEL[skillId].fallbackVel) || 18;
    }
    missileSpeedCache[skillId] = vel * MISSILE_SPEED_SCALE;
    return missileSpeedCache[skillId];
  };

  /** @param {number} skillId @returns {number} seconds from sending the cast to the missile's release */
  const castTime = function (skillId) {
    let frames;
    try {
      frames = me.castingFrames(skillId);
    } catch (e) {
      frames = 0;
    }
    return (frames > 0 ? frames : 11) / FPS;
  };

  /**
   * Motion snapshot of a monster: position, path target and speed (yards per second).
   * @param {Monster} mon
   */
  const snapshot = function (mon) {
    const s = { unit: mon, x: mon.x, y: mon.y, tx: mon.x, ty: mon.y, speed: 0, dist: 0 };
    if (!mon.isMoving || mon.isFrozen) return s;
    const tx = mon.targetx, ty = mon.targety;
    if (typeof tx !== "number" || typeof ty !== "number" || (!tx && !ty)) return s;
    const dx = tx - s.x, dy = ty - s.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.5 || d > 60) return s;
    let speed;
    try {
      speed = mon.currentVelocity || 0;
    } catch (e) {
      speed = 0;
    }
    s.tx = tx;
    s.ty = ty;
    s.dist = d;
    s.speed = speed;
    return s;
  };

  /** Predicted position of a snapshot after t seconds. */
  const at = function (s, t) {
    if (!s.speed || !s.dist || t <= 0) return { x: s.x, y: s.y };
    const step = Math.min(s.dist, s.speed * Math.min(t, MAX_HORIZON));
    return { x: s.x + (s.tx - s.x) / s.dist * step, y: s.y + (s.ty - s.y) / s.dist * step };
  };

  const dist = function (a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Expected damage of one hit of skillId on mon (resists, pierce, conviction, capped at its current life).
   * @param {number} skillId
   * @param {Monster} mon
   * @param {number} conviction
   */
  const hitDamage = function (skillId, mon, conviction) {
    const data = GameData.skillDamage(skillId, mon);
    if (!data) return 0;
    let total = 0;
    const avgP = (data.pmin + data.pmax) / 2;
    const avgE = (data.min + data.max) / 2;
    if (avgP > 0) {
      const pres = Math.max(-100, Math.min(100, GameData.monsterResist(mon, "Physical")));
      total += avgP * (100 - pres) / 100;
    }
    if (avgE > 0 && !(data.undeadOnly && MonsterData.get(mon.classid).Undead)) {
      let res = GameData.monsterResist(mon, data.type);
      if (GameData.convictionEligible[data.type]) {
        res -= (res >= 100 ? conviction / 5 : conviction);
      }
      const pierce = GameData.pierceMap[data.type] ? me.getStat(GameData.pierceMap[data.type]) : 0;
      res = res < 100 ? Math.max(-100, res - pierce) : 100;
      total += avgE * (100 - res) / 100;
    }
    try {
      const adjust = mon.charlvl - GameData.monsterLevel(mon.classid, mon.area);
      const life = GameData.monsterMaxHP(mon.classid, mon.area, adjust) / 100 * (mon.hp * 100 / mon.hpmax);
      life < total && (total = life);
    } catch (e) {
      // keep the uncapped value
    }
    return total * (mon.isSpecial ? SPECIAL_WEIGHT : 1);
  };

  /**
   * Context for one decision: monster snapshots near the target, per-skill damage cache.
   * @param {Monster} target
   */
  const Context = function (target) {
    this.target = target;
    this.conviction = 0;
    try {
      this.conviction = GameData.getConviction();
    } catch (e) {
      this.conviction = 0;
    }
    this.mons = [];
    this.targetSnap = null;
    const self = this;
    getUnits(sdk.unittype.Monster).forEach(function (mon) {
      if (!mon || !mon.attackable || mon.distance > MONSTER_SEARCH_RANGE) return;
      const s = snapshot(mon);
      self.mons.push(s);
      mon.gid === target.gid && (self.targetSnap = s);
    });
    if (!this.targetSnap) {
      this.targetSnap = snapshot(target);
      this.mons.push(this.targetSnap);
    }
    this.dmg = {};
  };

  Context.prototype.damage = function (skillId, s) {
    const key = skillId + ":" + s.unit.gid;
    if (this.dmg[key] === undefined) {
      this.dmg[key] = hitDamage(skillId, s.unit, this.conviction);
    }
    return this.dmg[key];
  };

  /** Time (s) and point where a missile sent now meets snapshot s (fixed point iteration). */
  const intercept = function (skillId, s) {
    const ct = castTime(skillId);
    const v = missileSpeed(skillId);
    let p = at(s, ct);
    let t = ct;
    for (let i = 0; i < 3; i++) {
      t = ct + dist(me, p) / v;
      p = at(s, t);
    }
    return { x: p.x, y: p.y, t: t };
  };

  /** Fraction of the area skill's hits a monster takes when the skill is cast at p. */
  const areaFraction = function (model, ct, s, p) {
    if (!model.duration) {
      return dist(at(s, ct + model.delay), p) <= model.radius ? 1 : 0;
    }
    const steps = 6;
    let inside = 0;
    for (let i = 0; i < steps; i++) {
      const t = ct + model.delay + model.duration * (i + 0.5) / steps;
      dist(at(s, t), p) <= model.radius && inside++;
    }
    return inside / steps;
  };

  /**
   * Expected damage of skillId against the context, cast at its best point. The caller moves into range and line
   * of sight before it casts, so neither limits the choice.
   * @param {number} skillId
   * @returns {number | null} null for a skill the planner does not model
   */
  Context.prototype.evaluate = function (skillId) {
    const model = SKILL_MODEL[skillId];
    if (!model) return null;
    const self = this;
    const ts = this.targetSnap;
    const ct = castTime(skillId);

    if (model.kind === "missile") {
      return this.damage(skillId, ts);
    }

    if (model.kind === "splash") {
      // aim at a monster's intercept point, burst hits everyone predicted inside the radius at impact
      let best = null;
      const aims = this.mons.filter(function (s) {
        return s === ts || dist(s, ts) < 10;
      });
      for (let i = 0; i < aims.length && i < 8; i++) {
        const hit = intercept(skillId, aims[i]);
        let dmg = 0;
        for (let j = 0; j < this.mons.length; j++) {
          const mon = this.mons[j];
          if (dist(at(mon, hit.t), hit) <= model.radius) dmg += this.damage(skillId, mon);
        }
        (best === null || dmg > best) && (best = dmg);
      }
      return best;
    }

    if (model.kind === "area") {
      // candidates: the target's and its neighbours' predicted positions, and the value-weighted centroid
      const tLand = ct + model.delay + model.duration / 2;
      const near = this.mons.filter(function (s) {
        return dist(at(s, tLand), at(ts, tLand)) < 2 * model.radius + 2;
      });
      const cands = [];
      let wx = 0, wy = 0, w = 0;
      near.forEach(function (s) {
        const p = at(s, tLand);
        const v = self.damage(skillId, s);
        cands.length < 6 && cands.push(p);
        if (v > 0) {
          wx += p.x * v;
          wy += p.y * v;
          w += v;
        }
      });
      w > 0 && cands.push({ x: wx / w, y: wy / w });
      cands.length || cands.push(at(ts, tLand));
      let best = null;
      for (let i = 0; i < cands.length; i++) {
        const spot = { x: Math.round(cands[i].x), y: Math.round(cands[i].y) };
        let dmg = 0;
        for (let j = 0; j < this.mons.length; j++) {
          const f = areaFraction(model, ct, this.mons[j], spot);
          f > 0 && (dmg += f * this.damage(skillId, this.mons[j]));
        }
        (best === null || dmg > best) && (best = dmg);
      }
      return best;
    }

    if (model.kind === "orb") {
      // same falloff as GameData's orb estimate, on predicted positions, along the line to the predicted target
      // (the orb flies ~9 yards then its bolts cover ~20)
      const landing = at(ts, ct + model.delay);
      const dx = landing.x - me.x, dy = landing.y - me.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const ex = me.x + dx / d * 9.33, ey = me.y + dy / d * 9.33;
      let dmg = 0;
      for (let j = 0; j < this.mons.length; j++) {
        const orbMon = this.mons[j];
        const q = at(orbMon, ct + model.delay);
        // distance from q to the segment me -> (ex, ey)
        const sx = ex - me.x, sy = ey - me.y;
        let u = ((q.x - me.x) * sx + (q.y - me.y) * sy) / (sx * sx + sy * sy);
        u = Math.max(0, Math.min(1, u));
        const pd = dist(q, { x: me.x + sx * u, y: me.y + sy * u });
        if (pd >= 25) continue;
        const mod = pd > 20 ? 5 : pd > 15 ? 4 : pd > 10 ? 3 : 1;
        dmg += this.damage(skillId, orbMon) / mod;
      }
      return dmg;
    }
    return null;
  };

  module.exports = {
    /** @param {number} skillId @returns {boolean} whether the planner models this skill */
    plannable: function (skillId) {
      return !!SKILL_MODEL[skillId];
    },
    /**
     * @param {Monster} target
     * @returns {Context}
     */
    context: function (target) {
      return new Context(target);
    },
  };
})(module, require);
