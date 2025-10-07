const { ccclass, property } = cc._decorator;

import Cell from "../../Cell";
import Ability from "../Ability";
import SwitchBooster from "../Switch";

@ccclass
export default class ShuffleAbility extends Ability {
    private animationPlaying: boolean = false;

    protected override onLoad() {
        super.onLoad();
    }

    protected override onIconClick() {
        if (this.animationPlaying) return;
        if (!this.gridStable) return;
        if (this.blockManager.getGridLock() > 1) return;

        this.shuffleBoard();
    }
    
    protected override onGridStabilityChange(change: boolean) {
        super.onGridStabilityChange(change);
        if (change)
           this.checkIfNeedToReshuffle(); 
    }

    private checkIfNeedToReshuffle() {
        if (
            !this.grid.hasAnyGroupWithSize(this.blockManager.getMinCellCountToDestroy()) &&
            !this.grid.hasAnyBoostersOnBoard()
        ) {
            this.shuffleBoard();
        }
    }

    private shuffleBoard() {
        if (!this.grid) return;

        const allCells = this.grid.getAllCells().filter(c => c.getBlock());
        if (allCells.length < 2) return;

        this.animationPlaying = true;
        this.updateLock(true);

        for (let i = allCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
        }

        const pairs: [Cell, Cell][] = [];
        for (let i = 0; i < allCells.length - 1; i += 2) {
            pairs.push([allCells[i], allCells[i + 1]]);
        }

        let completed = 0;
        const totalPairs = pairs.length;

        const onPairFinished = () => {
            completed++;
            if (completed >= totalPairs) {
                this.animationPlaying = false;
                this.updateLock(false);
                this.checkIfNeedToReshuffle();
            }
        };

        for (const [cellA, cellB] of pairs) {
            const delay = Math.random() * 0.2;

            this.scheduleOnce(() => {
                SwitchBooster.swapPickedBlocks(cellA, cellB, onPairFinished);
            }, delay);
        }
    }
}
