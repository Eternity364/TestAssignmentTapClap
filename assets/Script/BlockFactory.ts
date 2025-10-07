const { ccclass, property } = cc._decorator;
import Block, { BlockType } from './Block';
import { BlockSpritePair, BlockPrefabPair } from './PairStructs';
import ObjectPool from './ObjectPool';

@ccclass
export default class BlockFactory extends cc.Component {

    @property(cc.Prefab)
    private blockPrefab: cc.Prefab = null;

    @property([BlockSpritePair])
    private blockPairs = [];
    
    @property([BlockPrefabPair])
    private boosters = [];

    public createRandom(parentNode: cc.Node): Block {
        const index = Math.floor(Math.random() * this.getRegularBlockTypesCount());
        return this.createBlockOfType(index, parentNode);
    }

    public createBlockOfType(type: BlockType, parentNode: cc.Node): Block {
        const pair = this.blockPairs[type];

        let prefab = this.getBoosterOfType(type);
        if (!prefab)
            prefab = this.blockPrefab;
        const blockNode = ObjectPool.Instance.getObject(prefab, true);
        blockNode.setParent(parentNode);

        const blockComp = blockNode.getComponent(Block);
        blockComp.init(pair.blockType, pair.sprite);

        return blockComp;
    }

    public isRegular(type: BlockType): boolean {
        return this.getBoosterOfType(type) == null;
    }

    private getRegularBlockTypesCount(): number {
        return this.blockPairs.length - this.boosters.length;
    }

    private getBoosterOfType(type: BlockType): cc.Prefab | null {
        for (let i = 0; i < this.boosters.length; i++) {
            const booster = this.boosters[i].blockType;
            if (booster === type) {
                return this.boosters[i].prefab;
            }
        }
        return null;
    }
}