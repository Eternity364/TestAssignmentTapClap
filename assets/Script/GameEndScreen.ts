import AudioController from "./AudioManager";
import { GameStates } from "./GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndGameScreen extends cc.Component {
    @property(cc.Label)
    private resultLabel: cc.Label = null;

    @property(cc.AudioClip)
    private winMusic: cc.AudioClip = null;

    @property(cc.AudioClip)
    private loseMusic: cc.AudioClip = null;

    onLoad() {
        if (this.resultLabel) {
            this.resultLabel.string = "";
        }
    }

    public SetState(state: GameStates): void {
        switch (state) {
            case GameStates.Won:
                this.resultLabel.string = "🎉 You Won!";
                AudioController.Instance.setBackgroundMusic(this.winMusic);
                break;

            case GameStates.Lost:
                this.resultLabel.string = "💀 You Lost!";
                AudioController.Instance.setBackgroundMusic(this.loseMusic);
                break;

            case GameStates.Continue:
                this.resultLabel.string = "";
                break;
        }
    }
}
