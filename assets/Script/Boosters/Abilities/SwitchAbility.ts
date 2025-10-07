const { ccclass, property } = cc._decorator;

import Cell from "../../Cell";
import SwitchBooster from "../Switch";
import Ability from "../Ability";

@ccclass
export default class SwitchAbility extends Ability {
    private animationPlaying: boolean = false;
    private firstPickedCell: Cell = null;
    private secondPickedCell: Cell = null;

    protected override onLoad() {
        super.onLoad();
        
        const canvas = cc.find("Canvas");
        canvas.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    protected override onIconClick() {
        const startBoosterEnabled = this.boosterEnabled;
        this.updateLock(!startBoosterEnabled);
        this.setEnabled(!this.boosterEnabled);
        if (this.boosterEnabled === startBoosterEnabled)
            this.updateLock(startBoosterEnabled);

    }

    private setEnabled(value: boolean) {
        if (this.animationPlaying) return;
        if (this.boosterEnabled === value) return;
        if (!this.gridStable) return;
        if (this.blockManager.getGridLock() > 1) return;
        if (value && this.numberOfUses <= 0) return;

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

        if (this.numberOfUses <= 0) return;

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
            this.onUsed();
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
