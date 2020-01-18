import {
    Rect,
} from '../primitives.js'

import {
    ControlsInfo,
} from '../ui-parts.js'

export default class PauseScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#000');
        this.controlsInfo = new ControlsInfo(width, height);
    }

    draw(context) {
        context.globalAlpha = 0.5;
        this.background.draw(context);
        context.globalAlpha = 1;

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("PAUSE", this.width / 2 - 80, this.height / 2 - 50);

        context.fillStyle = '#aaa';
        context.font = "18px 'Courier New', Courier, monospace";
        context.fillText("Press ENTER continue", this.width / 2 - 110, this.height / 2 - 9);

        this.controlsInfo.draw(context);
    }
}