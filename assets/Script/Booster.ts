import BoosterBlock from "./BoosterBlock";
import Cell from "./Cell";
import Grid from "./Grid";

export type DestroyBlockInCell = (cell: Cell) => void;
export type VoidCallback = () => void;

export default interface Booster {
    Execute(
        activatedByTap: boolean,
        block: BoosterBlock,
        startCell: Cell,
        grid: Grid,
        TryToDestroyBlockInCell: DestroyBlockInCell,
        OnFinish: VoidCallback
    ): void;
}