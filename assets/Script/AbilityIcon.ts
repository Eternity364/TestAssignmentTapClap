const { ccclass, property } = cc._decorator;

@ccclass
export default class AbilityIcon extends cc.Component {

    @property(cc.Node)
    private iconParentNode: cc.Node = null;

    @property(cc.Node)
    private textNode: cc.Node = null;

    private sprite: cc.Sprite = null;
    private label: cc.RichText = null;
    private spriteNode: cc.Node = null;

    onLoad() {
        if (this.spriteNode) {
            this.sprite = this.spriteNode.getComponent(cc.Sprite);
        }
        if (this.textNode) {
            this.label = this.textNode.getComponent(cc.RichText);
        }
    } 

    public setIcon(icon: cc.Node) {
        this.spriteNode = icon;
        this.spriteNode.setParent(this.iconParentNode);
        this.spriteNode.position = cc.Vec3.ZERO;
    }

    public setPicked(picked: boolean) {
        if (!this.sprite) return;

        if (picked) {
            this.sprite.node.color = cc.Color.GREEN;
        } else {
            this.sprite.node.color = cc.Color.WHITE;
        }
    }

    public setText(text: string) {
        if (!this.label) return;

        this.label.string = text;
    }
}