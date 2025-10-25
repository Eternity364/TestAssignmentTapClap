import BoosterBlock from "../../BoosterBlock";
import MegaBomb from "../MegaBomb";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaBombBlock extends BoosterBlock {
    @property(cc.Prefab)
    private animationPrefab: cc.Prefab = null;

    onLoad() {
        this.setBooster(new MegaBomb());
        const megaBombBooster = this.booster as MegaBomb;
        megaBombBooster.init(this.animationPrefab);
    }
}