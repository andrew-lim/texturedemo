class Vertex
{
  constructor(pos=Vector4f.zero(), texcoords=Vector4f.zero())
  {
    this.pos = pos
    this.texcoords = texcoords
  }

  getPos()
  {
    return this.pos
  }

  getTexCoords()
  {
    return this.texcoords
  }

  setTexCoords(texcoords)
  {
    this.texcoords = texcoords
  }

  get(index)
  {
    return this.pos.get(index)
  }

  getX()
  {
    return this.pos.getX()
  }

  getY()
  {
    return this.pos.getY()
  }

  getZ()
  {
    return this.pos.getZ()
  }

  getW()
  {
    return this.pos.getW()
  }

  isInsideViewFrustum()
  {
    return this.isInsideXPlanes() && this.isInsideYPlanes() && this.isInsideZPlanes()
  }

  isInsideXPlanes()
  {
    return Math.abs(this.pos.getX()) <= Math.abs(this.pos.getW())
  }

  isInsideYPlanes()
  {
    return Math.abs(this.pos.getY()) <= Math.abs(this.pos.getW())
  }

  isInsideZPlanes()
  {
    return Math.abs(this.pos.getZ()) <= Math.abs(this.pos.getW())
  }

  lerp(other, lerpFactor)
  {
    const newPos = this.pos.lerp(other.pos, lerpFactor)
    const newTex = this.texcoords.lerp(other.texcoords, lerpFactor)
    return new Vertex(newPos, newTex)
  }
}