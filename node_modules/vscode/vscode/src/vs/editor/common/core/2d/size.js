

class Size2D {
    static equals(a, b) {
        return a.width === b.width && a.height === b.height;
    }
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    add(other) {
        return ( new Size2D(this.width + other.width, this.height + other.height));
    }
    deltaX(delta) {
        return ( new Size2D(this.width + delta, this.height));
    }
    deltaY(delta) {
        return ( new Size2D(this.width, this.height + delta));
    }
    toString() {
        return `(${this.width},${this.height})`;
    }
    subtract(other) {
        return ( new Size2D(this.width - other.width, this.height - other.height));
    }
    scale(factor) {
        return ( new Size2D(this.width * factor, this.height * factor));
    }
    scaleWidth(factor) {
        return ( new Size2D(this.width * factor, this.height));
    }
    mapComponents(map) {
        return ( new Size2D(( map(this.width)), ( map(this.height))));
    }
    isZero() {
        return this.width === 0 && this.height === 0;
    }
    transpose() {
        return ( new Size2D(this.height, this.width));
    }
    toDimension() {
        return {
            width: this.width,
            height: this.height
        };
    }
}

export { Size2D };
