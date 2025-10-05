const { ccclass, property } = cc._decorator;
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

export default BlockSpritePair;