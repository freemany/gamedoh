class Image {
  constructor(images) {
    this.images = images;
    this.index = 0;
    this.imageCount = images.length;
  }

  getWidth() {
    return this.images[0][0].length;
  }

  getHeight() {
    return this.images[0].length;
  }

  getImage() {
    return this.images[this.index];
  }

  next() {
    this.index = this.index === this.imageCount - 1 ? 0 : this.index + 1;
  }
}

export default Image;
