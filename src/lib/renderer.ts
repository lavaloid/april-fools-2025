import { BoardState, IBoardRenderer, WALL } from "./puzzle";
import type { Vector2D } from "./vector2d";

const CELL_SIZE = 50;
const BLOCK_SIZE = 38;
const createElement = (tagName: string) =>
  document.createElementNS("http://www.w3.org/2000/svg", tagName);
const setAttribute = (el: SVGElement, name: string, value: string) =>
  el.setAttributeNS(null, name, value);

export class Renderer extends IBoardRenderer {
  /**
   * cells will overlap at the border (1px)
   */

  renderInitialBoard(board: BoardState) {
    const canvas = document.querySelector("#game") as SVGElement;
    canvas.innerHTML = "";

    // -------- LAYER 1: grid layer
    const gridGroup = createElement("g");

    board.puzzle.forEachCell((cell, pos) => {
      if (cell === WALL) {
        const newCell = createElement("rect") as unknown as SVGRectElement;

        setAttribute(newCell, "x", `${pos.x * CELL_SIZE}`);
        setAttribute(newCell, "y", `${pos.y * CELL_SIZE}`);
        setAttribute(newCell, "width", `${CELL_SIZE}`);
        setAttribute(newCell, "height", `${CELL_SIZE}`);
        setAttribute(newCell, "stroke-width", "2");
        setAttribute(newCell, "rx", "1");
        setAttribute(newCell, "ry", "1");
        setAttribute(newCell, "stroke", "black");
        setAttribute(newCell, "fill", "black");

        gridGroup.appendChild(newCell);
      } else {
        const newCell = createElement("rect") as unknown as SVGRectElement;

        setAttribute(newCell, "x", `${pos.x * CELL_SIZE}`);
        setAttribute(newCell, "y", `${pos.y * CELL_SIZE}`);
        setAttribute(newCell, "width", `${CELL_SIZE}`);
        setAttribute(newCell, "height", `${CELL_SIZE}`);
        setAttribute(newCell, "stroke-width", "1");
        setAttribute(newCell, "stroke", "black");
        setAttribute(newCell, "fill", "transparent");

        gridGroup.appendChild(newCell);
      }
    });

    canvas.appendChild(gridGroup);

    // -------- LAYER 2: clue layer
    const clueGroup = createElement("g");

    board.clues.entries().forEach(([id, { pos, val, dir }]) => {
      const newClue = createElement("g");

      // render text
      const newText = createElement("text");
      newText.innerHTML = `${val}`;
      setAttribute(newText, "font-size", "28");
      setAttribute(newText, "fill", "black");
      setAttribute(newText, "text-anchor", "middle");
      newText.dataset.clueId = id;

      if (dir === "u" || dir === "d") {
        setAttribute(newText, "x", `${pos.x * CELL_SIZE + CELL_SIZE * 0.4}`);
        setAttribute(newText, "y", `${pos.y * CELL_SIZE + CELL_SIZE * 0.7}`);
      }
      if (dir === "l" || dir === "r") {
        setAttribute(newText, "x", `${pos.x * CELL_SIZE + CELL_SIZE / 2}`);
        setAttribute(newText, "y", `${pos.y * CELL_SIZE + CELL_SIZE * 0.65}`);
      }

      newClue.appendChild(newText);

      // render arrow
      const newArrow = createElement("path");
      setAttribute(newArrow, "fill", "black");

      const stemLength = CELL_SIZE * 0.45;
      const stemWidth = CELL_SIZE * 0.04;
      const headWidth = CELL_SIZE * 0.15;
      const headHeight = CELL_SIZE * 0.17;

      const headMargin =
        (CELL_SIZE - (stemLength + headHeight)) / 2 - CELL_SIZE * 0.02;

      if (dir === "u") {
        setAttribute(
          newArrow,
          "d",
          `
          M ${pos.x * CELL_SIZE + CELL_SIZE * 0.7} ${
            pos.y * CELL_SIZE + headMargin
          }
          l ${headWidth / -2} ${headHeight}
          h ${(headWidth - stemWidth) / 2}
          v ${stemLength}
          h ${stemWidth}
          v ${stemLength * -1}
          h ${(headWidth - stemWidth) / 2}
          z
        `
        );
      } else if (dir === "d") {
        setAttribute(
          newArrow,
          "d",
          `
            M ${pos.x * CELL_SIZE + CELL_SIZE * 0.7} ${
            pos.y * CELL_SIZE + CELL_SIZE - headMargin
          }
            l ${headWidth / -2} ${headHeight * -1}
            h ${(headWidth - stemWidth) / 2}
            v ${stemLength * -1}
            h ${stemWidth}
            v ${stemLength}
            h ${(headWidth - stemWidth) / 2}
            z
          `
        );
      } else if (dir === "l") {
        setAttribute(
          newArrow,
          "d",
          `
            M ${pos.x * CELL_SIZE + headMargin} ${
            pos.y * CELL_SIZE + CELL_SIZE * 0.8
          }
            l ${headHeight} ${headWidth / -2}
            v ${(headWidth - stemWidth) / 2}
            h ${stemLength}
            v ${stemWidth}
            h ${stemLength * -1}
            v ${(headWidth - stemWidth) / 2}
            z
          `
        );
      } else if (dir === "r") {
        setAttribute(
          newArrow,
          "d",
          `
            M ${pos.x * CELL_SIZE + CELL_SIZE - headMargin} ${
            pos.y * CELL_SIZE + CELL_SIZE * 0.8
          }
            l ${headHeight * -1} ${headWidth / -2}
            v ${(headWidth - stemWidth) / 2}
            h ${stemLength * -1}
            v ${stemWidth}
            h ${stemLength}
            v ${(headWidth - stemWidth) / 2}
            z
          `
        );
      }
      newClue.appendChild(newArrow);

      clueGroup.appendChild(newClue);
    });

    canvas.appendChild(clueGroup);

    // -------- LAYER 3: object layer
    const objectGroup = createElement("g");

    board.blocks.entries().forEach(([id, pos]) => {
      const newCell = createElement("rect") as unknown as SVGRectElement;

      newCell.dataset.blockId = id;
      setAttribute(
        newCell,
        "x",
        `${pos.x * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2}`
      );
      setAttribute(
        newCell,
        "y",
        `${pos.y * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2}`
      );
      setAttribute(newCell, "width", `${BLOCK_SIZE}`);
      setAttribute(newCell, "height", `${BLOCK_SIZE}`);
      setAttribute(newCell, "stroke-width", "2.5");
      setAttribute(newCell, "stroke", "black");
      setAttribute(newCell, "fill", "#bbbbbbb3");

      objectGroup.appendChild(newCell);
    });

    const newPlayer = createElement("circle") as unknown as SVGRectElement;

    setAttribute(newPlayer, "id", "player");
    setAttribute(
      newPlayer,
      "cx",
      `${board.player.x * CELL_SIZE + CELL_SIZE / 2}`
    );
    setAttribute(
      newPlayer,
      "cy",
      `${board.player.y * CELL_SIZE + CELL_SIZE / 2}`
    );
    setAttribute(newPlayer, "r", `${BLOCK_SIZE / 2}`);
    setAttribute(newPlayer, "fill", "#ff000066");

    objectGroup.appendChild(newPlayer);

    canvas.appendChild(objectGroup);

    // ------ Final attr adjustment
    const gridBorder = createElement("rect") as unknown as SVGRectElement;

    setAttribute(gridBorder, "x", "0");
    setAttribute(gridBorder, "y", "0");
    setAttribute(gridBorder, "width", `${CELL_SIZE * board.puzzle.width}`);
    setAttribute(gridBorder, "height", `${CELL_SIZE * board.puzzle.height}`);
    setAttribute(gridBorder, "stroke-width", "4");
    setAttribute(gridBorder, "stroke", "black");
    setAttribute(gridBorder, "fill", "transparent");

    canvas.appendChild(gridBorder);

    setAttribute(
      canvas,
      "viewBox",
      `-5 -5 ${CELL_SIZE * board.puzzle.width + 10} ${
        CELL_SIZE * board.puzzle.height + 10
      }`
    );
  }

