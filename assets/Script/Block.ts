const { ccclass, property } = cc._decorator;

export enum BlockType {
    Empty,
    Green,
    Purple,
    Red,
    Yellow
}

@ccclass
export default class Block extends cc.Component {
    @property
    public blockType: BlockType = BlockType.Empty;

    @property(cc.Sprite)
    public visualNode: cc.Sprite | null = null;

    public init(type: BlockType, sprite: cc.SpriteFrame) {
        this.blockType = type;
        if (!this.visualNode) {
            this.visualNode = this.getComponent(cc.Sprite);
            if (!this.visualNode) {
                this.visualNode = this.addComponent(cc.Sprite);
            }
        }
        this.visualNode.spriteFrame = sprite;
    }
}