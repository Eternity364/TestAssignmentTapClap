const { ccclass, property } = cc._decorator;

@ccclass
export default class StatisticsPanel extends cc.Component {

    @property(cc.Label)
    private turnsLabel: cc.Label = null;

    @property(cc.Label)
    private pointsLabel: cc.Label = null;

    public SetTurns(current: number, max: number): void {
        if (!this.turnsLabel) return;
        this.turnsLabel.string = `${current} / ${max}`;
    }

    public SetPoints(current: number, target: number): void {
        if (!this.pointsLabel) return;
        this.pointsLabel.string = `${current} / ${target}`;
    }
}
