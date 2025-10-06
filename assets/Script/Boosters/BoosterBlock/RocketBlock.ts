import BoosterBlock from "../../BoosterBlock";
import Rocket from "../../Boosters/Rocket";

const { ccclass } = cc._decorator;

@ccclass
export default class RocketBlock extends BoosterBlock {

    onLoad() {
        this.setBooster(new Rocket());
    }
}