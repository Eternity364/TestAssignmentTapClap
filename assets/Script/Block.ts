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
        
        this.node.scale = 1;
        this.node.opacity = 255;
        this.visualNode.node.y = 0;
        this.node.zIndex = this.originalZIndex;

        this.visualNode.spriteFrame = sprite;
    }

    public playLandingAnimation() {
        if (!this.visualNode) return;

        const node = this.visualNode.node;
        const originalY = node.y;

        cc.Tween.stopAllByTarget(node);

        cc.tween(node)
            .to(0.08, { y: originalY + 15 }, { easing: "linear" })
            .to(0.12, { y: originalY }, { easing: "easeOutElastic" })
            .start();
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

        cc.tween(node)
            .to(
                duration,
                {
                    position: target,
                    opacity: 0
                },
                { easing: "sineInOut" }
            )
            .call(() => {
                ObjectPool.Instance.returnObject(this.node);
                if (onComplete) onComplete();
            })
            .start();
    }

}
