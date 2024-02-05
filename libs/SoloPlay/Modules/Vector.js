/**
 * @filename    Vector.js
 * @author      theBGuy
 * @desc        Vector class
 * 
 */

(function (module) {
  /**
   * @constructor
   * @param {number} x 
   * @param {number} y 
   */
  function Vector (x, y) {
    this.x = Math.trunc(x) || 0;
    this.y = Math.trunc(y) || 0;
  }

  Vector.prototype = {
    /**
     * Set the magnitude of the vector 
     * @param {number} magnitude 
     */
    setMagnitude: function (magnitude) {
      let angle = this.getAngle();
      this.x = Math.cos(angle) * magnitude;
      this.y = Math.sin(angle) * magnitude;
    },

    /**
     * Get the magnitude of the vector 
     * @returns {number}
     */
    getMagnitude: function () {
      return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    /**
     * Calculate the distance to another point 
     * @param {Vector} point 
     * @returns {number}
     */
    getMagnitudeTo: function (point) {
      let dx = this.x - point.x;
      let dy = this.y - point.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Set the angle of the vector 
     * @param {number} angle 
     */
    setAngle: function (angle) {
      let magnitude = this.getMagnitude();
      this.x = Math.cos(angle) * magnitude;
      this.y = Math.sin(angle) * magnitude;
    },

    /**
     * Get the angle of the vector 
     * @returns {number}
     */
    getAngle: function () {
      return Math.atan2(this.y, this.x);
    },

    /**
     * Add a vector to this vector 
     * @param {Vector} vector 
     */
    add: function (vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    },

    /**
     * Subtract a vector from this vector 
     * @param {Vector} vector 
     */
    subtract: function (vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
    },

    /**
     * Multiply this vector by a scalar value 
     * @param {number} scalar 
     */
    multiply: function (scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    },

    /**
     * Divide this vector by a scalar value 
     * @param {number} scalar 
     */
    divide: function (scalar) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    },

    /**
     * Normalize this vector (make its magnitude 1) 
     */
    normalize: function () {
      let magnitude = this.getMagnitude();
      if (magnitude !== 0) {
        this.x /= magnitude;
        this.y /= magnitude;
      }
      return this;
    }
  };

  /**
   * Generate a list of points along the line from pointA to pointB
   * @param {Vector} pointA 
   * @param {Vector} pointB 
   * @param {number} numberOfPoints 
   * @returns {Vector[]}
   * @todo Should this accept a unit as well and create a vector for it?
   */
  Vector.path = function (pointA, pointB, numberOfPoints) {
    if (!(pointA instanceof Vector)) {
      pointA = new Vector(pointA.x, pointA.y);
    }
    if (!(pointB instanceof Vector)) {
      pointB = new Vector(pointB.x, pointB.y);
    }
    if (!numberOfPoints) {
      numberOfPoints = Math.floor(getDistance(pointA.x, pointA.y, pointB.x, pointB.y));
    }
    // Calculate the vector from point A to point B
    let trajectory = new Vector(pointB.x - pointA.x, pointB.y - pointA.y);

    // Normalize the trajectory vector
    trajectory.normalize();

    // Calculate the distance between point A and point B
    let distance = pointA.getMagnitudeTo(pointB);

    // Calculate the distance between each generated point
    let step = distance / numberOfPoints;

    /**
     * @type {Vector[]}
     */
    let points = [];

    // Generate an array of points from point A to point B
    for (let i = 0; i <= numberOfPoints; i++) {
      // Calculate the position of the current point along the trajectory
      let position = new Vector(trajectory.x * step * i, trajectory.y * step * i);

      // Add the position to the starting point to get the actual point
      let point = new Vector(pointA.x + position.x, pointA.y + position.y);

      // Add the point to the array
      points.push(point);
    }

    return points;
  };

  /**
   * Find a third point in the same direction as point A to point B
   * @param {Vector} vecA 
   * @param {Vector} vecB 
   * @param {number} distance 
   * @returns {Vector}
   */
  Vector.spotOnDistance = function (vecA, vecB, distance) {
    // Calculate the vector from point A to point B
    let trajectory = new Vector(vecB.x - vecA.x, vecB.y - vecA.y);

    // Normalize the trajectory vector
    trajectory.normalize();

    // Multiply the normalized trajectory by the distance
    trajectory.multiply(distance);

    return new Vector(vecA.x + trajectory.x, vecA.y + trajectory.y);
  };

  module.exports = Vector;
})(module);
