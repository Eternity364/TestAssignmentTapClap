import Cell from "./Cell";
import ObjectPool from "./ObjectPool";

const { ccclass, property } = cc._decorator;

export enum BlockType {
    Green,
    Purple,
    Red,
    Yellow,
    RocketsHorizontal,
    RocketsVertical,
    Bomb,
    MegaBomb,
    Empty
}

@ccclass
export default class Block extends cc.Component {
    @property({
        type: cc.Enum(BlockType)
    })
    public blockType: BlockType = BlockType.Empty;

    @property(cc.Sprite)
    public visualNode: cc.Sprite | null = null;

    @property(cc.ParticleSystem)
    public explosionParticles: cc.ParticleSystem | null = null;

    public activeTween: cc.Tween<cc.Node> | null = null;
    public targetCell: Cell | null = null;
    public originalZIndex: number = 0;
    private particleColor: cc.Color = cc.Color.WHITE;

    public picked: boolean = false;
    protected isBooster = false;

    protected start(): void {
        this.originalZIndex = this.node.zIndex;
    }

    public init(type: BlockType, sprite: cc.SpriteFrame, particleColor: cc.Color): void {
        this.blockType = type;
        this.particleColor = particleColor;

        if (!this.visualNode) {
            this.visualNode = this.getComponent(cc.Sprite);
            if (!this.visualNode) {
                this.visualNode = this.addComponent(cc.Sprite);
            }
        }
        

        this.visualNode.node.active = true;
        this.visualNode.spriteFrame = sprite;
        this.visualNode.node.scale = 1;
        this.visualNode.node.active = true;
        this.node.zIndex = this.originalZIndex;        
        const mat = this.visualNode.getMaterial(0);      
        mat.setProperty("alphaMultiplier", 1);
        mat.setProperty("progress", 0);
    }

        public playLandingAnimation() {
        if (!this.visualNode) return;

        const node = this.visualNode.node;

        cc.Tween.stopAllByTarget(node);

        node.scaleX = 1;
        node.scaleY = 1;

        cc.tween(node)
            .to(0.12, { scaleY: 0.6, scaleX: 1.05 }, { easing: "sineOut" })
            .to(0.18, { scaleY: 1.15, scaleX: 0.87 }, { easing: "backOut" })
            .to(0.12, { scaleY: 0.9,  scaleX: 1.06 }, { easing: "sineInOut" })
            .to(0.12, { scaleY: 1.04, scaleX: 0.95 }, { easing: "sineInOut" })
            .to(0.10, { scaleY: 0.98, scaleX: 1.02 }, { easing: "sineInOut" })
            .to(0.08, { scaleY: 1.00, scaleX: 1.00 }, { easing: "sineOut" })
            .start();
    }
    public setZIndexToMaximum(max: boolean) {
        this.node.zIndex = max ? 9000 : this.originalZIndex;
    }

    public playDestroyAnimation(onComplete?: () => void) {
        if (!this.visualNode) return;

        if (this.isBooster) {
            if (onComplete) onComplete();
            ObjectPool.Instance.returnObject(this.node);
            return;
        }

        const node = this.visualNode.node;
        node.scale = 1;
        node.opacity = 255;
        this.node.zIndex = 9000;

        cc.Tween.stopAllByTarget(node);

        const mat = this.visualNode.getMaterial(0);

        const progressObj = { value: 0 };
        const alphaObj = { value: 1 };

        const updateAction = cc.repeatForever(cc.sequence(
            cc.callFunc(() => {
                mat.setProperty("progress", progressObj.value);
                mat.setProperty("alphaMultiplier", alphaObj.value);
            }),
            cc.delayTime(0)
        ));

        this.node.runAction(updateAction);

        cc.tween(progressObj)
            .to(0.2, { value: 1 }, { easing: "sineOut" })
            .call(() => {
                cc.tween(alphaObj)
                    .to(0.1, { value: 0 }, { easing: "sineIn" })
                    .call(() => {
                        this.node.stopAction(updateAction);
                        if (onComplete) onComplete();
                        node.active = false;
                    })
                    .start();
            })
            .start();

        
        this.explosionParticles.startColor = this.particleColor;
        this.explosionParticles.endColor = this.particleColor;
            
        
        cc.tween(this.node)
            .delay(0.1)
            .call(() => {   
                this.explosionParticles.node.active = true;
                this.explosionParticles.resetSystem();
                let maxLifetime = this.explosionParticles.life + this.explosionParticles.lifeVar;
                let waitTime = maxLifetime + 0.1;
                cc.tween(this.node)
                    .delay(waitTime)
                    .call(() => {
                        ObjectPool.Instance.returnObject(this.node);
                        this.explosionParticles.node.active = false;
                    })
                    .start();
            })
            .start();
    }

    public panToAndDestroyAnimation(target: cc.Vec3, duration: number, onComplete?: () => void) {
        if (!this.visualNode) return;

        const node = this.visualNode.node;
        node.scale = 1;
        node.opacity = 255;
        this.node.zIndex = 9000;

        cc.Tween.stopAllByTarget(node);
        cc.Tween.stopAllByTarget(this.node);

        const Finish = () => {
            ObjectPool.Instance.returnObject(this.node);
            if (onComplete) onComplete();
        };

        cc.tween(this.node)
            .to(duration, { position: target }, { easing: "sineInOut" })
            .start();

        const mat = this.visualNode.getMaterial(0);

        const alphaObj = { value: 1 };

        const updateAction = cc.repeatForever(cc.sequence(
            cc.callFunc(() => {
            mat.setProperty("alphaMultiplier", alphaObj.value);
            }),
            cc.delayTime(0)
        ));

        this.node.runAction(updateAction);

        cc.tween(alphaObj)
            .to(duration, { value: 0 }, { easing: "sineInOut" })
            .call(() => {
                this.node.stopAction(updateAction);
                Finish();
            })
            .start();
    }

    public setPickedStatus(value: boolean): void {
        this.picked = value;
        cc.Tween.stopAllByTarget(this.node);
        this.setZIndexToMaximum(value);

        let scaleValue: number = value ? 1.2 : 1;
        cc.tween(this.node)
            .to(0.15, { scale: scaleValue }, { easing: "sineOut" })
            .start();
    }
}
