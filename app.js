// UI Parts
import {
    Background,
    StatusPanel,
    MissionDescription,
} from './modules/ui-parts.js'

// Objects
import Missile from './modules/gameObjects/Missile.js';
import Ship from './modules/gameObjects/Ship.js';

// Game
import soundManager from './modules/managers/soundManager.js';
import imageManager from './modules/managers/imageManager.js';
import RenderEngine from './modules/engines/RenderEngine.js'
import PhysicsEngine from './modules/engines/PhysicsEngine.js';
import CollisionEngine from './modules/engines/CollisionEngine.js';
import Figures from './modules/managers/Figures.js';
import PlayerManager from './modules/managers/PlayerManager.js';
import Player from './modules/Player.js';
import Campaign from './modules/missions/Campaign.js';

class Game {
    constructor(imageManager, soundManager, w, h) {
        this.intervalHandle = null;
        this.calcFrequency = 60; // 60 раз в секунду

        this.players = [];

        this.figures = new Figures();

        this.width = w || 1024;
        this.height = h || 768;
        this.playerManager = new PlayerManager();
        this.statusPanel = new StatusPanel(this);
        this.missionDescription = new MissionDescription(this);
        this.missionDescriptionTimeoutHandler = null;
        this.renderEngine = new RenderEngine(this.width, this.height, this.figures, [
            this.statusPanel,
            this.missionDescription,
        ]);
        this.physicsEngine = new PhysicsEngine(this.width, this.height, this.figures);
        this.collisionEngine = new CollisionEngine(this.figures);

        this.musicSound = null;

        this.campaign = new Campaign();
        this.nextMissionNumber = 0;
        this.currentMission = null;

        this.renderEngine.drawSplashScreen(true);
        imageManager.onLoadFinished = () => {
            if (imageManager.isLoaded && soundManager.isLoaded) this.loadFinished();
        }
        soundManager.onLoadFinished = () => {
            if (imageManager.isLoaded && soundManager.isLoaded) this.loadFinished();
        }
        setTimeout(() => {
            imageManager.load();
            soundManager.load();
        }, 200);

        this.configureKeys();
    }

    loadFinished() {
        this.renderEngine.drawSplashScreen(false);
    }

    //-------------------------------------------------------------------------
    // GAME MENU
    configureKeys() {
        document.addEventListener("keypress", function (event) {
            if (event.code === 'Enter') {
                if (!this.intervalHandle) {
                    this.start();
                } else {
                    this.pause();
                }
            }
        }.bind(this));

        document.addEventListener("keyup", function (event) {
            if (event.code === 'Escape') {
                this.stop();
            }
        }.bind(this));
    }

    start() {
        if (this.currentMission !== null && this.currentMission.isInProgress()) {
            this.startPerforming();
            if (this.currentMission.resume) this.currentMission.resume();
        } else {
            this.startMission();
        }
    }

    pause() {
        this.stopPerforming();
        this.renderEngine.drawFrame();
        this.renderEngine.drawPauseScreen();
        if (this.currentMission.pause) this.currentMission.pause();
    }

    stop() {
        this.stopMission();
        this.nextMissionNumber = 0;
        this.renderEngine.drawFrame();
        this.renderEngine.drawSplashScreen();
    }

    //-------------------------------------------------------------------------
    addFigure(f) {
        this.figures.add(f);
    }

    processUserControl(ship, userControls) {
        if (ship.getGameObject().getIsDestroyed()) return;
        const k = userControls.state;

        // Rotate
        if (k.LEFT && !k.RIGHT) {
            ship.turnRotationLeftOn();
        } else if (!k.LEFT && k.RIGHT) {
            ship.turnRotationRightOn();
        } else {
            ship.turnRotationOff();
        }

        // Move
        if (k.MOVE) {
            ship.turnEngineOn();
        } else {
            ship.turnEngineOff();
        }

        // Shoot
        if (k.SHOOT) {
            const bullet = ship.shoot();
            if (bullet) {
                this.addFigure(bullet);
            }
        }

        // Launch missile
        if (k.LAUNCH) {
            const missile = ship.launchMissile();
            if (missile) {
                this.addFigure(missile);
            }
        }

        // Dock to station
        if (k.DOCK && !ship.isDockingIsProgress()) {
            if (ship.isDockedToStation()) {
                ship.undockFromStation();
            } else {
                const stationToDock = this.collisionEngine.checkCanDock(ship);
                if (stationToDock) {
                    ship.dockToStation(stationToDock);
                }
            }
        }
    }

