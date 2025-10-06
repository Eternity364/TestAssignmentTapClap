import Block from "./Block";
import Cell from "./Cell";
import Grid from "./Grid";

const { ccclass } = cc._decorator;

type DestroyBlockInCell = (cell: Cell) => void;
type VoidCallback = () => void;

@ccclass
export default abstract class Booster extends Block {
    public abstract Execute(
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void;
}