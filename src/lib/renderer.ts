import { BLOCK, BoardState, EMPTY, IBoardRenderer, WALL } from "./puzzle";
import type { Vector2D } from "./vector2d";

const CELL_SIZE = 50;
const BLOCK_SIZE = 35;
const createElement = (tagName: string) =>
  document.createElementNS("http://www.w3.org/2000/svg", tagName);
// const createAnimation = (
//   element: SVGElement,
//   attribute: string,
//   from: string,
//   to: string,
//   duration: string
// ) => {
//   const prevAnimation = element.querySelector(
//     `animate[attributeName="${attribute}"]`
//   );
//   if (prevAnimation) {
//     element.removeChild(prevAnimation);
//   }

//   const animation = createElement("animate");
//   animation.setAttribute("attributeName", attribute);
//   animation.setAttribute("attributeType", "XML");
//   animation.setAttribute("begin", "0s");
//   animation.setAttribute("dur", duration);
//   animation.setAttribute("to", to);
//   animation.setAttribute("from", from);
//   animation.setAttribute("fill", "freeze");

//   element.appendChild(animation);
// };

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

        newCell.setAttribute("x", `${pos.x * CELL_SIZE}`);
        newCell.setAttribute("y", `${pos.y * CELL_SIZE}`);
        newCell.setAttribute("width", `${CELL_SIZE}`);
        newCell.setAttribute("height", `${CELL_SIZE}`);
        newCell.setAttribute("stroke-width", "2");
        newCell.setAttribute("rx", "1");
        newCell.setAttribute("ry", "1");
        newCell.setAttribute("stroke", "black");
        newCell.setAttribute("fill", "black");

        gridGroup.appendChild(newCell);
      } else {
        const newCell = createElement("rect") as unknown as SVGRectElement;

        newCell.setAttribute("x", `${pos.x * CELL_SIZE}`);
        newCell.setAttribute("y", `${pos.y * CELL_SIZE}`);
        newCell.setAttribute("width", `${CELL_SIZE}`);
        newCell.setAttribute("height", `${CELL_SIZE}`);
        newCell.setAttribute("stroke-width", "1");
        newCell.setAttribute("stroke", "black");
        newCell.setAttribute("fill", "transparent");

        gridGroup.appendChild(newCell);
      }
    });

    canvas.appendChild(gridGroup);

    // -------- LAYER 2: clue layer
    const clueGroup = createElement("g");

    board.clues.entries().forEach(([id, { pos, val, dir }]) => {
      const newClue = createElement("g");

      const newText = createElement("text");

      newText.innerHTML = `${val}${dir.toUpperCase()}`;
      newText.dataset.clueId = id;
      newText.setAttribute("x", `${pos.x * CELL_SIZE + CELL_SIZE / 2}`);
      newText.setAttribute("y", `${pos.y * CELL_SIZE + CELL_SIZE / 2}`);
      newText.setAttribute("font-size", "21");
      newText.setAttribute("fill", "black");
      newText.setAttribute("text-anchor", "middle");

      newClue.appendChild(newText);
      clueGroup.appendChild(newClue);
    });

    canvas.appendChild(clueGroup);

    // -------- LAYER 3: object layer
    const objectGroup = createElement("g");

    board.blocks.entries().forEach(([id, pos]) => {
      const newCell = createElement("rect") as unknown as SVGRectElement;

      newCell.dataset.blockId = id;
      newCell.setAttribute(
        "x",
        `${pos.x * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2}`
      );
      newCell.setAttribute(
        "y",
        `${pos.y * CELL_SIZE + (CELL_SIZE - BLOCK_SIZE) / 2}`
      );
      newCell.setAttribute("width", `${BLOCK_SIZE}`);
      newCell.setAttribute("height", `${BLOCK_SIZE}`);
      newCell.setAttribute("stroke-width", "3");
      newCell.setAttribute("stroke", "black");
      newCell.setAttribute("fill", "#aaaaaaaa");

      objectGroup.appendChild(newCell);
    });

    const newPlayer = createElement("circle") as unknown as SVGRectElement;

    newPlayer.setAttribute("id", "player");
    newPlayer.setAttribute(
      "cx",
      `${board.player.x * CELL_SIZE + CELL_SIZE / 2}`
    );
    newPlayer.setAttribute(
      "cy",
      `${board.player.y * CELL_SIZE + CELL_SIZE / 2}`
    );
    newPlayer.setAttribute("r", `${BLOCK_SIZE / 2}`);
    newPlayer.setAttribute("fill", "#ff000066");

    objectGroup.appendChild(newPlayer);

    canvas.appendChild(objectGroup);

    // ------ Final attr adjustment
    const gridBorder = createElement("rect") as unknown as SVGRectElement;

    gridBorder.setAttribute("x", "0");
    gridBorder.setAttribute("y", "0");
    gridBorder.setAttribute("width", `${CELL_SIZE * board.puzzle.width}`);
    gridBorder.setAttribute("height", `${CELL_SIZE * board.puzzle.height}`);
    gridBorder.setAttribute("stroke-width", "4");
    gridBorder.setAttribute("stroke", "black");
    gridBorder.setAttribute("fill", "transparent");

    canvas.appendChild(gridBorder);

    canvas.setAttribute(
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
    player.setAttribute("cx", newCanvasPosX);
    player.setAttribute("cy", newCanvasPosY);
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
    block.setAttribute("x", newCanvasPosX);
    block.setAttribute("y", newCanvasPosY);
  }

  rerenderClue(id: string, isValid: boolean) {}
}
