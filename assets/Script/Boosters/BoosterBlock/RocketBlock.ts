import BoosterBlock from "../../BoosterBlock";
import Rocket from "../../Boosters/Rocket";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RocketBlock extends BoosterBlock {
    @property(cc.Prefab)
    private animationPrefab: cc.Prefab = null;

    onLoad() {
        this.setBooster(new Rocket());
        const rocketBooster = this.booster as Rocket;
        rocketBooster.init(this.animationPrefab);
    }
}