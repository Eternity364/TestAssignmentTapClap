import Booster, { DestroyBlockInCell, VoidCallback } from "../Booster";
import BoosterBlock from "../BoosterBlock";
import Cell from "../Cell";
import Grid from "../Grid";

const { ccclass } = cc._decorator;

@ccclass("MegaBombBooster")
export default class MegaBombBooster implements Booster {
    private delayPerCell: number = 0.03;

    public Execute(
        block: BoosterBlock,
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void {
        if (!grid) {
            OnFinish?.();
            return;
        }

        const params = grid.getGridParameters();
        const width = params.x;
        const height = params.y;

        const allCells: { cell: Cell; sum: number }[] = [];

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const cell = grid.getCellAt(row, col);
                if (cell) allCells.push({ cell, sum: row + col });
            }
        }

        allCells.sort((a, b) => a.sum - b.sum);
        
        allCells.forEach(({ cell }, index) => {
            const delay = index * this.delayPerCell;
            cc.tween(grid.node)
                .delay(delay)
                .call(() => TryToDestroyBlockInCell(cell))
                .start();
        });

        const totalDelay = allCells.length * this.delayPerCell + 0.05;
        cc.tween(grid.node)
            .delay(totalDelay)
            .call(() => {OnFinish?.()})
            .start();
    }

    public setDelayPerCell(delay: number): void {
        this.delayPerCell = Math.max(0.005, delay);
    }
}
