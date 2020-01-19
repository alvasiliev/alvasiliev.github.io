export class ImageManager {
    constructor() {
        this.images = {}
        this.loadedCount = 0;
        this.imgList = [
            'space',
            'cloud',
            'ship',
            'shipFire',
            'bullet',
            'asteroid',
            'explosion',
            'station',
            'missile',
            'missileFire',
            'beacon',
            'supplyPackage',
            'blackHole',
        ];
        this.onLoadFinished = null;
        this.isLoaded = false;
    }

    load() {
        this.imgList.forEach(img => this.loadImage(img));
    }

    get(imageName) {
        return this.images[imageName];
    }

    loadImage(imgSrc) {
        const image = new Image();
        image.src = 'sprites/' + imgSrc + '.png';
        image.onload = () => {
            this.images[imgSrc] = image;
            this.loadedCount += 1;

            if (this.loadedCount === this.imgList.length && this.onLoadFinished) {
                this.isLoaded = true;
                this.onLoadFinished();
            }
        }
        return image;
    }
}

const imageManager = new ImageManager();
export default imageManager;