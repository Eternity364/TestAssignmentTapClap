const { ccclass, property } = cc._decorator;

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
    bgPadding: number = 0; // optional padding (in pixels) added around the grid background

    @property(cc.Prefab)
    block: cc.Prefab = null;

    private cellPositions: cc.Vec3[] = [];
    private blockNodes: cc.Node[] = [];

    start() {
        this.createGrid();
    }

    private createGrid() {
        if (!this.parentNode1 || !this.block) {
            console.warn("Parent node or cell prefab not assigned!");
            return;
        }

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

                const cell = cc.instantiate(this.block);
                cell.setParent(this.parentNode1);
                cell.position = position;

                this.blockNodes.push(cell);
            }
        }

        const totalWidth = this.width * this.cellSize;
        const totalHeight = this.height * this.cellSize;
        this.backgroundNode.setContentSize(totalWidth + this.bgPadding, totalHeight + this.bgPadding);
    }
}