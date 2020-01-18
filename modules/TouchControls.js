import {
    Rect,
    Ring,
    CombinedDrawItem,
} from './primitives.js'

class TouchButton {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.isPressed = false;

        const w = x2 - x1;
        const h = y2 - y1;
        this.drawItemNotPressed = new Rect(w, h, 'rgba(0,0,0,0.3)', x1, y1);
        this.drawItemPressed = new Rect(w, h, 'rgba(128,0,0,0.3)', x1, y1);
    }

    getDrawItem() {
        return this.getIsPressed() ? this.drawItemPressed : this.drawItemNotPressed;
    }

    isInside(x, y) {
        return x >= this.x1 &&
            x <= this.x2 &&
            y >= this.y1 &&
            y <= this.y2;
    }

    setIsPressed(isPressed) {
        this.isPressed = isPressed;
    }

    getIsPressed() {
        return this.isPressed;
    }
}

export default class TouchControls {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.onTouchEventHandler = this._onTouchEvent.bind(this);
        this.onTouchStartEventHandler = this._onTouchStartEvent.bind(this);

        this.buttonMove = new TouchButton(width - 250, height - 200, width, height - 100);
        this.buttonLeft = new TouchButton(width - 250, height - 200, width - 150, height);
        this.buttonRight = new TouchButton(width - 100, height - 200, width, height);

        this.buttonShoot = new TouchButton(0, height - 100, 100, height);
        this.buttonLaunch = new TouchButton(110, height - 100, 210, height);

        this.buttonEnter = new TouchButton(width / 2 - 100, height / 2 - 50, width / 2 + 100, height / 2 + 50);

        this.onEnterHandlers = [];
        this.isVisible = false;
    }

    getState() {
        return {
            MOVE: this.buttonMove.getIsPressed(),
            LEFT: this.buttonLeft.getIsPressed(),
            RIGHT: this.buttonRight.getIsPressed(),
            SHOOT: this.buttonShoot.getIsPressed(),
            LAUNCH: this.buttonLaunch.getIsPressed(),
            DOCK: false,
        };
    }

    getDrawItem() {
        if (this.isVisible) {
            return new CombinedDrawItem([
                this.buttonMove.getDrawItem(),
                this.buttonLeft.getDrawItem(),
                this.buttonRight.getDrawItem(),
                this.buttonShoot.getDrawItem(),
                this.buttonLaunch.getDrawItem(),
            ]);
        } else {
            return {
                draw: context => {}
            };
        }
    }

    checkButton(button, touches) {
        let isInside = false;
        for (let touch of touches) {
            isInside = isInside || button.isInside(touch.clientX, touch.clientY);
        }
        button.setIsPressed(isInside);
    }

    checkTouches(touches) {
        this.checkButton(this.buttonMove, touches);
        this.checkButton(this.buttonLeft, touches);
        this.checkButton(this.buttonRight, touches);
        this.checkButton(this.buttonShoot, touches);
        this.checkButton(this.buttonLaunch, touches);
    }

    _onTouchEvent(event) {
        this.checkTouches(event.touches);
    }

    _onTouchStartEvent(event) {
        this.checkButton(this.buttonEnter, event.touches);
        if (this.buttonEnter.getIsPressed()) {
            this.onEnterHandlers.forEach(handler => handler());
        }
    }

    init(element) {
        this.element = element || document;
        this.dispose();
        this.element.addEventListener('touchstart', this.onTouchEventHandler);
        this.element.addEventListener('touchend', this.onTouchEventHandler);
        this.element.addEventListener('touchcancel', this.onTouchEventHandler);
        this.element.addEventListener('touchmove', this.onTouchEventHandler);
        this.element.addEventListener('touchstart', this.onTouchStartEventHandler);
    }

    dispose() {
        this.element.removeEventListener('touchstart', this.onTouchEventHandler);
        this.element.removeEventListener('touchend', this.onTouchEventHandler);
        this.element.removeEventListener('touchcancel', this.onTouchEventHandler);
        this.element.removeEventListener('touchmove', this.onTouchEventHandler);
    }

    onEnter(onEnterHandler) {
        if (this.onEnterHandlers.indexOf(onEnterHandler) < 0) {
            this.onEnterHandlers.push(onEnterHandler);
        }
    }

    setIsVisible(isVisible) {
        this.isVisible = isVisible;
    }
}