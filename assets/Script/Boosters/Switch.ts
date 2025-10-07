const { ccclass, property } = cc._decorator;

import Cell from "../Cell";
import { VoidCallback } from "../Booster";

@ccclass
export default class SwitchBooster {
    public static swapPickedBlocks(cellA: Cell, cellB: Cell, onFinish: VoidCallback) {
        if (!cellA || !cellB) return;

        const blockA = cellA.getBlock();
        const blockB = cellB.getBlock();
        if (!blockA || !blockB) return;

        const posA = blockA.node.position.clone();
        const posB = blockB.node.position.clone();

        cellA.setBlock(blockB);
        cellB.setBlock(blockA);

        const duration = 0.35;

        const diff = posB.clone().subtract(posA);
        const distance = diff.len();
        const mid = posA.clone().add(posB).multiplyScalar(0.5);

        const baseArc = distance * 0.5;

        const perpendicular = new cc.Vec3(-diff.y, diff.x, 0).normalize();

        const minArc = 10; // pixels
        const arcHeight = Math.max(baseArc, minArc);

        const controlA = mid.add(perpendicular.clone().multiplyScalar(arcHeight));
        const controlB = mid.add(perpendicular.clone().multiplyScalar(-arcHeight));

        const bezierPoint = (t: number, p0: cc.Vec3, p1: cc.Vec3, p2: cc.Vec3): cc.Vec3 => {
            const inv = 1 - t;
            const x = inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x;
            const y = inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y;
            return new cc.Vec3(x, y, 0);
        };

        cc.tween({ t: 0 })
            .to(duration, { t: 1 }, {
                easing: "sineInOut",
                onUpdate: (obj: { t: number }) => {
                    const p = bezierPoint(obj.t, posA, controlA, posB);
                    blockA.node.setPosition(p);
                }
            })
            .start();

        cc.tween({ t: 0 })
            .to(duration, { t: 1 }, {
                easing: "sineInOut",
                onUpdate: (obj: { t: number }) => {
                    const p = bezierPoint(obj.t, posB, controlB, posA);
                    blockB.node.setPosition(p);
                }
            })
            .call(() => {
                onFinish?.();
                blockA.setPickedStatus(false);
                blockB.setPickedStatus(false);
            })
            .start();
    }
}
