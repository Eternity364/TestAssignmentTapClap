const {} = cc._decorator;
import { BlockType } from './Block';

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

const BlockNumberPair = cc.Class({
    name: 'BlockNumberPair',
    properties: {
        blockType: {
            default: BlockType.Empty,
            type: cc.Enum(BlockType)
        },
        number: {
            default: 0,
            type: cc.Integer
        }
    }
});

const BlockColorPair = cc.Class({
    name: 'BlockColorPair',
    properties: {
        blockType: {
            default: BlockType.Empty,
            type: cc.Enum(BlockType)
        },
        color: {
            default: null,
            type: cc.Color
        }
    }
});

export { BlockSpritePair, BlockPrefabPair, BlockNumberPair, BlockColorPair };