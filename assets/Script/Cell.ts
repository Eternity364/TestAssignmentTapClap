import Block from './Block';

export default class Cell {
    private block: Block | null = null;

    public isOccupied(): boolean {
        return this.block !== null;
    }

    public setBlock(block: Block | null) {
        this.block = block;
    }

    public getBlock(): Block | null {
        return this.block;
    }
}