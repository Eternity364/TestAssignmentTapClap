const { ccclass, property } = cc._decorator;
import Grid from './Grid';
import Cell from './Cell';
import Block from './Block';

@ccclass
export default class BlockManager extends cc.Component {

    @property(Grid)
    grid: Grid = null;

    onLoad() {
        const canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    private onMouseDown(event: cc.Event.EventMouse) {
        if (!this.grid) return;

        const cells: Cell[] = this.grid.getConnectedCellsOfSameType(event);
        for (let index = 0; index < cells.length; index++) {
                const cell = cells[index];
                const block: Block = cell.getBlock();
                block.playDestroyAnimation();
                cell.setBlock(null);
        }
        this.node.emit('OnBlocksDestroy', this);
    }
}