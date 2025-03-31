import { Vector2D } from "./vector2d";

export class Grid<T> {
  cells: T[][];
  width: number;
  height: number;

  forEach: Array<T[]>["forEach"];

  constructor(cells: T[][], pad?: T) {
    this.cells = cells;
    this.width = Math.max(...cells.map((row) => row.length));
    this.height = cells.length;

    this.forEach = cells.forEach;

    // pad rows to ensure equal row lengths
    this.cells.forEach((row) => {
      while (row.length < this.width) {
        row.push(pad || row.at(-1)!);
      }
    });
  }

  at(idx: Vector2D) {
    return this.cells.at(idx.y)?.at(idx.x);
  }

  set(idx: Vector2D, value: T) {
    if (idx.y >= this.height) return;
    if (idx.x >= this.width) return;

    this.cells[idx.y][idx.x] = value;
  }

  forEachCell(callback: (cell: T, pos: Vector2D) => void) {
    this.cells.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) =>
        callback(cell, new Vector2D(colIdx, rowIdx))
      )
    );
  }

  mapCell<R>(callback: (cell: T, pos: Vector2D) => R) {
    return this.cells.map((row, rowIdx) =>
      row.map((cell, colIdx) => callback(cell, new Vector2D(colIdx, rowIdx)))
    );
  }
}