    //-------------------------------------------------------------------------
    // PERFORMING
    performAll() {
        this.players.forEach(player => {
            this.processUserControl(player.getShip(), player.getUserControls());
        });
        this.physicsEngine.moveAll();
        this.renderEngine.drawFrame();

        const newFigures = this.collisionEngine.checkAllCollisions();
        for (let f of newFigures) {
            this.addFigure(f);
        }

        // Remove all destroyed objects
        const figuresWithoutDestroyed = this.figures.get().filter(f => !f.getGameObject || !f.getGameObject().getIsDestroyed());
        this.figures.set(figuresWithoutDestroyed);

        this.checkGameResult();

        this.figures.get().filter(f => f.tick).forEach(f => f.tick());
        if (this.currentMission.tick) this.currentMission.tick();
    }

    startPerforming() {
        if (!this.intervalHandle) {
            this.physicsEngine.reset();
            this.intervalHandle = setInterval(() => this.performAll(), 1000 / this.calcFrequency);
        }
    }

    stopPerforming() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    //-------------------------------------------------------------------------
    // MISSION

    createPlayers() {
        const settings = this.playerManager.getPlayers();
        return settings.map(s => new Player(s.name, s.keys));
    }

    disposePlayers(players) {
        players.forEach(player => {
            player.getUserControls().dispose();
            const ship = player.getShip();
            if (ship) ship.dispose();
        });
    }

    startMission() {
        if (this.currentMission !== null && this.currentMission.isInProgress()) return;

        const mission = this.campaign.missions[this.nextMissionNumber];
        this.currentMission = mission.create(this);

        const background = new Background(this.width, this.height);
        const missionObjects = this.currentMission.getObjects();

        this.players = this.createPlayers();
        this.players.forEach(player => {
            const pos = this.currentMission.generateShipPosition();
            const ship = new Ship(pos.x, pos.y, pos.angle);
            player.setShip(ship);
        });

        // Order of adding figures is important to render properly
        this.figures.set([]);
        this.addFigure(background);
        missionObjects.forEach(o => this.addFigure(o));
        this.players.forEach(player => {
            this.addFigure(player.getShip());
        });

        this.physicsEngine.reset();
        this.startMusic();
        this.startPerforming();
        this.showMissionDescription();
    }

    stopMission() {
        if (this.currentMission == null) return;

        if (this.currentMission.isInProgress()) {
            this.currentMission.interrupt();
        }

        this.disposePlayers(this.players);

        this.stopMusic();
        this.stopPerforming();
    }

    showMissionDescription() {
        if (this.missionDescriptionTimeoutHandler) {
            clearTimeout(this.missionDescriptionTimeoutHandler);
        }
        this.missionDescription.show(this.currentMission.getDescription());
        this.missionDescriptionTimeoutHandler = setTimeout(() => {
            this.missionDescription.hide();
            this.missionDescriptionTimeoutHandler = null;
        }, 3000);
    }

    startMusic() {
        if (!this.musicSound) {
            this.musicSound = soundManager.get('music');
        }
        this.musicSound.play(1, true, true);
    }

    stopMusic() {
        if (this.musicSound) {
            this.musicSound.stop();
        }

        // Stop missile sound
        this.figures.get().forEach(f => {
            if (f instanceof Missile) {
                f.getGameObject().destroy();
            }
        });
    }

    //-------------------------------------------------------------------------
    // GAME RESULT
    checkGameResult() {
        const result = this.currentMission.checkResult();
        switch (result) {
            case 'succeeded': {
                this.win();
                break;
            }
            case 'failed': {
                this.loose();
                break;
            }
        }
    }

    loose() {
        this.stopMission();
        this.renderEngine.drawFrame();
        this.renderEngine.drawGameOverScreen();
    }

    win() {
        this.stopMission();
        this.renderEngine.drawFrame();
        this.nextMissionNumber += 1;
        if (this.campaign.missions.length === this.nextMissionNumber) {
            this.renderEngine.drawCampaignFinishedScreen();
            this.nextMissionNumber = 0;
        } else {
            this.renderEngine.drawVictoryScreen();
        }
    }
}

// Initialization

function setFullscreen() {
    var el = document.documentElement,
        rfs = // for newer Webkit and Firefox
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullScreen;
    if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
    } else if (typeof window.ActiveXObject != "undefined") {
        // for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}

window.initGame = function (isFullScreen) {
    window.document.getElementById('startScreen').style.display = "none";
    if (isFullScreen) {
        setFullscreen();
        setTimeout(() => {
            const w = window.innerWidth,
                h = window.innerHeight;
            const game = new Game(imageManager, soundManager, w, h);
        }, 500);
    } else {
        const w = window.innerWidth,
            h = window.innerHeight;
        const game = new Game(imageManager, soundManager, w, h);
    }
}
document.getElementById("startScreen").style.display = "block";
initGame(false);