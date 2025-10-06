import Booster, { DestroyBlockInCell, VoidCallback } from "../Booster";
import BoosterBlock from "../BoosterBlock";
import Cell from "../Cell";
import Grid from "../Grid";
import { BlockType } from "../Block";

export default class Rocket implements Booster {
    public Execute(
        block: BoosterBlock,
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void {
        if (!block || !startCell || !grid) {
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

        if (block.blockType === BlockType.RocketsHorizontal) {
            targetCells = grid.getCellsInRow(startRow);
        } else if (block.blockType === BlockType.RocketsVertical) {
            targetCells = grid.getCellsInColumn(startCol);
        } else {
            OnFinish();
            return;
        }

        targetCells.forEach((cell) => {
            const coords = grid.getCellRowCol(cell);
            if (!coords) return;

            const distance =
                block.blockType === BlockType.RocketsHorizontal
                    ? Math.abs(coords.col - startCol)
                    : Math.abs(coords.row - startRow);

            if (cell !== startCell) {
                const delay = distance * delayPerCell;
                cc.tween(block.node)
                    .delay(delay)
                    .call(() => {
                        TryToDestroyBlockInCell(cell);
                    })
                    .start();
            }
        });

        const maxDistance = Math.max(
            ...targetCells.map((c) => {
                const coords = grid.getCellRowCol(c);
                if (!coords) return 0;
                return block.blockType === BlockType.RocketsHorizontal
                    ? Math.abs(coords.col - startCol)
                    : Math.abs(coords.row - startRow);
            })
        );

        const totalDelay = maxDistance * delayPerCell + 0.4;

        cc.tween(grid.node)
            .delay(totalDelay)
            .call(() => OnFinish())
            .start();
    }
}