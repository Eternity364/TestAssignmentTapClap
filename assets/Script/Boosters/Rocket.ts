import Booster, { DestroyBlockInCell, VoidCallback } from "../Booster";
import BoosterBlock from "../BoosterBlock";
import Cell from "../Cell";
import Grid from "../Grid";
import { BlockType } from "../Block";

export default class Rocket implements Booster {
    private animationPrefab: cc.Prefab = null;

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
        const delayPerCell = 0.075;

        let targetCells: Cell[] = [];

        if (block.blockType === BlockType.RocketsHorizontal) {
            targetCells = grid.getCellsInRow(startRow);
        } else if (block.blockType === BlockType.RocketsVertical) {
            targetCells = grid.getCellsInColumn(startCol);
        } else {
            OnFinish();
            return;
        }

        if (this.animationPrefab) {
            const gridNode = grid.node;
            const { x: cellX, y: cellY } = grid.getCellCoords(startCell);
            const startPos = grid.getCellPosition(cellY, cellX);

            const directions =
                block.blockType === BlockType.RocketsHorizontal
                    ? [cc.v2(-1, 0), cc.v2(1, 0)]
                    : [cc.v2(0, 1), cc.v2(0, -1)];

            const gridParams = grid.getGridParameters();
            const cellSize = grid.getCellSize();

            directions.forEach((dir) => {
                const rocket = cc.instantiate(this.animationPrefab);
                rocket.parent = grid.getParent();
                rocket.setPosition(startPos);
                rocket.zIndex = 9001;

                let angle = 0;
                if (block.blockType === BlockType.RocketsHorizontal) {
                    angle = dir.x < 0 ? 0 : 180;
                } else {
                    angle = dir.y < 0 ? 90 : -90;
                }
                rocket.angle = angle;

                let moveDistance = 0;
                if (block.blockType === BlockType.RocketsHorizontal) {
                    if (dir.x > 0) {
                        moveDistance = (gridParams.x - 1 - cellX) * cellSize;
                    } else {
                        moveDistance = cellX * cellSize;
                    }
                } else {
                    if (dir.y < 0) {
                        moveDistance = (gridParams.y - 1 - cellY) * cellSize;
                    } else {
                        moveDistance = cellY * cellSize;
                    }
                }

                moveDistance += 2 * cellSize;
                const totalCells = moveDistance / cellSize;

                const targetPos = cc.v3(
                    startPos.x + dir.x * moveDistance,
                    startPos.y + dir.y * moveDistance,
                    0
                );

                const rocketDelayPerCell = delayPerCell + 0.017;

                const fadeCells = 2;
                const fadeStartTime = Math.max(0, (totalCells - fadeCells) * (rocketDelayPerCell));
                const fadeDuration = fadeCells * (rocketDelayPerCell);

                cc.tween(rocket)
                    .to(fadeStartTime, { position: cc.v3(
                        startPos.x + dir.x * (moveDistance - fadeCells * cellSize),
                        startPos.y + dir.y * (moveDistance - fadeCells * cellSize),
                        0
                    )})
                    .to(fadeDuration, { 
                        position: targetPos, 
                        opacity: 0 
                    })
                    .call(() => rocket.destroy())
                    .start();
            });
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

    public init(prefab: cc.Prefab): void {
        this.animationPrefab = prefab;
    }
}
