import { GameStates, IGameStateChecker } from "./GameState";
import StatisticsPanel from "./StatisticsPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnsController extends cc.Component implements IGameStateChecker {
    @property
    public maxTurnsCount: number = 10;

    @property(StatisticsPanel)
    public statisticsPanel: StatisticsPanel = null;

    private currentTurn: number = 0;
    private checkFn: () => void = null;

    onLoad() {
        this.statisticsPanel.SetTurns(this.currentTurn, this.maxTurnsCount);
    }

    public Increment(): void {
        this.currentTurn++;
        this.statisticsPanel.SetTurns(this.currentTurn, this.maxTurnsCount);
        if (this.checkFn) this.checkFn();
    }

    public GetCurrentTurn(): number {
        return this.currentTurn;
    }

    public GetGameState(): GameStates {
        if (this.currentTurn >= this.maxTurnsCount) {
            return GameStates.Lost;
        }
        return GameStates.Continue;
    }

    public SetCheckFunction(fn: () => void): void {
        this.checkFn = fn;
    }
}
