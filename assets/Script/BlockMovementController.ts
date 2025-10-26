const { ccclass, property } = cc._decorator;
import Grid from "./Grid";
import Block from "./Block";
import BlockFactory from "./BlockFactory";
import BlockManager from "./BlocksManager";

@ccclass
export default class BlockMovementController extends cc.Component {
    @property(BlockManager)
    private blockManager: BlockManager = null;

    @property(Grid)
    private grid: Grid = null;

    @property(BlockFactory)
    private blockFactory: BlockFactory = null;
    
    @property
    private fallSpeed: number = 500;

    @property
    private spawnHeightOffset: number = 300;

    private fallingBlocks: { block: Block, col: number }[] = [];

    onLoad() {
        if (this.grid) {
            this.grid.node.on("OnGridCreate", this.refillGrid, this);
        }
        if (this.blockManager) {
            this.blockManager.node.on("OnBlocksDestroy", this.refillGrid, this);
        }
    }

    public refillGrid() {
        if (!this.grid || !this.blockFactory) return;

        const width = this.grid.getGridParameters().x;
        const height = this.grid.getGridParameters().y;
        
        this.spawnNewBlocks(width, height);
        this.moveExistingBlocksDown(width, height);
        this.adjustFallingBlocks(width, height);
    }

    public removeFallingBlock(block: Block) {
        this.fallingBlocks = this.fallingBlocks.filter(fb => fb.block !== block);
        block.activeTween.stop();
    }

    public getFallingBlocksInColumn(col: number): Block[] {
        return this.fallingBlocks
            .filter(fb => fb.col === col)
            .map(fb => fb.block);
    }

    private getNumberOfBlocksInGridPerColumn(): number[] {
        if (!this.grid) return [];

        const width = this.grid.getGridParameters().x;
        const height = this.grid.getGridParameters().y;

        const counts: number[] = Array(width).fill(0);

        for (let col = 0; col < width; col++) {
            for (let row = 0; row < height; row++) {
                if (this.grid.getCellAt(row, col).isOccupied()) {
                    counts[col]++;
                }
            }
        }

        return counts;
    }

    private spawnNewBlocks(width: number, height: number) {
        const blocksPerColumn = this.getNumberOfBlocksInGridPerColumn();

        for (let col = 0; col < width; col++) {
            const missingBlocks = height - blocksPerColumn[col] - this.fallingBlocks.filter(fb => fb.col === col).length;
            
            for (let i = 0; i < missingBlocks; i++) {
                const targetRow = i;
                const block = this.blockFactory.createRandom(this.grid.getParent());

                const initialRow = -2 - i;
                const targetPos = this.grid.getCellPosition(targetRow, col);
                const spawnY = this.grid.getCellPosition(0, col).y - this.grid.getCellSize() * initialRow;
                block.node.position = cc.v3(targetPos.x, spawnY, 0);
                block.setOpacity(0);

                this.fallingBlocks.push({ block, col });
            }
        }
    }

    private moveExistingBlocksDown(width: number, height: number): number[] {
        const nextFreeRow: number[] = Array(width).fill(height - 1);
        const mostBottomTargetRow: number[] = Array(width).fill(Number.POSITIVE_INFINITY);

        for (let col = 0; col < width; col++) {
            let hasBlocks = false;

            for (let row = height - 1; row >= 0; row--) {
                const cell = this.grid.getCellAt(row, col);
                const block = cell.getBlock();
                if (!block) {
                    if (mostBottomTargetRow[col] == Number.POSITIVE_INFINITY) 
                        mostBottomTargetRow[col] = row;
                    continue;
                }

                hasBlocks = true;
                const targetRow = nextFreeRow[col];

                if (targetRow === row) {
                    nextFreeRow[col]--;
                    continue;
                }

                cell.setBlock(null);
                this.fallingBlocks.push({ block, col });
                nextFreeRow[col]--;
            }
        }

        return mostBottomTargetRow;
    }

    private adjustFallingBlocks(width: number, height: number): void {
        if (!this.grid) return;

        const maxColumnDelay = 0.1;

        const blocksPerColumn: { block: Block; col: number }[][] = Array(width)
            .fill(0)
            .map(() => []);

        this.fallingBlocks.forEach(fb => {
            blocksPerColumn[fb.col].push(fb);
        });
        
        this.fallingBlocks = [];

        const mostBottomTargetRow = this.moveExistingBlocksDown(width, height);

        for (let col = 0; col < width; col++) {
            let counter = 0;
            const flyingBlocks = blocksPerColumn[col];
            flyingBlocks.sort((a, b) => a.block.node.position.y - b.block.node.position.y);

            const columnDelay = Math.random() * maxColumnDelay;

            if (mostBottomTargetRow[col] != Number.POSITIVE_INFINITY) {
                for (let row = mostBottomTargetRow[col]; row >= 0; row--) {
                    if (counter >= flyingBlocks.length) break;
                    this.animateBlockToCell(flyingBlocks[counter].block, row, col, columnDelay);
                    counter++;
                }
            }
        }

        if (this.fallingBlocks.length > 0)
            this.node.emit('OnGridStabilityChange', false);
    }

    private animateBlockToCell(block: Block, targetRow: number, targetCol: number, columnDelay: number = 0) {
        const targetPos = this.grid.getCellPosition(targetRow, targetCol);
        const distance = block.node.position.sub(targetPos).mag();
        const duration = distance / this.fallSpeed;

        if (block.activeTween) block.activeTween.stop();
        block.activeTween = cc.tween(block.node)
            .to(duration + columnDelay, { position: targetPos }, { easing: 'linear' })
            .call(() => {
                const targetCell = this.grid.getCellAt(targetRow, targetCol);
                targetCell.setBlock(block);

                const index = this.fallingBlocks.findIndex(fb => fb.block === block && fb.col === targetCol);
                if (index >= 0) this.fallingBlocks.splice(index, 1);
                block.playLandingAnimation();
                if (this.fallingBlocks.length == 0)
                    this.node.emit('OnGridStabilityChange', true);
            })
            .start();

        block.targetCell = this.grid.getCellAt(targetRow, targetCol);
        this.fallingBlocks.push({ block, col: targetCol });
    }

    update(dt: number) {
        this.updateFallingBlocksOpacity();
    }

    private updateFallingBlocksOpacity() {
        if (!this.grid || this.fallingBlocks.length === 0) return;

        const cellSize = this.grid.getCellSize();
        const referencePos = this.grid
            .getCellPosition(0, 0)
            .add(cc.v3(0, 2 * cellSize, 0));

        const upperYBoundary = referencePos.y;
        const lowerY = this.grid.getCellPosition(0, 0).y;

        for (const { block } of this.fallingBlocks) {
            const blockY = block.node.y;

            if (blockY > upperYBoundary) {
                block.setOpacity(0);
            } else if (blockY < lowerY) {
                block.setOpacity(1);
            } else {
                const t = (upperYBoundary - blockY) / (upperYBoundary - lowerY);
                block.setOpacity(t);
            }
        }
    }
}
