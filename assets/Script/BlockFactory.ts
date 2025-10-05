const { ccclass, property } = cc._decorator;
import Block from './Block';
import BlockSpritePair from './BlockSpritePair';

@ccclass
export default class BlockFactory extends cc.Component {

    @property(cc.Prefab)
    public blockPrefab: cc.Prefab = null;

    @property([BlockSpritePair])
    public blockPairs = [];

    public createRandom(parentNode: cc.Node): Block {
        if (!this.blockPrefab) {
            throw new Error("Block prefab not assigned in BlockFactory");
        }
        if (this.blockPairs.length === 0) {
            throw new Error("BlockFactory not configured with block pairs");
        }

        const index = Math.floor(Math.random() * this.blockPairs.length);
        const pair = this.blockPairs[index];

        const blockNode = cc.instantiate(this.blockPrefab);
        blockNode.setParent(parentNode);

        const blockComp = blockNode.getComponent(Block) || blockNode.addComponent(Block);
        blockComp.init(pair.blockType, pair.sprite);

        return blockComp;
    }
}