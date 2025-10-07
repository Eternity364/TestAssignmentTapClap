const { ccclass, property } = cc._decorator;

import Grid from "../Grid";
import BlockManager from "../BlocksManager";
import BlockMovementController from "../BlockMovementController";

@ccclass
export default abstract class Ability extends cc.Component {
    @property
    protected numberOfUses: number = 3;

    @property(Grid)
    protected grid: Grid = null;

    @property(BlockManager)
    protected blockManager: BlockManager = null;

    @property(BlockMovementController)
    protected blockMovementController: BlockMovementController = null;

    @property(cc.Node)
    public iconNode: cc.Node = null;

    protected boosterEnabled: boolean = false;
    protected gridStable: boolean = false;

    public getNumberOfUses(): number {
        return this.numberOfUses;
    }

    protected onLoad() {
        if (this.iconNode) {
            this.iconNode.on(cc.Node.EventType.MOUSE_DOWN, this.onIconClick, this);
        }

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        
        if (this.blockMovementController) {
            this.blockMovementController.node.on("OnGridStabilityChange", this.onGridStabilityChange, this);
        }
    }

    protected onUsed() {
        this.numberOfUses--;
        this.node.emit("OnAbilityUsed", this.numberOfUses);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode === cc.macro.KEY.space) {
           this.onIconClick();
        }
    }

    protected abstract onIconClick();

    protected updateLock(value: boolean) {
        this.blockManager.lockGrid(value ? 1 : -1);
    }

    protected onGridStabilityChange(change: boolean) {
        this.gridStable = change;
    }
}
