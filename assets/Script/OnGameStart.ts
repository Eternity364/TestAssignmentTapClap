import AudioController from "./AudioManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class OnGameStart extends cc.Component {
    @property(cc.AudioClip)
    audioClip: cc.AudioClip = null;

    @property(AudioController)
    audioManager: AudioController = null;

    start () {
        this.audioManager.setBackgroundMusic(this.audioClip);
    }
}
