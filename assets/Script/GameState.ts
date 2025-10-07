export enum GameStates {
    Continue,
    Lost,
    Won
}

export interface IGameStateChecker {
    GetGameState(): GameStates;
    SetCheckFunction(checkFn: () => void): void;
}
