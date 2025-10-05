const { ccclass, property } = cc._decorator;
import BlockFactory from './BlockFactory';
import Block from './Block';
import Cell from './Cell';

@ccclass
export default class Grid extends cc.Component {
    @property
    private width: number = 5;

    @property
    private height: number = 5;

    @property
    private cellSize: number = 100;

    @property(cc.Node)
    private parentNode1: cc.Node = null;

    @property(cc.Node)
    private backgroundNode: cc.Node = null;

    @property
    private bgPadding: number = 0;

    @property(BlockFactory)
    private blockFactory: BlockFactory = null;

    private cells: Cell[][] = [];
    private cellPositions: cc.Vec3[][] = [];
    private cellCoords: Map<Cell, cc.Vec2> = new Map();
    // private movingBlock: Block = null;
    // private lastCellRow: number = 0;
    // private lastCellCol: number = 0;
    // private moveDir: cc.Vec3 = cc.v3(0, 0, 0);

    start() {
        this.createGrid();

        // this.movingBlock = this.cells[0][0].getBlock(); 
        // this.lastCellRow = 0;
        // this.lastCellCol = 0;

        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    public getGridParameters() : cc.Vec2 {
        return new cc.Vec2(this.width, this.height);
    }

    public getCellAtPosition(pos: cc.Vec3): Cell | null {
        if (!this.cells || this.cells.length === 0) return null;

        const { offsetX, offsetY } = this.getGridOffset();
        const col = Math.floor((pos.x + offsetX + this.cellSize / 2) / this.cellSize);
        const row = Math.floor((offsetY + this.cellSize / 2 - pos.y) / this.cellSize);

        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return null;
        }
        
        cc.log(`Block moved to cell (${row}, ${col})`);
        return this.cells[row][col];
    }

    public getCellAtMousePosition(mouseEvent: cc.Event.EventMouse): Cell | null {
        if (!this.cells || this.cells.length === 0) return null;

        const worldPos = mouseEvent.getLocation();
        const nodePos2d = this.parentNode1.convertToNodeSpaceAR(worldPos);
        const nodePos = new cc.Vec3(nodePos2d.x, nodePos2d.y, 0);

        return this.getCellAtPosition(nodePos);
    }

    public getCellAt(row: number, col: number): Cell {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) 
            return null;
        
        return this.cells[row][col];
    }

    public getCellPosition(row: number, col: number): cc.Vec3 {
        return this.cellPositions[row][col];
    }

    public getCellRowCol(targetCell: Cell): { row: number, col: number } | null {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.cells[row][col] === targetCell) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    public isCellOccupied(row: number, col: number): boolean {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) return true;
        return this.cells[row][col].isOccupied();
    }

    public getCellCoords(cell: Cell): cc.Vec2 | null {
        return this.cellCoords.get(cell) || null;
    }

    public getParent(): cc.Node {
        return this.parentNode1;
    } 

    public getConnectedCellsOfSameType(mouseEvent: cc.Event.EventMouse): Cell[] {
        const startCell = this.getCellAtMousePosition(mouseEvent);
        if (!startCell || !startCell.getBlock()) return [];

        const startBlock = startCell.getBlock();
        const targetType = startBlock.blockType;
        const visited = new Set<Cell>();
        const stack: Cell[] = [startCell];
        const connected: Cell[] = [];

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || visited.has(current)) continue;
            visited.add(current);

            const coords = this.getCellCoords(current);
            if (!coords) continue;

            const { x: col, y: row } = coords;

            const neighbors = [
                this.getCellAt(row - 1, col),
                this.getCellAt(row + 1, col),
                this.getCellAt(row, col - 1),
                this.getCellAt(row, col + 1),
            ];

            for (const neighbor of neighbors) {
                if (
                    neighbor &&
                    !visited.has(neighbor) &&
                    neighbor.isOccupied() &&
                    neighbor.getBlock().blockType === targetType
                ) {
                    stack.push(neighbor);
                }
            }

            connected.push(current);
        }

        return connected;
    }

    private getGridOffset(): { offsetX: number, offsetY: number } {
        const offsetX = ((this.width - 1) * this.cellSize) / 2;
        const offsetY = ((this.height - 1) * this.cellSize) / 2;
        return { offsetX, offsetY };
    }

    private createGrid() {
        if (!this.parentNode1 || !this.blockFactory) return;

        this.cells = [];
        const { offsetX, offsetY } = this.getGridOffset();

        for (let row = 0; row < this.height; row++) {
            const rowCells: Cell[] = [];
            const rowPositions: cc.Vec3[] = [];
            for (let col = 0; col < this.width; col++) {
                const x = col * this.cellSize - offsetX;
                const y = offsetY - row * this.cellSize;
                const position = new cc.Vec3(x, y, 0);
                const cell = new Cell();
                
                this.cellCoords.set(cell, new cc.Vec2(col, row));
                rowCells.push(cell);
                rowPositions.push(position);
            }
            this.cells.push(rowCells);
            this.cellPositions.push(rowPositions);
        }      

        const totalWidth = this.width * this.cellSize;
        const totalHeight = this.height * this.cellSize;
        this.backgroundNode.setContentSize(totalWidth + this.bgPadding, totalHeight + this.bgPadding);

        this.node.emit('OnGridCreate', this);
    }

    // private onKeyDown(event: cc.Event.EventKeyboard) {
    //     switch (event.keyCode) {
    //         case cc.macro.KEY.up: this.moveDir.y = 1; break;
    //         case cc.macro.KEY.down: this.moveDir.y = -1; break;
    //         case cc.macro.KEY.left: this.moveDir.x = -1; break;
    //         case cc.macro.KEY.right: this.moveDir.x = 1; break;
    //     }
    // }

    // private onKeyUp(event: cc.Event.EventKeyboard) {
    //     switch (event.keyCode) {
    //         case cc.macro.KEY.up:
    //         case cc.macro.KEY.down: this.moveDir.y = 0; break;
    //         case cc.macro.KEY.left:
    //         case cc.macro.KEY.right: this.moveDir.x = 0; break;
    //     }
    // }


    // update(dt: number) {
    //     if (!this.movingBlock) return;

    //     const speed = 200; // units per second
    //     const deltaMove = this.moveDir.mul(speed * dt);
    //     this.movingBlock.node.position = this.movingBlock.node.position.add(deltaMove);
    //     this.getCellAtPosition(this.movingBlock.node.position);
    // }
}
