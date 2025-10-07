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
    
    public getGridLock() : number {
        return this.inputLock;
    }
    
    public getMinCellCountToDestroy() : number {
        return this.minCellCountToDestroy;
    }

    public lockGrid(lockValue: number) {
        this.inputLock += lockValue;
        if (this.inputLock == 0) 
            this.node.emit('OnBlocksDestroy', this);
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
        const cellUnderMouse: Cell = this.grid.getCellAtMousePosition(event);
        const cells: Cell[] = this.grid.getConnectedCellsOfSameType(cellUnderMouse);

        if (cells.length >= this.minCellCountToDestroy) {
            if (cells.length < this.minCellCountToSpawnBooster) {
                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    this.tryToDestroyBlockInCell(cell);
                }
                this.lockGrid(0);
            }
            else {
                this.lockGrid(1);
                const boosterBlock: Block = this.blockFactory.createBlockOfType(
                    this.getBoosterType(cells.length),
                    this.grid.getParent()
                );
                
                const cellCoord = this.grid.getCellCoords(cellUnderMouse);
                const boosterTarget = this.grid.getCellPosition(cellCoord.y, cellCoord.x);
                const baseDuration = 0.45;
                let longestDelay = 0;
                let durationArray: number[] = [];
                const longestOnComplete = () => {
                    this.lockGrid(-1);
                };

                for (let i = 0; i < cells.length; i++) {
                    durationArray[i] = baseDuration + (Math.random() - 0.5) * 0.1;
                    longestDelay = Math.max(longestDelay, durationArray[i]);
                }

                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    const block = cell.getBlock();
                    if (!block) continue;
                    cell.setBlock(null);
                    
                    let onCompleteForCell: () => void = () => {};
                    const duration = durationArray[i];
                    if (duration == longestDelay) {
                        onCompleteForCell = longestOnComplete;
                    }
                    block.panToAndDestroyAnimation(boosterTarget, durationArray[i], onCompleteForCell);
                }
                
                this.grid.setBlockInCell(cellUnderMouse, boosterBlock, true);
            }
        } 
        else if (cellUnderMouse && cellUnderMouse.getBlock()) {
            const block: Block = cellUnderMouse.getBlock();
            block.playLandingAnimation();
        }
    }


    private getBoosterType(numberOfElements: number) : BlockType {
        if (numberOfElements >= 8)
            return BlockType.MegaBomb;
        else if (numberOfElements >= 6)
            return BlockType.Bomb;
        else if (numberOfElements >= 5)
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

    private checkIfCellHasBooster(cell: Cell) : boolean {
        const block: Block = cell.getBlock();
        const isBooster = block && !this.blockFactory.isRegular(block.blockType);
        if (isBooster)
            this.tryToDestroyBlockInCell(cell);
        return isBooster;
    }
}