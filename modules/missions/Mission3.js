import MissionGenerator from './MissionGenerator.js';

export default class Mission3 {
    constructor(game) {
        this.game = game;
        this.status = 'inProgress'; // inProgress, succeeded, failed, interrupted
        this.missionGenerator = new MissionGenerator(game);

        this.numOfAsteroids = 35;
        this.requiredDuration = 30;

        this.objects = this._generate();
        this.missionStartedAt = new Date().getTime();
        this.pauseDuration = 0;
        this.missionPausedAt = null;
    }

    checkResult() {
        if (this.status != 'inProgress') return this.status;

        const allShips = this.game.players.map(player => player.getShip());
        const shipsAlive = allShips.filter(ship => ship.health > 0);

        if (shipsAlive.length === 0) {
            this.status = 'failed'
        } else {
            const missionDuration = this.getMissionDuration();
            if (missionDuration >= this.getRequiredDuration()) {
                this.status = 'succeeded';
            }
        }

        return this.status;
    }

    interrupt() {
        this.status = 'interrupted'
    }

    isInProgress() {
        return this.status === 'inProgress';
    }

    isSucceeded() {
        return this.status === 'succeeded';
    }

    isFailed() {
        return this.status === 'failed';
    }

    isInterrupted() {
        return this.status === 'interrupted';
    }

    getDescription() {
        return [
            `You must survive for ${this.getRequiredDuration()} seconds`
        ];
    }

    getObjects() {
        return this.objects;
    }

    _generate() {
        return this.missionGenerator.generateAsteroids(this.numOfAsteroids, 10, 20, 10, 25);
    }

    pause() {
        if (!this.missionPausedAt) {
            this.missionPausedAt = new Date().getTime();
        }
    }

    resume() {
        if (this.missionPausedAt) {
            this.pauseDuration += new Date().getTime() - this.missionPausedAt;
            this.missionPausedAt = null;
        }
    }

    getRequiredDuration() {
        return this.requiredDuration;
    }

    getMissionDuration() {
        return (new Date().getTime() - this.missionStartedAt - this.pauseDuration) / 1000;
    }

    generateShipPosition() {
        const minX = this.game.width / 2 - 250;
        const maxX = this.game.width / 2 + 250;
        const minY = this.game.height / 2 - 100;
        const maxY = this.game.height / 2 + 100;

        const x = Math.round(Math.random() * (maxX - minX) + minX);
        const y = Math.round(Math.random() * (maxY - minY) + minY);
        const angle = Math.random() * Math.PI * 2;
        return {
            x,
            y,
            angle,
        }
    }

    tick() {
        this.missionGenerator.supplyPackagesIfRequired();
    }
}