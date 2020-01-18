import soundManager from '../managers/soundManager.js';

import {
    Rect,
} from '../primitives.js'

import {
    ControlsInfo,
} from '../ui-parts.js'

export default class GameOverScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#900');
        this.controlsInfo = new ControlsInfo(width, height);
        this.sound = null;
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("GAME OVER", this.width / 2 - 120, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER restart", this.width / 2 - 110, this.height / 2 - 9);

        this.controlsInfo.draw(context);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('gameover');
        this.sound.play();
    }
}