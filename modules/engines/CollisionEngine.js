import Asteroid from '../gameObjects/Asteroid.js';
import Beacon from '../gameObjects/StarBeacon.js';
import Bullet from '../gameObjects/Bullet.js'
import Missile from '../gameObjects/Missile.js';
import Ship from '../gameObjects/Ship.js';
import Station from '../gameObjects/Station.js';
import SupplyPackage from '../gameObjects/SupplyPackage.js';
import BlackHole from '../gameObjects/BlackHole.js';

export default class CollisionEngine {
    constructor(figures) {
        this.figures = figures;
    }

    checkShipAsteriodCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let ship of ships) {
            for (let a of asteroids) {
                if (!a.getGameObject().getIsDestroyed()) {
                    const isCollision = this.checkCollision(ship, a);
                    if (isCollision) {
                        const wrecklesA = a.hit();
                        if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                        const wrecklesS = ship.hit(a.getDamage());
                        if (wrecklesS && wrecklesS.length) wreckles.push(...wrecklesS);
                    }
                }
            }
        }
        return wreckles;
    }

    checkBulletAsteroidCollisions() {
        const bullets = this.figures.get().filter(f => f instanceof Bullet && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let bullet of bullets) {
                const isCollision = this.checkCollision(bullet, asteroid);
                if (isCollision) {
                    bullet.blowUp();
                    const wrecklesA = asteroid.hit(1);
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }

        return wreckles;
    }

    checkMissileAsteroidCollisions() {
        const missiles = this.figures.get().filter(f => f instanceof Missile && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let missile of missiles) {
                const isCollision = this.checkCollision(missile, asteroid);
                if (isCollision) {
                    missile.blowUp();
                    const wrecklesA = asteroid.hit(100);
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                }
            }
        }

        return wreckles;
    }

    checkStationAsteroidCollisions() {
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());
        const asteroids = this.figures.get().filter(f => f instanceof Asteroid && !f.getGameObject().getIsDestroyed());
        const wreckles = [];

        for (let asteroid of asteroids) {
            for (let station of stations) {
                const isCollision = this.checkCollision(station, asteroid);
                if (isCollision) {
                    const wrecklesA = asteroid.hit();
                    if (wrecklesA && wrecklesA.length) wreckles.push(...wrecklesA);
                    const wrecklesS = station.hit(asteroid.getDamage());
                    if (wrecklesS && wrecklesS.length) wreckles.push(...wrecklesS);
                }
            }
        }
        return wreckles;
    }

    checkShipBeaconCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const beacons = this.figures.get().filter(f => f instanceof Beacon && !f.getGameObject().getIsDestroyed());

        for (let ship of ships) {
            for (let b of beacons) {
                if (!b.getGameObject().getIsDestroyed()) {
                    const isCollision = this.checkCollision(ship, b);
                    if (isCollision) {
                        ship.gatherBeacon(b);
                    }
                }
            }
        }
    }

    checkCanDock(ship) {
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());

        for (let s of stations) {
            if (s.checkCanDock(ship)) {
                return s;
            }
        }
        return null;
    }

    checkShipStationCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const stations = this.figures.get().filter(f => f instanceof Station && !f.getGameObject().getIsDestroyed());

        for (let station of stations) {
            let stationCanDoc = false;
            for (let ship of ships) {
                const shipCanDock = station.checkCanDock(ship);
                stationCanDoc = stationCanDoc || shipCanDock;
            }
            station.showCanDock(stationCanDoc);
        }
    }

    checkShipSupplyPackageCollisions() {
        const ships = this.figures.get().filter(f => f instanceof Ship && !f.getGameObject().getIsDestroyed());
        const packages = this.figures.get().filter(f => f instanceof SupplyPackage && !f.getGameObject().getIsDestroyed());

        for (let ship of ships) {
            for (let pack of packages) {
                const isCollision = this.checkCollision(ship, pack);
                if (isCollision) {
                    ship.pickSupplyPackage(pack);
                }
            }
        }
    }

    checkBlackHoleCollisions() {
        const objects = this.figures.get().filter(f => !(f instanceof BlackHole) && f.getGameObject && !f.getGameObject().getIsDestroyed());
        const blackHoles = this.figures.get().filter(f => f instanceof BlackHole && !f.getGameObject().getIsDestroyed());

        for (let blackHole of blackHoles) {
            const affectedObjects = objects.filter(obj => this.checkCollision(obj, blackHole));
            blackHole.affect(affectedObjects);
        }
    }

    checkCollision(go1, go2) {
        const go1Radius = go1.getGameObject().width / 2;
        const go1X = go1.getGameObject().x;
        const go1Y = go1.getGameObject().y;

        const go2Radius = go2.getGameObject().width / 2;
        const go2X = go2.getGameObject().x;
        const go2Y = go2.getGameObject().y;

        const minDistance = (go1Radius + go2Radius);
        const minDistance2 = minDistance * minDistance;

        const dx = go1X - go2X;
        const dy = go1Y - go2Y;
        const distance2 = dx * dx + dy * dy;

        return distance2 < minDistance2;
    }

    checkAllCollisions() {
        const newFigures1 = this.checkBulletAsteroidCollisions();
        const newFigures2 = this.checkMissileAsteroidCollisions();
        const newFigures3 = this.checkStationAsteroidCollisions();
        const newFigures4 = this.checkShipAsteriodCollisions();
        this.checkShipBeaconCollisions();
        this.checkShipStationCollisions();
        this.checkShipSupplyPackageCollisions();
        this.checkBlackHoleCollisions();
        return [
            ...newFigures1,
            ...newFigures2,
            ...newFigures3,
            ...newFigures4,
        ];
    }
}