import BoosterBlock from "../../BoosterBlock";
import MegaBomb from "../MegaBomb";

const { ccclass } = cc._decorator;

@ccclass
export default class MegaBombBlock extends BoosterBlock {
    onLoad() {
        this.setBooster(new MegaBomb());
    }
}