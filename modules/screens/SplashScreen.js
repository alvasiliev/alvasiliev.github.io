import {
    Rect,
} from '../primitives.js'

import {
    ControlsInfo,
} from '../ui-parts.js'

export default class SplashScreen {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.background = new Rect(width, height, '#0E0855');
        this.controlsInfo = new ControlsInfo(width, height);
    }

    draw(context, isLoading) {
        this.background.draw(context);

        context.fillStyle = '#ddd';
        context.font = "48px 'Courier New', Courier, monospace";
        context.fillText("ASTEROIDS", this.width / 2 - 130, this.height / 2 - 50);

        if (isLoading) {
            context.fillStyle = '#aaa';
            context.font = "18px 'Courier New', Courier, monospace";
            context.fillText("Loading...", this.width / 2 - 50, this.height / 2 - 9);
        } else {
            context.fillStyle = '#aaa';
            context.font = "18px 'Courier New', Courier, monospace";
            context.fillText("Press ENTER play", this.width / 2 - 85, this.height / 2 - 9);

            this.controlsInfo.draw(context);
        }
    }
}