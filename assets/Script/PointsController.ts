import StatisticsPanel from "./StatisticsPanel";
import { BlockType } from "./Block"; // adjust import if enum is elsewhere
import { BlockNumberPair } from "./PairStructs";
import { GameStates, IGameStateChecker } from "./GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PointsController extends cc.Component implements IGameStateChecker {

    @property([BlockNumberPair])
    public blockPointsTable: any[] = [];
    @property(StatisticsPanel)
    public statisticsPanel: StatisticsPanel = null;

    @property
    public targetPoints: number = 1000;

    private currentPoints: number = 0;
    private checkFn: () => void = null;

    onLoad() {
        this.statisticsPanel.SetPoints(this.currentPoints, this.targetPoints);
    }

     public Increase(blockType: BlockType): void {
        const pair = this.blockPointsTable.find(p => p.blockType === blockType);
        if (pair) {
            this.currentPoints += pair.number;
        } else {
            cc.warn(`No point value defined for BlockType: ${blockType}`);
        }

        this.statisticsPanel.SetPoints(this.currentPoints, this.targetPoints);

        if (this.checkFn) this.checkFn();
    }

    public GetCurrentPoints(): number {
        return this.currentPoints;
    }

    public GetGameState(): GameStates {
        if (this.currentPoints >= this.targetPoints) {
            return GameStates.Won;
        }
        return GameStates.Continue;
    }

    public SetCheckFunction(fn: () => void): void {
        this.checkFn = fn;
    }
}
