// Screens
import SplashScreen from '../screens/SplashScreen.js';
import PauseScreen from '../screens/PauseScreen.js';
import GameOverScreen from '../screens/GameOverScreen.js';
import VictoryScreen from '../screens/VictoryScreen.js';
import CampaignFinishedScreen from '../screens/CampaignFinishedScreen.js';

export default class RenderEngine {
    constructor(viewportWidth, viewportHeight, figures, userInterfaceItems) {
        this.figures = figures;
        this.width = viewportWidth;
        this.height = viewportHeight;
        this.userInterfaceItems = userInterfaceItems;

        const canvas = document.createElement('canvas');
        this.canvas = canvas;
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;
        document.getElementById('root').append(canvas);
        this.context = canvas.getContext('2d');

        this.fpsCalculatedAt = new Date().getTime();
        this.framesCount = 0;
        this.fps = 0;
        this.fpsStep = 100;
    }

    drawSplashScreen(isLoading) {
        const screen = new SplashScreen(this.width, this.height);
        screen.draw(this.context, isLoading);
    }

    drawPauseScreen() {
        const screen = new PauseScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawGameOverScreen() {
        const screen = new GameOverScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawVictoryScreen() {
        const screen = new VictoryScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawCampaignFinishedScreen() {
        const screen = new CampaignFinishedScreen(this.width, this.height);
        screen.draw(this.context);
    }

    drawFrame() {
        for (let f of this.figures.get()) {
            if (f.getDrawItem) {
                f.getDrawItem().draw(this.context);
            }
        }
        if (this.userInterfaceItems) {
            this.userInterfaceItems.forEach(ui => ui.getDrawItem().draw(this.context));
        }
        this.drawFps();
    }

    drawFps() {
        this.framesCount += 1;
        if (this.framesCount === this.fpsStep) {
            const now = new Date().getTime();
            const timePassed = now - this.fpsCalculatedAt;
            this.fps = this.framesCount * 1000 / timePassed;
            this.framesCount = 0;
            this.fpsCalculatedAt = now;
        }

        this.context.fillStyle = '#888';
        this.context.font = "14px 'Courier New', Courier, monospace";
        this.context.fillText("fps: " + this.fps.toFixed(1), this.width - 80, 20);
    }
}