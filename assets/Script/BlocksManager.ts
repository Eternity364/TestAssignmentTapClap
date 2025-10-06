const { ccclass, property } = cc._decorator;
import Grid from './Grid';
import Cell from './Cell';
import Block, { BlockType } from './Block';
import BlockFactory from './BlockFactory';
import BoosterBlock from './BoosterBlock';

@ccclass
export default class BlockManager extends cc.Component {

    @property(Grid)
    private grid: Grid = null;
    
    @property(BlockFactory)
    private blockFactory: BlockFactory = null;

    @property
    private minCellCountToDestroy: number = 3;
    
    @property
    private minCellCountToSpawnBooster: number = 4;

    private inputLock : number = 0;

    onLoad() {
        const canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    private onMouseDown(event: cc.Event.EventMouse) {
        if (!this.grid) return;

        if (this.inputLock > 0) return;

        const cellUnderMouse: Cell = this.grid.getCellAtMousePosition(event);

        if (this.checkIfCellHasBooster(cellUnderMouse))
            return;

        this.tryDestroyZoneAndSpawnBooster(event);
    }

    private tryDestroyZoneAndSpawnBooster(event: cc.Event.EventMouse) {
        const cells: Cell[] = this.grid.getConnectedCellsOfSameType(event);
        const cellUnderMouse: Cell = this.grid.getCellAtMousePosition(event);

        if (cells.length >= this.minCellCountToDestroy) {
            for (let index = 0; index < cells.length; index++) {
                const cell = cells[index];
                this.tryToDestroyBlockInCell(cell);
            }
            if (cells.length >= this.minCellCountToSpawnBooster) {
                const block: Block = this.blockFactory.createBlockOfType(this.getBoosterType(cells.length), this.grid.getParent());
                cellUnderMouse.setBlock(block);
                this.grid.setBlockInCell(cellUnderMouse, block, true);
            }
            this.node.emit('OnBlocksDestroy', this);
        }
        else if (cellUnderMouse && cellUnderMouse.getBlock()) {
            const block: Block = cellUnderMouse.getBlock();
            block.playLandingAnimation();
        }
    }

    private getBoosterType(numberOfElements: number) : BlockType {
        if (numberOfElements >= 6)
            return BlockType.Bomb;
        if (numberOfElements >= 5)
            return BlockType.RocketsVertical;
        else if(numberOfElements >= 4)
            return BlockType.RocketsHorizontal;
        else 
            return BlockType.Empty;
    }

    private executeBooster(boosterBlock: BoosterBlock, cell: Cell) {
        this.lockGrid(1);
        boosterBlock.executeBooster(
            cell,
            this.grid,
            (cell) => this.tryToDestroyBlockInCell(cell),
            () => {
                this.lockGrid(-1);
            }
        );
    }

    private tryToDestroyBlockInCell(cell: Cell) {
        const block: Block = cell.getBlock();

        if (!block) return;
        
        block.playDestroyAnimation();
        cell.setBlock(null);
        const isBooster = !this.blockFactory.isRegular(block.blockType);
        if (isBooster) {
            this.executeBooster(block as BoosterBlock, cell);
        }
    }

    private lockGrid(lockValue: number) {
        this.inputLock += lockValue;
        if (this.inputLock == 0) 
            this.node.emit('OnBlocksDestroy', this);
    }

    private checkIfCellHasBooster(cell: Cell) : boolean {
        const block: Block = cell.getBlock();
        const isBooster = block && !this.blockFactory.isRegular(block.blockType);
        if (isBooster)
            this.tryToDestroyBlockInCell(cell);
        return isBooster;
    }
}