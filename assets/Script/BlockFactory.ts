const { ccclass, property } = cc._decorator;
import Block, { BlockType } from './Block';
import { BlockSpritePair, BlockPrefabPair } from './PairStructs';
import ObjectPool from './ObjectPool';
import Booster from './Booster';

@ccclass
export default class BlockFactory extends cc.Component {

    @property(cc.Prefab)
    private blockPrefab: cc.Prefab = null;

    @property([BlockSpritePair])
    private blockPairs = [];
    
    @property([BlockPrefabPair])
    private boosters = [];

    @property
    private regularBlockTypesCount: number = 4;

    public createRandom(parentNode: cc.Node): Block {
        const index = Math.floor(Math.random() * this.regularBlockTypesCount);
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
        return type < this.regularBlockTypesCount;
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