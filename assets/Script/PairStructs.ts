const {} = cc._decorator;
import { BlockType } from './Block';

// Existing pair for block type → sprite
const BlockSpritePair = cc.Class({
    name: 'BlockSpritePair',
    properties: {
        blockType: {
            default: BlockType.Empty,
            type: cc.Enum(BlockType)
        },
        sprite: {
            default: null,
            type: cc.SpriteFrame
        }
    }
});

const BlockPrefabPair = cc.Class({
    name: 'BlockPrefabPair',
    properties: {
        blockType: {
            default: BlockType.Empty,
            type: cc.Enum(BlockType)
        },
        prefab: {
            default: null,
            type: cc.Prefab
        }
    }
});

export { BlockSpritePair, BlockPrefabPair };