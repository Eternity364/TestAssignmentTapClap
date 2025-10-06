import Block from "./Block";
import Booster, { DestroyBlockInCell, VoidCallback } from "./Booster";
import Cell from "./Cell";
import Grid from "./Grid";

const { ccclass } = cc._decorator;

@ccclass
export default abstract class BoosterBlock extends Block {
    protected booster: Booster;

    public setBooster(booster: Booster): void {
        this.booster = booster;
    } 

    public executeBooster(
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ) 
    {
        this.booster.Execute(this, startCell, grid, TryToDestroyBlockInCell, OnFinish);
    }
}