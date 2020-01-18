import Asteroid from '../gameObjects/Asteroid.js';
import Beacon from '../gameObjects/StarBeacon.js';
import Station from '../gameObjects/Station.js';
import SupplyPackage from '../gameObjects/SupplyPackage.js';

export default class MissionGenerator {
    constructor(game) {
        this.game = game;
        this.packageSuppiedAt = null;
        this.supplyDelay = 10; // 10 seconds between supplies
    }

    generateAsteroids(asteroidsCount, minR, maxR, minS, maxS) {
        const asteroids = [];
        const minRadius = minR || 20;
        const maxRadius = maxR || 70;
        const minSpeed = minS || 1;
        const maxSpeed = maxS || 20;
        const maxSpin = 0.5;
        for (let i = 0; i < asteroidsCount; ++i) {
            const rand = Math.random();
            const radius = Math.trunc(rand * (maxRadius - minRadius) + minRadius);
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;
            const spinSpeed = ((1 - rand) * maxSpin * 2) - maxSpin;

            const a = new Asteroid(pos.x, pos.y, angle, radius, speed, spinSpeed);
            asteroids.push(a);
        }
        return asteroids;
    }

    generatePackages(packageCount) {
        const packages = [];
        const minSpeed = 1;
        const maxSpeed = 5;
        for (let i = 0; i < packageCount; ++i) {
            const rand = Math.random();
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;

            const p = new SupplyPackage(pos.x, pos.y, angle, speed);
            packages.push(p);
        }
        return packages;
    }

    generateBeacons(totalBeaconCount) {
        const beacons = [];
        const minSpeed = 1;
        const maxSpeed = 20;
        for (let i = 0; i < totalBeaconCount; ++i) {
            const rand = Math.random();
            const speed = (maxSpeed - minSpeed) * (1 - rand) + minSpeed;
            const pos = this._getRandomStartPosition();
            const angle = Math.random() * 360 * Math.PI / 180;

            const b = new Beacon(pos.x, pos.y, angle, speed);
            beacons.push(b);
        }
        return beacons;
    }

    generateStations() {
        const width = this.game.width,
            height = this.game.height;
        const stations = [];

        const x = width / 2;
        const y = height / 2;
        const s = new Station(x, y);
        stations.push(s);

        return stations;
    }

    supplyPackagesIfRequired() {
        const playersWithoutAmmo = this.game.players.map(p => p.getShip()).filter(ship => ship.ammo <= 0 && ship.maxAmmo);
        const packages = this.game.figures.get().filter(f => f instanceof SupplyPackage && !f.gameObject.getIsDestroyed());
        const stations = this.game.figures.get().filter(f => f instanceof Station && !f.gameObject.getIsDestroyed());
        if (playersWithoutAmmo.length > 0 && packages.length === 0 && stations.length == 0) {
            const now = new Date().getTime();
            const timeToSupply = this.packageSuppiedAt == null || this.packageSuppiedAt + this.supplyDelay * 1000 < now;
            if (timeToSupply) {
                const packages = this.generatePackages(3);
                packages.forEach(p => this.game.addFigure(p));
            }
        }
    }

    _getRandomStartPosition() {
        const width = this.game.width,
            height = this.game.height;
        const linearPos = Math.trunc((width + height) * 2 * Math.random());

        let x, y;
        if (linearPos < width) {
            x = linearPos;
            y = 0;
        } else if (linearPos < width + height) {
            x = width;
            y = linearPos - width;
        } else if (linearPos < width * 2 + height) {
            x = linearPos - width - height;
            y = height;
        } else {
            x = 0;
            y = linearPos - width * 2 - height;
        }

        return {
            x,
            y
        }
    }
}