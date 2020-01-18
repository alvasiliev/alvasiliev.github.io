export class Sound {
    constructor(context, buffer) {
        this.context = context;
        this.buffer = buffer;
        this.isPlaying = false;
        this.gainNode = null;
        this.source = null;
    }

    play(volume, isLooped, fadeIn) {
        if (!isLooped || !this.isPlaying) {
            this.isPlaying = true;
            const now = this.context.currentTime;

            this.gainNode = this.context.createGain();

            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.loop = isLooped;
            this.source.connect(this.gainNode);

            this.gainNode.connect(this.context.destination);

            if (!fadeIn) {
                this.gainNode.gain.setValueAtTime(volume || 1, now);
            } else {
                this.gainNode.gain.setValueAtTime(0, now);
                this.gainNode.gain.linearRampToValueAtTime(volume || 1, now + 0.5);
            }

            this.source.start(now);
        }
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;

            const now = this.context.currentTime;
            this.gainNode.gain.linearRampToValueAtTime(0, now + 1);
            this.source.stop(now + 2);
        }
    }
}

export class SoundManager {
    constructor() {
        this.context = new(window.AudioContext || window.webkitAudioContext)();

        this.sounds = {};
        this.loadedCount = 0;
        this.sndList = [
            'victory',
            'gameover',
            'explosion',
            'shot',
            'missile',
            'jet',
            'music',
            'dock',
            'undock',
            'pickUp',
            'pickAmmo',
        ];
        this.onLoadFinished = null;
        this.isLoaded = false;
    }

    async load() {
        const promises = this.sndList.map(snd => this.loadSound(snd));

        await Promise.all(promises)

        this.isLoaded = true;
        this.onLoadFinished();
    }

    get(soundName) {
        const audioBuffer = this.sounds[soundName];
        if (!audioBuffer) {
            return {
                play: function () {},
                stop: function () {}
            };
        } else {
            return new Sound(this.context, audioBuffer)
        }
    }

    async loadSound(sndSrc) {
        const url = `../audio/${sndSrc}.mp3`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                const audioData = await response.arrayBuffer();
                const decodedData = await this.context.decodeAudioData(audioData);
                this.sounds[sndSrc] = decodedData;
            } else {
                console.error('Failed to load sound: ' + sndSrc);
            }
        } catch (e) {
            console.error('Failed to load sound: ' + sndSrc);
        }
    }
}

const soundManager = new SoundManager();
export default soundManager;