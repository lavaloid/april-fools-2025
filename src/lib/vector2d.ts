export type Direction = "u" | "d" | "l" | "r";

export class Vector2D {
  x: number;
  y: number;

  static UP = new Vector2D(0, -1);
  static DOWN = new Vector2D(0, 1);
  static LEFT = new Vector2D(-1, 0);
  static RIGHT = new Vector2D(1, 0);
  static dir(direction: Direction) {
    return {
      u: Vector2D.UP,
      d: Vector2D.DOWN,
      l: Vector2D.LEFT,
      r: Vector2D.RIGHT,
    }[direction];
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.x}, ${this.y}`;
  }

  add(other: Vector2D) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2D) {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * Check if `this` vector is facing `other` vector in `dir` direction
   * @param other The `other` vector
   * @param dir the direction direction `this` vector is facing
   */
  isFacing(other: Vector2D, dir: Direction) {
    const diff = this.subtract(other);
    switch (dir) {
      case "u":
        return diff.x === 0 && diff.y > 0;
      case "d":
        return diff.x === 0 && diff.y < 0;
      case "l":
        return diff.x > 0 && diff.y === 0;
      case "r":
        return diff.x < 0 && diff.y === 0;
      default:
        return false; // unreachable
    }
  }
}
