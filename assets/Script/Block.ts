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
    
    public activeTween: cc.Tween<cc.Node> | null = null;
    public targetCell: Cell | null = null;
    public originalZIndex: number = 0;

    public picked: boolean = false;

    protected start(): void {
        this.originalZIndex = this.node.zIndex;
    }

    public init(type: BlockType, sprite: cc.SpriteFrame) {
        this.blockType = type;

        if (!this.visualNode) {
            this.visualNode = this.getComponent(cc.Sprite);
            if (!this.visualNode) {
                this.visualNode = this.addComponent(cc.Sprite);
            }
        }
        
        this.visualNode.node.scale = 1;
        this.visualNode.node.opacity = 255;
        this.node.zIndex = this.originalZIndex;

        this.visualNode.spriteFrame = sprite;
    }

        public playLandingAnimation() {
        if (!this.visualNode) return;

        const node = this.visualNode.node;

        cc.Tween.stopAllByTarget(node);

        // ensure neutral start
        node.scaleX = 1;
        node.scaleY = 1;

        cc.tween(node)
            // quick squash: short and sharp
            .to(0.12, { scaleY: 0.6, scaleX: 1.05 }, { easing: "sineOut" })
            // big bounce: stretch up and narrow horizontally (jelly peak)
            .to(0.18, { scaleY: 1.15, scaleX: 0.87 }, { easing: "backOut" })
            // damped oscillations to settle (jelly wobble)
            .to(0.12, { scaleY: 0.9,  scaleX: 1.06 }, { easing: "sineInOut" })
            .to(0.12, { scaleY: 1.04, scaleX: 0.95 }, { easing: "sineInOut" })
            .to(0.10, { scaleY: 0.98, scaleX: 1.02 }, { easing: "sineInOut" })
            .to(0.08, { scaleY: 1.00, scaleX: 1.00 }, { easing: "sineOut" })
            .start();
    }
    public setZIndexToMaximum(max: boolean) {
        this.node.zIndex = max ? 9999 : this.originalZIndex;
    }

    public playDestroyAnimation(onComplete?: () => void) {
        if (!this.visualNode) return;

        const node = this.visualNode.node;
        node.scale = 1;
        node.opacity = 255;
        this.node.zIndex = 9999;

        cc.Tween.stopAllByTarget(node);

        cc.tween(node)
            .parallel(
                cc.tween().to(0.12, { scale: 1.15 }, { easing: "sineOut" }),
                cc.tween().to(0.12, { opacity: 255 }, { easing: "sineOut" })
            )
            .parallel(
                cc.tween().to(0.25, { scale: 0.0 }, { easing: "backIn" }),
                cc.tween().to(0.4, { opacity: 0 }, { easing: "sineIn" })
            )
            .call(() => {
                ObjectPool.Instance.returnObject(this.node);
                if (onComplete) onComplete();
            })
            .start();
    }

    public panToAndDestroyAnimation(target: cc.Vec3, duration: number, onComplete?: () => void) {
        if (!this.visualNode) return;

        const node = this.visualNode.node;
        node.scale = 1;
        node.opacity = 255;
        this.node.zIndex = 9999;

        cc.Tween.stopAllByTarget(node);
        cc.Tween.stopAllByTarget(this.node);

        const Finish = () => {
            ObjectPool.Instance.returnObject(this.node);
            if (onComplete) onComplete();
        };

        cc.tween(this.node)
            .to(duration, { position: target }, { easing: "sineInOut" })
            .start();

        cc.tween(node)
            .to(duration, { opacity: 0 }, { easing: "sineInOut" })
            .call(Finish)
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
