const { ccclass, property } = cc._decorator;

import Grid from "../../Grid";
import Cell from "../../Cell";
import BlockManager from "../../BlocksManager";
import SwitchBooster from "../Switch";
import Switch from "../Switch";
import BlockMovementController from "../../BlockMovementController";

@ccclass
export default class SwitchAbility extends cc.Component {
    @property(Grid)
    private grid: Grid = null;

    @property(BlockManager)
    private blockManager: BlockManager = null;

    @property(BlockMovementController)
    private blockMovementController: BlockMovementController = null;

    @property(cc.Node)
    private iconNode: cc.Node = null;

    private boosterEnabled: boolean = false;
    private animationPlaying: boolean = false;
    private gridStable: boolean = false;
    private firstPickedCell: Cell = null;
    private secondPickedCell: Cell = null;

    onLoad() {
        if (this.iconNode) {
            this.iconNode.on(cc.Node.EventType.MOUSE_DOWN, this.onIconClick, this);
        }

        const canvas = cc.find("Canvas");
        canvas.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        
        if (this.blockMovementController) {
            this.blockMovementController.node.on("OnGridStabilityChange", this.onGridStabilityChange, this);
        }
    }

    private onGridStabilityChange(change: boolean) {
        this.gridStable = change;
        cc.log("Grid stability changed to " + this.gridStable);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode === cc.macro.KEY.space) {
           this.onIconClick();
        }
    }

    private onIconClick() {
        const startBoosterEnabled = this.boosterEnabled;
        this.updateLock(!startBoosterEnabled);
        this.setEnabled(!this.boosterEnabled);
        if (this.boosterEnabled === startBoosterEnabled)
            this.updateLock(startBoosterEnabled);

    }

    private updateLock(value: boolean) {
        this.blockManager.lockGrid(value ? 1 : -1);
    }

    private setEnabled(value: boolean) {
        if (this.animationPlaying) return;
        if (this.boosterEnabled === value) return;
        if (!this.gridStable) return;
        if (this.blockManager.getGridLock() > 1) return;

        this.boosterEnabled = value;

        if (!this.boosterEnabled) {
            this.unpickAll();
        }

        if (this.iconNode) {
            this.iconNode.opacity = this.boosterEnabled ? 255 : 180;
        };
        
        this.updateIconVisual();
    }

    private updateIconVisual() {
        if (!this.iconNode) return;

        const sprite = this.iconNode.getComponent(cc.Sprite);
        if (!sprite) return;

        if (this.boosterEnabled) {
            sprite.node.color = cc.Color.GREEN;
            sprite.node.opacity = 255;
        } else {
            sprite.node.color = cc.Color.WHITE;
            sprite.node.opacity = 180;
        }
    }

    private onMouseDown(event: cc.Event.EventMouse) {
        if (!this.boosterEnabled || !this.grid) return;

        const cell = this.grid.getCellAtMousePosition(event);
        if (!cell) return;

        const block = cell.getBlock();
        if (!block) return;

        if (this.firstPickedCell === cell) return;

        if (!this.firstPickedCell) {
            this.firstPickedCell = cell;
            block.setPickedStatus(true);
            return;
        }

        if (!this.secondPickedCell) {
            this.secondPickedCell = cell;
            block.setPickedStatus(true);
            SwitchBooster.swapPickedBlocks(this.firstPickedCell, this.secondPickedCell, () => {
                this.animationPlaying = false;
                this.firstPickedCell = null;
                this.secondPickedCell = null;
                this.onIconClick();
            });
        }
    }

    private unpickAll() {
        if (this.firstPickedCell && this.firstPickedCell.getBlock()) {
            this.firstPickedCell.getBlock().setPickedStatus(false);
        }
        if (this.secondPickedCell && this.secondPickedCell.getBlock()) {
            this.secondPickedCell.getBlock().setPickedStatus(false);
        }
        this.firstPickedCell = null;
        this.secondPickedCell = null;
    }
}
