import Booster from "../Booster";
import Cell from "../Cell";
import Grid from "../Grid";
import Block, { BlockType } from "../Block";
import BlockMovementController from "../BlockMovementController";

const { ccclass } = cc._decorator;

@ccclass
export default class Rocket extends Booster {

    public Execute(
        startCell: Cell,
        grid: Grid,
        DestroyBlockInCell: (cell: Cell) => void,
        OnFinish: () => void
    ): void {
        if (!startCell || !grid) {
            OnFinish();
            return;
        }

        const cellCoords = grid.getCellRowCol(startCell);
        if (!cellCoords) {
            OnFinish();
            return;
        }

        const { row: startRow, col: startCol } = cellCoords;
        const delayPerCell = 0.05;

        let targetCells: Cell[] = [];
        if (this.blockType === BlockType.RocketsHorizontal) {
            targetCells = grid.getCellsInRow(startRow);
        } else if (this.blockType === BlockType.RocketsVertical) {
            targetCells = grid.getCellsInColumn(startCol);
        } else {
            OnFinish();
            return;
        }

        targetCells.forEach((cell) => {
            const coords = grid.getCellRowCol(cell);
            if (!coords) return;

            const distance = this.blockType === BlockType.RocketsHorizontal
                ? Math.abs(coords.col - startCol)
                : Math.abs(coords.row - startRow);

            if (cell != startCell) {
                const delay = distance * delayPerCell;
                cc.tween(this.node)
                    .delay(delay)
                    .call(() => {
                        DestroyBlockInCell(cell);
                    })
                    .start();
            }
        });

        const maxDistance = Math.max(...targetCells.map(c => {
            const coords = grid.getCellRowCol(c);
            if (!coords) return 0;
            return this.blockType === BlockType.RocketsHorizontal
                ? Math.abs(coords.col - startCol)
                : Math.abs(coords.row - startRow);
        }));

        const totalDelay = maxDistance * delayPerCell + 0.4;
        cc.tween(grid.node)
            .delay(totalDelay)
            .call(() => {
                OnFinish();
            })
            .start();
    }
}
