const { ccclass, property } = cc._decorator;
import Grid from './Grid';
import Cell from './Cell';
import Block, { BlockType } from './Block';
import BlockFactory from './BlockFactory';
import BoosterBlock from './BoosterBlock';
import { BlockNumberPair } from './PairStructs';
import TurnsController from './TurnsController';
import PointsController from './PointsController';

@ccclass
export default class BlockManager extends cc.Component {

    @property(Grid)
    private grid: Grid = null;
    
    @property(BlockFactory)
    private blockFactory: BlockFactory = null;
    
    @property(TurnsController)
    protected turnsController: TurnsController = null;

    @property(PointsController)
    protected pointsController: PointsController = null;

    @property
    private minCellCountToDestroy: number = 3;  

    @property([BlockNumberPair])
    private minCellCountsToSpawnBooster = [];

    private inputLock : number = 0;
    private minCellCountToSpawnBooster: number;

    onLoad() {
        const canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);

        this.minCellCountToSpawnBooster = this.minCellCountsToSpawnBooster.length > 0
            ? Math.min(...this.minCellCountsToSpawnBooster.map(pair => pair.number))
            : Number.MAX_SAFE_INTEGER;
        //this.minCellCountToSpawnBooster = Number.MAX_SAFE_INTEGER;
    }
    
    public test(event) {
       this.grid.node.position = this.grid.node.position.add(new cc.Vec3(event.getLocation(), 0, 0));
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

    private getMinimumCellCountToSpawnBooster(type: BlockType) : number {
        for (let i = 0; i < this.minCellCountsToSpawnBooster.length; i++) {
            const pair = this.minCellCountsToSpawnBooster[i];
            if (pair.blockType === type)
                return pair.number;
        }
        return Number.MAX_SAFE_INTEGER;
    }

    private onMouseDown(event: cc.Event.EventTouch) {
        if (!this.grid) return;

        if (this.inputLock > 0) return;

        const cellUnderMouse: Cell = this.grid.getCellAtMousePosition(event);

        if (this.checkIfCellHasBooster(cellUnderMouse))
            return;

        this.tryDestroyZoneAndSpawnBooster(event);
    }

    private tryDestroyZoneAndSpawnBooster(event: cc.Event.EventTouch) {
        const cellUnderMouse: Cell = this.grid.getCellAtMousePosition(event);
        const cells: Cell[] = this.grid.getConnectedCellsOfSameType(cellUnderMouse);

        if (cells.length >= this.minCellCountToDestroy) {
            this.turnsController.Increment();
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
                    this.destroyBlockInCell(cell);
                    
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
        if (numberOfElements >= this.getMinimumCellCountToSpawnBooster(BlockType.MegaBomb))
            return BlockType.MegaBomb;
        else if (numberOfElements >= this.getMinimumCellCountToSpawnBooster(BlockType.Bomb))
            return BlockType.Bomb;
        else if (numberOfElements >= this.getMinimumCellCountToSpawnBooster(BlockType.RocketsVertical))
            return BlockType.RocketsVertical;
        else if (numberOfElements >= this.getMinimumCellCountToSpawnBooster(BlockType.RocketsHorizontal))
            return BlockType.RocketsHorizontal;
        else 
            return BlockType.Empty;
        //return BlockType.RocketsHorizontal;
    }

    private executeBooster(boosterBlock: BoosterBlock, cell: Cell, activatedByTap: boolean = false) {
        this.lockGrid(1);
        boosterBlock.executeBooster(
            activatedByTap,
            cell,
            this.grid,
            (cell) => this.tryToDestroyBlockInCell(cell),
            () => {
                this.lockGrid(-1);
            }
        );
    }

    private tryToDestroyBlockInCell(cell: Cell, activatedByTap: boolean = false) {
        const block: Block = cell.getBlock();

        if (!block) return;
        
        this.lockGrid(1);
        block.playDestroyAnimation(() => {
            this.lockGrid(-1);
        });
        this.destroyBlockInCell(cell);
        const isBooster = !this.blockFactory.isRegular(block.blockType);
        if (isBooster) {
            this.executeBooster(block as BoosterBlock, cell, activatedByTap);
        }
    }

    private destroyBlockInCell(cell: Cell) {
        this.pointsController.Increase(cell.getBlock().blockType);
        cell.setBlock(null);
    }

    private checkIfCellHasBooster(cell: Cell) : boolean {
        const block: Block = cell.getBlock();
        const isBooster = block && !this.blockFactory.isRegular(block.blockType);
        if (isBooster) {
            this.tryToDestroyBlockInCell(cell, true);
            this.turnsController.Increment();
        }
        return isBooster;
    }
}