  movePlayer(newPos: Vector2D) {
    const player = document.querySelector("#player") as SVGElement;

    const newCanvasPosX = `${newPos.x * CELL_SIZE + CELL_SIZE / 2}`;
    const newCanvasPosY = `${newPos.y * CELL_SIZE + CELL_SIZE / 2}`;

    // createAnimation(
    //   player,
    //   "x",
    //   player.getAttribute("x") || "",
    //   newCanvasPosX,
    //   "0.3s"
    // );
    // createAnimation(
    //   player,
    //   "y",
    //   player.getAttribute("y") || "",
    //   newCanvasPosY,
    //   "1s"
    // );
    setAttribute(player, "cx", newCanvasPosX);
    setAttribute(player, "cy", newCanvasPosY);
  }

  moveBlock(id: string, newPos: Vector2D) {
    const block = document.querySelector(
      `[data-block-id="${id}"]`
    ) as SVGElement;
    // console.log(id, newPos)

    const newCanvasPosX = `${
      newPos.x * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2
    }`;
    const newCanvasPosY = `${
      newPos.y * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2
    }`;

    // createAnimation(
    //   block,
    //   "x",
    //   block.getAttribute("x") || "",
    //   newCanvasPosX,
    //   "0.3s"
    // );
    // createAnimation(
    //   block,
    //   "y",
    //   block.getAttribute("y") || "",
    //   newCanvasPosY,
    //   "1s"
    // );
    setAttribute(block, "x", newCanvasPosX);
    setAttribute(block, "y", newCanvasPosY);
  }

  rerenderClue(id: string, isValid: boolean) {}
}
