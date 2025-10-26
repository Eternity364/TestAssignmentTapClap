import AudioController from "../AudioManager";
import Booster, { DestroyBlockInCell, VoidCallback } from "../Booster";
import BoosterBlock from "../BoosterBlock";
import Cell from "../Cell";
import Grid from "../Grid";
import SwitchBooster from "./Switch";

const { ccclass } = cc._decorator;

@ccclass("MegaBombBooster")
export default class MegaBombBooster implements Booster {
    private delayPerCell: number = 0.075;
    private animationPrefab: cc.Prefab = null;
    private rocketLaunch: cc.AudioClip = null;
    private rocketHit: cc.AudioClip = null;

    public Execute(
        activatedByTap: boolean,
        block: BoosterBlock,
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void {
        if (!grid || !this.animationPrefab) {
            OnFinish?.();
            return;
        }

        const params = grid.getGridParameters();
        const width = params.x;
        const height = params.y;
        const allCells: Cell[] = [];

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const cell = grid.getCellAt(row, col);
                if (cell && cell.getBlock()) {
                    allCells.push(cell);
                }
            }
        }

        if (allCells.length === 0) {
            OnFinish?.();
            return;
        }

        allCells.sort(() => Math.random() - 0.5);

        const startPos = grid.getCellPosition(
            grid.getCellCoords(startCell).y,
            grid.getCellCoords(startCell).x
        );

        const concaveStrength = 0.75;
        const duration = 0.7;

        allCells.forEach((cell, index) => {
            const block = cell.getBlock();
            if (!block) return;

            const pos2D = block.node.getPosition();
            const targetPos = cc.v3(pos2D.x, pos2D.y, 0);
            const delay = index * this.delayPerCell;

            cc.tween(grid.node)
                .delay(delay)
                .call(() => {
                    const projectile = cc.instantiate(this.animationPrefab);
                    projectile.parent = grid.getParent();
                    projectile.setPosition(startPos);
                    projectile.zIndex = 9999;

                    AudioController.Instance.playSound(this.rocketLaunch, false, 0.3);

                    const randomizedStrength = (concaveStrength  + (Math.random() / 4)) * (Math.random() > 0.5 ? 1 : -1)

                    SwitchBooster.MoveAlongBezierCurve(
                        projectile,
                        startPos,
                        targetPos,
                        duration,
                        () => {
                            AudioController.Instance.playSound(this.rocketHit, false, 0.3);
                            TryToDestroyBlockInCell(cell);
                            cc.tween(projectile)
                                .to(0.3, { opacity: 0 })
                                .call(() => projectile.destroy())
                                .start();
                        },
                        true,
                        180,
                        randomizedStrength
                    );
                })
                .start();
        });

        const totalDelay = allCells.length * this.delayPerCell + duration + 0.3;
        cc.tween(grid.node)
            .delay(totalDelay)
            .call(() => OnFinish?.())
            .start();
    }

    public setDelayPerCell(delay: number): void {
        this.delayPerCell = Math.max(0.005, delay);
    }

    public init(prefab: cc.Prefab, rocketLaunch: cc.AudioClip, rocketHit: cc.AudioClip): void {
        this.animationPrefab = prefab;
        this.rocketLaunch = rocketLaunch;
        this.rocketHit = rocketHit;
    }
}
