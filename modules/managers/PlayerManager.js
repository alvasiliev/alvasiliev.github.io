export default class PlayerManager {
    constructor() {
        this.singlePlayer = {
            name: 'Player 1',
            keys: {
                MOVE: 'ArrowUp',
                LEFT: 'ArrowLeft',
                RIGHT: 'ArrowRight',
                DOCK: 'ArrowDown',
                SHOOT: 'KeyX',
                LAUNCH: 'KeyZ',
            }
        };

        this.player1 = {
            name: 'Player 1',
            keys: {
                MOVE: 'ArrowUp',
                LEFT: 'ArrowLeft',
                RIGHT: 'ArrowRight',
                DOCK: 'ArrowDown',
                SHOOT: 'KeyM',
                LAUNCH: 'KeyN',
            }
        };

        this.player2 = {
            name: 'Player 2',
            keys: {
                MOVE: 'KeyW',
                LEFT: 'KeyA',
                RIGHT: 'KeyD',
                DOCK: 'KeyS',
                SHOOT: 'KeyX',
                LAUNCH: 'KeyZ',

            }
        };

        this.setOnePlayer();
    }

    setOnePlayer() {
        this.players = [this.singlePlayer];
    }

    setTwoPlayers() {
        this.players = [this.player1, this.player2];
    }

    getPlayers() {
        return this.players;
    }
}