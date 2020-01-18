import soundManager from '../managers/soundManager.js';

import {
    Rect,
} from '../primitives.js'

import {
    ControlsInfo,
} from '../ui-parts.js'

export default class CampaignFinishedScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#0F5D06');
        this.controlsInfo = new ControlsInfo(width, height);
        this.sound = null;
    }

    draw(context) {
        this.background.draw(context);

        const originalTextAlign = context.textAlign;
        context.textAlign = 'center';
        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("CAMPAING FINISHED", this.width / 2, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER restart", this.width / 2, this.height / 2 - 9);
        context.textAlign = originalTextAlign;

        this.controlsInfo.draw(context);

        this.playSound();
    }

    playSound() {
        if (!this.sound) this.sound = soundManager.get('victory');
        this.sound.play();
    }
}