import AbilityIcon from "./AbilityIcon";
import Ability from "./Boosters/Ability";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AbilityManager extends cc.Component {

    @property([cc.Node])
    public abilities: cc.Node[] = [];

    @property(cc.Prefab)
    public abilityIconPrefab: cc.Prefab = null;

    private abilityIcons: AbilityIcon[] = [];

    start() {
        this.abilities.forEach((abilityNode) => {
            const iconNode = cc.instantiate(this.abilityIconPrefab);
            iconNode.parent = this.node;

            const abilityIcon = iconNode.getComponent(AbilityIcon);
            if (!abilityIcon) return;

            abilityIcon.setIcon(abilityNode);

            const abilityComp = abilityNode.getComponent(Ability);
            abilityIcon.setText(abilityComp.getNumberOfUses().toString());

            abilityNode.on("OnAbilityUsed", (numberOfUses: number) => {
                abilityIcon.setText(numberOfUses.toString());
            }, this);

            this.abilityIcons.push(abilityIcon);
        });
    }
}
