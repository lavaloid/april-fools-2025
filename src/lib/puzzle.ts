import { Grid } from "./grid";
import { Vector2D, type Direction } from "./vector2d";

export const EMPTY = "  ";
export const WALL = "##";
export const PLAYER = "PP";
export const BLOCK = "--";

export type Cell =
  | typeof EMPTY
  | typeof WALL
  | typeof PLAYER
  | typeof BLOCK
  | `${number}${Direction}`;

export type Puzzle = Grid<Cell>;

/**
 * Interface for BoardState to interact with DOM
 */
export class IBoardRenderer {
  renderInitialBoard(board: BoardState): void {}
  movePlayer(newPos: Vector2D): void {}
  moveBlock(id: string, newPos: Vector2D): void {}
  rerenderClue(id: string, isValid: boolean): void {}
}

type CollisionCell = null | typeof WALL | `--${string}`;
export class BoardState {
  puzzle: Puzzle;
  renderer: IBoardRenderer;

  // board state
  player: Vector2D;
  clues: Map<
    string,
    { pos: Vector2D; val: number; dir: Direction; isValid?: boolean }
  >;
  blocks: Map<string, Vector2D>;

  // computed board state
  #collisionMap: Grid<CollisionCell>;
  get collisionMap() {
    return this.#collisionMap;
  }

  undoStack: {
    player: Vector2D;
    blocks: Map<string, Vector2D>;
    collisionMap: Grid<CollisionCell>;
  }[];

  onSolved: () => void;

  constructor(puzzle: Puzzle, renderer: IBoardRenderer, onSolved: () => void) {
    this.puzzle = puzzle;
    this.renderer = renderer;

    this.player = new Vector2D(0, 0);
    this.clues = new Map();
    this.blocks = new Map();

    this.onSolved = onSolved;

    let tempCollisionMap: CollisionCell[][] = [];

    puzzle.cells.forEach((row, rowIdx) => {
      tempCollisionMap.push([]);
      row.forEach((cell, colIdx) => {
        const pos = new Vector2D(colIdx, rowIdx);

        switch (cell) {
          case EMPTY:
            tempCollisionMap.at(-1)?.push(null);
            break;
          case WALL:
            tempCollisionMap.at(-1)?.push(WALL);
            break;
          case PLAYER:
            tempCollisionMap.at(-1)?.push(null);
            this.player = pos;
            break;
          case BLOCK:
            // since initial pos of blocks are unique, we will use it as the id
            tempCollisionMap.at(-1)?.push(`--${pos.toString()}`);
            this.blocks.set(pos.toString(), pos);
          default:
            // cell will be ignored if not fitting the pattern
            if (!["u", "d", "l", "r"].includes(cell.at(-1) || "")) break;

            tempCollisionMap.at(-1)?.push(null);
            const dir = cell.at(-1) as Direction;

            const val = parseInt(cell.slice(0, -1));
            if (isNaN(val)) break;

            this.clues.set(pos.toString(), { pos, dir, val });
            break;
        }
      });
    });

    this.#collisionMap = new Grid(tempCollisionMap);

    this.undoStack = [
      {
        player: this.player,
        blocks: new Map(this.blocks),
        collisionMap: new Grid(this.#collisionMap.mapCell((v) => v)),
      },
    ];

    this.renderer.renderInitialBoard(this);
  }

  setBlockPos(id: string, newPos: Vector2D) {
    const currentPos = this.blocks.get(id);
    if (!currentPos)
      return console.warn(`block with id "${id}" does not exist`);

    this.blocks.set(id, newPos);
    this.#collisionMap.set(currentPos, null);
    this.#collisionMap.set(newPos, `--${id}`);

    this.renderer.moveBlock(id, newPos);
  }

  movePlayer(dir: Direction) {
    const vecDir = Vector2D.dir(dir);

    let currentPos = this.player.add(vecDir);
    let blocksToMove: string[] = [];

    let isWallHit = false;
    // - check if player is allowed to move
    // - get list of blocks to move
    while (true) {
      const currentBlock = this.collisionMap.at(currentPos);
      if (
        currentBlock === WALL ||
        currentPos.x < 0 ||
        currentPos.x >= this.puzzle.width ||
        currentPos.y < 0 ||
        currentPos.y >= this.puzzle.height
      ) {
        isWallHit = true;
        break;
      }

      if (!currentBlock) {
        // current pos is empty, meaning movement is allowed
        break;
      }

      if (currentBlock?.startsWith(BLOCK)) {
        blocksToMove.push(currentBlock.slice(2));
      }

      currentPos = currentPos.add(vecDir);
    }

    if (isWallHit) return; // do nothing

    blocksToMove
      .toReversed()
      .forEach((block) =>
        this.setBlockPos(block, this.blocks.get(block)!.add(vecDir))
      );

    this.player = this.player.add(vecDir);

    this.undoStack.push({
      player: this.player,
      blocks: new Map(this.blocks),
      collisionMap: new Grid(this.#collisionMap.mapCell((v) => v)),
    });

    this.renderer.movePlayer(this.player);

    this.checkAnswer();
  }

  checkAnswer() {
    // yajisan sokoban clue:
    // - if covered, then the clue is meaningless
    // - if not covered, counts amount of blocks in that direction
    clueLoop: for (const [id, clue] of this.clues.entries()) {
      const { pos, val, dir } = clue;

      if (this.collisionMap.at(pos)) {
        clue.isValid = true;
        this.renderer.rerenderClue(id, true);
        continue;
      }

      let currentCount = 0;
      let currentPos = pos.add(Vector2D.dir(dir));
      gridLoop: while (true) {
        if (
          currentPos.x < 0 ||
          currentPos.x >= this.puzzle.width ||
          currentPos.y < 0 ||
          currentPos.y >= this.puzzle.height
        ) {
          break gridLoop;
        }

        if (this.collisionMap.at(currentPos)?.startsWith(BLOCK)) {
          currentCount++;
        }

        if (currentCount > val) {
          clue.isValid = false;
          this.renderer.rerenderClue(id, false);
          continue clueLoop;
        }

        currentPos = currentPos.add(Vector2D.dir(dir));
      }

      clue.isValid = currentCount === val;
      this.renderer.rerenderClue(id, clue.isValid);
    }

    if (this.clues.entries().every(([_, { isValid }]) => isValid)) {
      this.onSolved();
    }
  }

  undo() {
    if (this.undoStack.length <= 1) return;
    this.undoStack.pop()!;
    const last = this.undoStack.at(-1)!;

    this.player = last.player;
    this.renderer.movePlayer(this.player);

    this.blocks = new Map(last.blocks);
    this.blocks
      .entries()
      .forEach(([id, pos]) => this.renderer.moveBlock(id, pos));

    this.#collisionMap = new Grid(last.collisionMap.mapCell((v) => v));
  }
}
