const { ccclass, property } = cc._decorator;
import Block from './Block';
import BlockSpritePair from './BlockSpritePair';
import ObjectPool from './ObjectPool';

@ccclass
export default class BlockFactory extends cc.Component {

    @property(cc.Prefab)
    public blockPrefab: cc.Prefab = null;

    @property([BlockSpritePair])
    public blockPairs = [];

    public createRandom(parentNode: cc.Node): Block {
        const index = Math.floor(Math.random() * this.blockPairs.length);
        const pair = this.blockPairs[index];

        const blockNode = ObjectPool.Instance.getObject(this.blockPrefab, true);
        blockNode.setParent(parentNode);

        const blockComp = blockNode.getComponent(Block) || blockNode.addComponent(Block);
        blockComp.init(pair.blockType, pair.sprite);

        return blockComp;
    }
}