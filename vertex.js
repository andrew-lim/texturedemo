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
  Finds the lerp amount based off 2 homogeneous points, 1 outside the clipping plane,
  and 1 inside the clipping plane.

  Following Proof from TheBennyBox
  https://youtu.be/VMD7fsCYO9o?t=571
  https://github.com/BennyQBD/3DSoftwareRenderer/blob/master/src/RenderContext.java#L84

  To find the lerp amount L

    1 = source + (destination - source) * L

    1 = S + (D - S) * L
      = S + DL - SL
      = DL + S(1 - L)
      = S(1-L) + DL
      = S-SL + DL + (L-L)

    1 - S = L-SL-L+DL
          = L(1-S)-L(1-D)
          = L((1-S)-(1-D))

  Lerp factor

      L = 1-S/((1-S)-(1-D))

  Replace 1 with W components

      L = Sw-S / ((Sw-S)-(Dw-D))

  @param src  Source vector (the outside point)
  @param dest Destination vector (the inside point)
  @param ixyz Axis part - 0, 1, or 3
  @param planeSign Either 1 or -1

  */
  static findLerpFactor(src, dest, ixyz, xyzSign)
  {
    let S  = src.get(ixyz) * xyzSign
    let D  = dest.get(ixyz) * xyzSign
    let Sw = src.getW()
    let Dw = dest.getW()
    return (Sw-S)/((Sw-S)-(Dw-D))
  }
}