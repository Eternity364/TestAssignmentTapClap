import Booster, { DestroyBlockInCell, VoidCallback } from "../Booster";
import BoosterBlock from "../BoosterBlock";
import Cell from "../Cell";
import Grid from "../Grid";

const { ccclass } = cc._decorator;

@ccclass("Bomb")
export default class Bomb implements Booster {
    private explosionRadius: number = 2;

    public Execute(
        activatedByTap: boolean,
        block: BoosterBlock,
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void {
        if (!startCell || !grid) {
            OnFinish?.();
            return;
        }

        const startCoords = grid.getCellRowCol(startCell);
        if (!startCoords) {
            OnFinish?.();
            return;
        }

        const { row: startRow, col: startCol } = startCoords;
        const affectedCells: Cell[] = [];

        for (let r = -this.explosionRadius; r <= this.explosionRadius; r++) {
            const cellH = grid.getCellAt(startRow + r, startCol);
            if (cellH) affectedCells.push(cellH);

            const cellV = grid.getCellAt(startRow, startCol + r);
            if (cellV) affectedCells.push(cellV);
        }

        const diagonalRadius = Math.max(0, this.explosionRadius - 1);
        for (let i = 1; i <= diagonalRadius; i++) {
            const c1 = grid.getCellAt(startRow + i, startCol + i);
            const c2 = grid.getCellAt(startRow + i, startCol - i);
            const c3 = grid.getCellAt(startRow - i, startCol + i);
            const c4 = grid.getCellAt(startRow - i, startCol - i);
            [c1, c2, c3, c4].forEach(c => { if (c) affectedCells.push(c); });
        }

        const uniqueCells = Array.from(new Set(affectedCells)).filter(c => c !== startCell);

        const delayPerStep = 0.05;
        uniqueCells.forEach((cell) => {
            const coords = grid.getCellRowCol(cell);
            if (!coords) return;

            const distance = Math.max(
                Math.abs(coords.row - startRow),
                Math.abs(coords.col - startCol)
            );

            const delay = distance * delayPerStep;

            cc.tween(block.node)
                .delay(delay)
                .call(() => {
                    TryToDestroyBlockInCell(cell);
                })
                .start();
        });

        const totalDelay = (this.explosionRadius + 1) * delayPerStep + 0.4;
        cc.tween(grid.node)
            .delay(totalDelay)
            .call(() => {
                OnFinish?.();
            })
            .start();
    }

    public setRadius(radius: number) {
        this.explosionRadius = Math.max(1, radius);
    }
}