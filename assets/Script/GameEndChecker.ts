import EndGameScreen from "./GameEndScreen";
import { GameStates, IGameStateChecker } from "./GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameEndChecker extends cc.Component {

    @property([cc.Node])
    public checkers: cc.Node[] = []; // nodes implementing IGameStateChecker

    @property(cc.Node)
    public endGameScreen: cc.Node = null;

    private isGameEnded: boolean = false;

    onLoad() {
        // Assign the check function to every checker
        this.checkers.forEach(node => {
            if (!node) return;
            const comp = node.getComponent(node.name) as unknown as IGameStateChecker;
            if (comp && comp.SetCheckFunction) {
                comp.SetCheckFunction(() => this.CheckGameState());
            }
        });
    }

    private CheckGameState(): void {
        if (this.isGameEnded) return;

        for (const node of this.checkers) {
            if (!node) continue;
            const checker = node.getComponent(node.name) as unknown as IGameStateChecker;
            if (!checker || !checker.GetGameState) continue;

            const state = checker.GetGameState();
            if (state === GameStates.Won || state === GameStates.Lost) {
                this.TriggerEndGame(state);
                break;
            }
        }
    }

    private TriggerEndGame(state: GameStates): void {
        this.isGameEnded = true;

        if (this.endGameScreen) {
            this.endGameScreen.active = true;

            const endScreenComp = this.endGameScreen.getComponent(EndGameScreen);
            endScreenComp.SetState(state);
        }

        cc.log(`Game ended with state: ${GameStates[state]}`);
    }
}
