import StatisticsPanel from "./StatisticsPanel";
import { BlockType } from "./Block"; // adjust import if enum is elsewhere
import { BlockNumberPair } from "./PairStructs";
import { GameStates, IGameStateChecker } from "./GameState";
import BlockFactory from "./BlockFactory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PointsController extends cc.Component implements IGameStateChecker {

    @property([BlockNumberPair])
    public blockPointsTable: any[] = [];

    @property(StatisticsPanel)
    public statisticsPanel: StatisticsPanel = null;

    @property(BlockFactory)
    public blockFactory: BlockFactory = null;
    
    @property
    public targetPoints: number = 1000;

    @property(cc.Prefab)
    private pointsTextPrefab: cc.Prefab = null;

    private currentPoints: number = 0;
    private checkFn: () => void = null;

    onLoad() {
        this.statisticsPanel.SetPoints(this.currentPoints, this.targetPoints);
    }

    public Increase(blockType: BlockType, worldPosition: cc.Vec3): void {
        const pair = this.blockPointsTable.find(p => p.blockType === blockType);
        if (pair) {
            this.currentPoints += pair.number;

            this.showPointsAnimation(blockType, pair.number, worldPosition);
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

    private showPointsAnimation(blockType: BlockType, points: number, worldPosition: cc.Vec3): void {
        const color = this.blockFactory.getBlockColor(blockType);
        const pointsNode = cc.instantiate(this.pointsTextPrefab);
        const localPos = this.node.convertToNodeSpaceAR(worldPosition);
        pointsNode.setPosition(localPos);
        this.node.addChild(pointsNode);

        const label = pointsNode.getComponent(cc.Label);
        label.node.color = color;
        if (label) label.string = `+${points}`;

        const fadeDelay = 1.5;      // seconds before fading starts
        const fadeDuration = 0.5;   // fade-out duration
        const totalMoveY = 50;      // how far it moves upward
        const moveDuration = fadeDelay + fadeDuration; // total movement time
        // ------------------------------

        // Reset state
        pointsNode.opacity = 255;

        // 🔹 Tween 1: Movement (runs immediately)
        cc.tween(pointsNode)
            .by(moveDuration, { position: cc.v3(0, totalMoveY, 0) }, { easing: 'cubicOut' })
            .call(() => pointsNode.destroy())
            .start();

        // 🔹 Tween 2: Opacity (starts after delay)
        cc.tween(pointsNode)
            .delay(fadeDelay)
            .to(fadeDuration, { opacity: 0 }, { easing: 'quadOut' })
            .start();
    }
}
