const { ccclass } = cc._decorator;

import Cell from "../Cell";
import { VoidCallback } from "../Booster";

@ccclass
export default class SwitchBooster {
    public static MoveAlongBezierCurve(
        node: cc.Node,
        start: cc.Vec3,
        end: cc.Vec3,
        duration: number,
        onFinish?: VoidCallback,
        changeAngle: boolean = false,
        orientationOffset: number = 0,
        concaveStrength: number = 0.5
    ): void {
        // --- internal control point calculation ---
        const diff = end.clone().subtract(start);
        const distance = diff.len();
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const perpendicular = new cc.Vec3(-diff.y, diff.x, 0).normalize();

        const minArc = 10;
        const arcHeight = Math.max(distance * concaveStrength, minArc);
        const control = mid.add(perpendicular.multiplyScalar(arcHeight));

        // --- Bezier evaluation helpers ---
        const bezierPoint = (t: number, p0: cc.Vec3, p1: cc.Vec3, p2: cc.Vec3): cc.Vec3 => {
            const inv = 1 - t;
            const x = inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x;
            const y = inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y;
            return new cc.Vec3(x, y, 0);
        };

        const bezierTangent = (t: number, p0: cc.Vec3, p1: cc.Vec3, p2: cc.Vec3): cc.Vec3 => {
            const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
            const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
            return new cc.Vec3(x, y, 0);
        };

        const obj = { t: 0 };
        const originalAngle = node.angle;

        // --- Tween movement ---
        cc.tween(obj)
            .to(duration, { t: 1 }, {
                easing: "sineInOut",
                onUpdate: (o: { t: number }) => {
                    const p = bezierPoint(o.t, start, control, end);
                    node.setPosition(p);

                    if (changeAngle) {
                        const tangent = bezierTangent(o.t, start, control, end);
                        if (Math.abs(tangent.x) > 1e-4 || Math.abs(tangent.y) > 1e-4) {
                            const angleDeg = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI);
                            node.angle = angleDeg + orientationOffset;
                        }
                    }
                }
            })
            .call(() => {
                node.setPosition(end);

                if (changeAngle) {
                    const tangent = bezierTangent(0.9999, start, control, end);
                    if (Math.abs(tangent.x) > 1e-4 || Math.abs(tangent.y) > 1e-4) {
                        const angleDeg = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI);
                        node.angle = angleDeg + orientationOffset;
                    } else {
                        node.angle = originalAngle + orientationOffset;
                    }
                }

                onFinish?.();
            })
            .start();
    }

    public static swapPickedBlocks(
        cellA: Cell,
        cellB: Cell,
        onFinish: VoidCallback,
        concaveStrength: number = 0.5
    ): void {
        if (!cellA || !cellB) return;

        const blockA = cellA.getBlock();
        const blockB = cellB.getBlock();
        if (!blockA || !blockB) return;

        const posA = blockA.node.position.clone();
        const posB = blockB.node.position.clone();

        cellA.setBlock(blockB);
        cellB.setBlock(blockA);

        const duration = 0.35;
        const orientationOffset = 0;

        // both movements share same control-point generation logic inside MoveAlongBezierCurve
        SwitchBooster.MoveAlongBezierCurve(
            blockA.node, posA, posB, duration, undefined, false, orientationOffset, concaveStrength
        );

        SwitchBooster.MoveAlongBezierCurve(
            blockB.node, posB, posA, duration, () => {
                onFinish?.();
                blockA.setPickedStatus(false);
                blockB.setPickedStatus(false);
            },
            false,
            orientationOffset,
            concaveStrength
        );
    }
}
