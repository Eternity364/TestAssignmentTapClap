import BoosterBlock from "../../BoosterBlock";
import BombBooster from "../../Boosters/Bomb";
import Cell from "../../Cell";
import Grid from "../../Grid";
import { DestroyBlockInCell, VoidCallback } from "../../Booster";
import ObjectPool from "../../ObjectPool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BombBlock extends BoosterBlock {
    @property
    private radius: number = 2;

    @property(cc.ParticleSystem)
    private preExplosionParticles: cc.ParticleSystem = null;

    @property(cc.ParticleSystem)
    private bombExplosionParticles: cc.ParticleSystem = null;

    onLoad() {
        const booster = new BombBooster();
        booster.setRadius(this.radius);
        this.setBooster(booster);
    }

    public override playDestroyAnimation(onComplete?: () => void): void { 
        if (onComplete) onComplete();
    }

public override executeBooster(
    activatedByTap: boolean,
    startCell: Cell,
    grid: Grid,
    TryToDestroyBlockInCell: DestroyBlockInCell,
    OnFinish: VoidCallback
    ): void {

        const mat = this.visualNode.getMaterial(0);

        const progressObj = { value: 0 };
        const alphaObj = { value: 1 };
        const shakeObj = { t: 0 };

        const updateAction = cc.repeatForever(cc.sequence(
            cc.callFunc(() => {
                mat.setProperty("progress", progressObj.value);
                mat.setProperty("alphaMultiplier", alphaObj.value);
            }),
            cc.delayTime(0)
        ));

        const originalPos = this.visualNode.node.position.clone();

        this.node.runAction(updateAction);

        const mainPart = () => {
            super.executeBooster(
                activatedByTap,
                startCell,
                grid,
                TryToDestroyBlockInCell,
                OnFinish
            );

            this.bombExplosionParticles.node.active = true;
            this.bombExplosionParticles.resetSystem();

            cc.tween(alphaObj)
                .to(0.2, { value: 0 }, { easing: "sineIn" })
                .call(() => {
                    this.node.stopAction(updateAction);
                    this.visualNode.node.setPosition(originalPos);
                    this.visualNode.node.active = false;
                })
                .delay(1.0)
                .call(() => {
                    this.bombExplosionParticles.stopSystem();
                    this.bombExplosionParticles.node.active = false;
                    ObjectPool.Instance.returnObject(this.node);
                })
                .start();
        };

        if (!activatedByTap) {
            mainPart();
            return;
        }
        
        this.preExplosionParticles.node.active = true;

        cc.tween(shakeObj)
            .to(1.5, { t: 1 }, {
                easing: "sineOut",
                onUpdate: () => {
                    const strength = 1 + 5 * shakeObj.t; 
                    const offsetX = (Math.random() - 0.5) * strength * 1.5;
                    const offsetY = (Math.random() - 0.5) * strength * 1.5;
                    this.visualNode.node.setPosition(
                        originalPos.x + offsetX,
                        originalPos.y + offsetY
                    );
                },
                onComplete: () => {
                    this.visualNode.node.setPosition(originalPos);
                }
            })
            .start();

        cc.tween(progressObj)
            .to(1.5, { value: 0.9 }, { easing: "cubicIn" })
            .call(() => {
                this.preExplosionParticles.node.opacity = this.preExplosionParticles.node.opacity || 255;

                cc.tween(this.preExplosionParticles.node)
                    .to(0.2, { opacity: 0 })
                    .call(() => {
                        this.preExplosionParticles.stopSystem();
                        this.preExplosionParticles.node.active = false;
                    })
                    .start();

                mainPart();
            })
            .start();
    }

}