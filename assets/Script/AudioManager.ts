const { ccclass, property } = cc._decorator;

@ccclass("AudioController")
export default class AudioController extends cc.Component {
    @property()
    sfxVolume: number = 1.0;

    @property()
    bgmVolume: number = 1.0;

    private playingSounds: Map<string, number> = new Map();
    private lastPlayedTime: Map<string, number> = new Map();
    private defaultCooldown: number = 0.05; // default cooldown

    private bgmId: number | null = null;

    // singleton instance
    public static Instance: AudioController | null = null;

    onLoad() {
        if (AudioController.Instance && AudioController.Instance !== this) {
            this.node.destroy();
            return;
        }
        AudioController.Instance = this;
        if (cc.game && cc.game.addPersistRootNode) {
            cc.game.addPersistRootNode(this.node);
        }
    }

    onDestroy() {
        if (AudioController.Instance === this) {
            AudioController.Instance = null;
        }
    }

    /**
     * Play a sound effect
     * @param audioClip The clip to play
     * @param loop Whether to loop
     * @param cooldown Optional cooldown override in seconds
     */
    playSound(audioClip: cc.AudioClip, loop: boolean = false, cooldown?: number) {
        if (!audioClip) return;

        const now = Date.now() / 1000;
        const lastPlay = this.lastPlayedTime.get(audioClip.name) || 0;
        const cd = cooldown ?? this.defaultCooldown; // use override if provided

        if (now - lastPlay < cd) return; // skip if cooldown not passed

        this.lastPlayedTime.set(audioClip.name, now);

        const audioId = cc.audioEngine.playEffect(audioClip, loop);
        cc.audioEngine.setVolume(audioId, this.sfxVolume);
        this.playingSounds.set(audioClip.name, audioId);

        return audioId;
    }

    stopSound(audioClip: cc.AudioClip) {
        if (!audioClip) return;
        const audioId = this.playingSounds.get(audioClip.name);
        if (audioId !== undefined) {
            cc.audioEngine.stopEffect(audioId);
            this.playingSounds.delete(audioClip.name);
        }
    }

    stopAll() {
        cc.audioEngine.stopAll();
        this.playingSounds.clear();
        this.lastPlayedTime.clear();
    }

    setBackgroundMusic(audioClip: cc.AudioClip) {
        if (!audioClip) return;

        const fade = 1.0; // fixed fade for BGM
        if (this.bgmId !== null) {
            const oldBgmId = this.bgmId;
            let elapsed = 0;
            const newBgmId = cc.audioEngine.play(audioClip, true, 0);
            cc.audioEngine.setVolume(newBgmId, 0);
            this.bgmId = newBgmId;

            const update = (dt: number) => {
                elapsed += dt;
                const t = Math.min(elapsed / fade, 1);
                cc.audioEngine.setVolume(oldBgmId, this.bgmVolume * (1 - t));
                cc.audioEngine.setVolume(newBgmId, this.bgmVolume * t);
                if (t >= 1) {
                    cc.audioEngine.stop(oldBgmId);
                    this.unschedule(update);
                }
            };
            this.schedule(update, 0);
        } else {
            this.bgmId = cc.audioEngine.play(audioClip, true, this.bgmVolume);
        }
    }
}
