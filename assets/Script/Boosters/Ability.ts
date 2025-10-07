const { ccclass, property } = cc._decorator;

import Grid from "../Grid";
import BlockManager from "../BlocksManager";
import BlockMovementController from "../BlockMovementController";
import TurnsController from "../TurnsController";

@ccclass
export default abstract class Ability extends cc.Component {
    @property
    protected numberOfUses: number = 3;

    @property(Grid)
    protected grid: Grid = null;

    @property(BlockManager)
    protected blockManager: BlockManager = null;

    @property(TurnsController)
    protected turnsController: TurnsController = null;

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
            this.iconNode.on(cc.Node.EventType.TOUCH_START, this.onIconClick, this);
        }
        
        if (this.blockMovementController) {
            this.blockMovementController.node.on("OnGridStabilityChange", this.onGridStabilityChange, this);
        }
    }

    protected onUsed() {
        this.numberOfUses--;
        this.node.emit("OnAbilityUsed", this.numberOfUses);
        this.turnsController.Increment();
    }

    protected abstract onIconClick();

    protected updateLock(value: boolean) {
        this.blockManager.lockGrid(value ? 1 : -1);
    }

    protected onGridStabilityChange(change: boolean) {
        this.gridStable = change;
    }
}
