class Image {
  constructor(images) {
    this.images = images;
    this.xIndex = 0;
    this.yIndex = 0;
  }

  getWidth() {
    return this.images[this.yIndex][0][0].length;
  }

  getHeight() {
    return this.images[this.yIndex][0].length;
  }

  getImage() {
    return this.images[this.yIndex][this.xIndex];
  }

  prev() {
    this.xIndex = this.xIndex === 0 ? this.images[this.yIndex].length - 1 : this.xIndex - 1;
  }

  next() {
    this.xIndex = this.xIndex === this.images[this.yIndex].length - 1 ? 0 : this.xIndex + 1;
  }

  setXIndex(index) {
    this.xIndex = index;
  }

  getXIndex() {
    return this.xIndex;
  }

  setYIndex(index) {
    this.yIndex = index;
  }

  getYIndex() {
    return this.yIndex;
  }
}

export default Image;
