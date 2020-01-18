export class GameObject {
    constructor(x, y, width, height, angle, speed, rotateSpeed, destroyOnLeave, spinSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle || 0; // Направление полёта
        this.speed = speed || 0; // Юнитов в секунду
        this.rotateSpeed = rotateSpeed || 0; // Скорость поворота - оборотов в секунду
        this.spinAngle = 0; // Положение разворота относительно оси. Не влияет на направление полёта
        this.spinSpeed = spinSpeed || 0; // Скорость вращения отновительно оси
        this.destroyOnLeave = destroyOnLeave;
        this.isDestroyed = false;
    }

    getDestroyOnLeave() {
        return !!this.destroyOnLeave;
    }

    destroy() {
        this.isDestroyed = true;
    }

    getIsDestroyed() {
        return !!this.isDestroyed;
    }

    getSpeed() {
        return this.speed;
    }

    getRotateSpeed() {
        return this.rotateSpeed;
    }
}

export class Sprite {
    constructor(image, width, height, position, deltaX, deltaY) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.image = image;
        this.deltaX = deltaX || 0;
        this.deltaY = deltaY || 0;
    }

    draw(context) {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.position.angle + this.position.spinAngle);
        context.translate(this.deltaX, this.deltaY);
        context.drawImage(
            this.image,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        context.restore();
    }
}

export class Img {
    constructor(x, y, angle, width, height, image) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.width = width;
        this.height = height;
        this.image = image;
    }
}

export class Rect {
    constructor(width, height, color, leftX, topY) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.leftX = leftX || 0;
        this.topY = topY || 0;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.leftX, this.topY, this.width, this.height);
    }
}

export class Circle {
    constructor(radius, color, position) {
        this.radius = radius;
        this.color = color;
        this.position = position;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
    }
}

export class Ring {
    constructor(radius, color, position) {
        this.radius = radius;
        this.color = color;
        this.position = position;
    }

    draw(context) {
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.stroke();
    }
}

export class AnimatedSprite {
    constructor(image, width, height, imageWidth, imageHeight, position, numFramesX, numFramesY, looped, onFinishedHandler, deltaX, deltaY, startFrameNumber) {
        this.position = position;
        this.frameNumber = startFrameNumber || 0;
        this.numFramesX = numFramesX;
        this.numFramesY = numFramesY;
        this.numFrames = numFramesX * numFramesY;
        this.image = image;
        this.width = width;
        this.height = height;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.looped = looped;
        this.onFinishedHandler = onFinishedHandler;
        this.deltaX = deltaX || 0;
        this.deltaY = deltaY || 0;
    }

    draw(context) {
        if (this.frameNumber >= this.numFrames) {
            if (this.looped) {
                this.frameNumber = 0;
            } else {
                if (this.onFinishedHandler) this.onFinishedHandler();
                return;
            }
        }

        const x = (this.frameNumber % this.numFramesX);
        const y = Math.trunc(this.frameNumber / this.numFramesX);

        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.position.angle + this.position.spinAngle);
        context.translate(this.deltaX, this.deltaY);
        context.drawImage(
            this.image,
            x * this.imageWidth, y * this.imageHeight, this.imageWidth, this.imageHeight,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        context.restore();

        this.frameNumber += 1;
    }
}

export class CombinedDrawItem {
    constructor(drawItems) {
        this.drawItems = drawItems;
    }

    draw(context) {
        this.drawItems.forEach(di => di.draw(context));
    }
}