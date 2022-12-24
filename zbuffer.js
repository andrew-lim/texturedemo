class ZBuffer
{
  constructor(w, h, v=0)
  {
    this.w = w
    this.h = h
    this.buffer = []
    this.clear(v)
  }

  width()
  {
    return this.w
  }


  height()
  {
    return this.h
  }

  clear(v=0)
  {
    for (let x=0; x<this.w; ++x) {
      for (let y=0; y<this.h; ++y) {
        if (!this.buffer[x]) {
          this.buffer[x] = []
        }
        this.buffer[x][y] = v
      }
    }
  }

  set(x, y, v)
  {
    this.buffer[x][y] = v
  }

  get(x, y)
  {
    return this.buffer[x][y]
  }

  safeGet(x, y)
  {
    if (x<0 || x>=this.width()) {
      throw "x is outside buffer width: "+x
    }
    if (y<0 || y>=this.height()) {
      throw "y is outside buffer height: "+y
    }
    return this.buffer[x][y]
  }

  safeSet(x, y, v)
  {
    if (x<0 || x>=this.width()) {
      throw "x is outside buffer width: "+x
    }
    if (y<0 || y>=this.height()) {
      throw "y is outside buffer height: "+y
    }
    this.buffer[x][y] = v
  }
}