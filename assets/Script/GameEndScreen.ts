import { GameStates } from "./GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndGameScreen extends cc.Component {

    @property(cc.Label)
    private resultLabel: cc.Label = null;

    onLoad() {
        if (this.resultLabel) {
            this.resultLabel.string = "";
        }
    }

    public SetState(state: GameStates): void {
        switch (state) {
            case GameStates.Won:
                this.resultLabel.string = "🎉 You Won!";
                break;

            case GameStates.Lost:
                this.resultLabel.string = "💀 You Lost!";
                break;

            case GameStates.Continue:
                this.resultLabel.string = "";
                break;
        }
    }
}
