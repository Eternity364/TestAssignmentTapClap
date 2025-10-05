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

        const cell: Cell = this.grid.getCellAtMousePosition(event);
        if (cell && cell.getBlock()) {
            const block: Block = cell.getBlock();
            block.node.destroy();
            cell.setBlock(null);
            this.node.emit('OnBlocksDestroy', this);
        }
    }
}