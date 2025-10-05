const { ccclass, property } = cc._decorator;
import BlockFactory from './BlockFactory';
import Block from './Block';

@ccclass
export default class Grid extends cc.Component {

    @property
    width: number = 5;

    @property
    height: number = 5;

    @property
    cellSize: number = 100;

    @property(cc.Node)
    parentNode1: cc.Node = null;

    @property(cc.Node)
    backgroundNode: cc.Node = null;

    @property
    bgPadding: number = 0;

    @property(BlockFactory)
    blockFactory: BlockFactory = null;

    private cellPositions: cc.Vec3[] = [];
    private blockNodes: Block[] = [];

    start() {
        this.createGrid();
    }

    private createGrid() {
        this.cellPositions = [];
        this.blockNodes = [];

        const offsetX = ((this.width - 1) * this.cellSize) / 2;
        const offsetY = ((this.height - 1) * this.cellSize) / 2;

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const x = col * this.cellSize - offsetX;
                const y = offsetY - row * this.cellSize;
                const position = new cc.Vec3(x, y, 0);

                this.cellPositions.push(position);

                const block = this.blockFactory.createRandom(this.parentNode1);
                block.node.position = position;

                this.blockNodes.push(block);
            }
        }

        const totalWidth = this.width * this.cellSize;
        const totalHeight = this.height * this.cellSize;
        this.backgroundNode.setContentSize(totalWidth + this.bgPadding, totalHeight + this.bgPadding);
    }
}