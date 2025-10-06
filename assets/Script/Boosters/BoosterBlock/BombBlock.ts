import BoosterBlock from "../../BoosterBlock";
import BombBooster from "../../Boosters/Bomb";
import Cell from "../../Cell";
import Grid from "../../Grid";
import { DestroyBlockInCell, VoidCallback } from "../../Booster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BombBlock extends BoosterBlock {
    @property
    private radius: number = 2;

    onLoad() {
        const booster = new BombBooster();
        booster.setRadius(this.radius);
        this.setBooster(booster);
    }

    public Execute(
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void {
        this.executeBooster(startCell, grid, TryToDestroyBlockInCell, () => {;
            OnFinish?.();
        });
    }
}