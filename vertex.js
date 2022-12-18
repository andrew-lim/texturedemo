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
    let newPos = this.pos.lerp(other.pos, lerpFactor)
    let newTex = this.texcoords.lerp(other.texcoords, lerpFactor)
    return new Vertex(newPos, newTex)
  }

  /*
  Finds the interpolation amount based off 2 homogeneous points,
  1 outside the clipping plane, and 1 inside the clipping plane.

  Uses the formula for distance between a point and line segment.

    d1/(d1-d2)

  Let N be inside normal of clipping plane, then
    d1 is the signed distance between outside point and N
    d2 is the signed distance between inside point and N

  Full explanation for this formula here:
  https://fabiensanglard.net/polygon_codec/clippingdocument/Clipping.pdf

  @param pout outside point
  @param pin  inside point
  @param ixyz Axis part - 0, 1, or 3
  @param planeSign Either 1 or -1
  */
  static findLerpFactor(pout, pin, ixyz, xyzSign)
  {
    const d1 = pout.get(ixyz) * xyzSign - pout.getW()
    const d2 = pin.get(ixyz) * xyzSign - pin.getW()
    return d1/(d1-d2)
  }
}