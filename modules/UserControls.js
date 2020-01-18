export default class UserControls {
    constructor(keys) {
        this.state = {
            MOVE: false,
            LEFT: false,
            RIGHT: false,
            SHOOT: false,
            LAUNCH: false,
            DOCK: false,
        };

        this.setup(keys);
        this.onKeyDownHandler = this._onKeyDown.bind(this);
        this.onKeyUpHandler = this._onKeyUp.bind(this);
        this._init();
    }

    _onKeyDown(event) {
        const key = event.code;
        const action = this.keyToActionMap[key];
        if (action) this.state[action] = true;
    }

    _onKeyUp(event) {
        const key = event.code;
        const action = this.keyToActionMap[key];
        if (action) this.state[action] = false;
    }

    _init() {
        this.dispose();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }

    setup(keys) {
        const actionToKeyMap = keys || {
            MOVE: 'ArrowUp',
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            SHOOT: 'ControlLeft',
            LAUNCH: 'ShiftLeft',
            DOCK: 'KeyZ',
        };
        this.keyToActionMap = {};
        Object.keys(actionToKeyMap).forEach(action => {
            const key = actionToKeyMap[action];
            this.keyToActionMap[key] = action;
        });
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }

    getState() {
        return this.state;
    }
}