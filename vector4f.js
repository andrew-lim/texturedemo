/**
 * Holds a Float32Array(4) to represent a 4D vector
 */
class Vector4f
{
  constructor(x=0, y=0, z=0, w=1)
  {
    this.parts = new Float32Array(4)
    this.parts[0] = x
    this.parts[1] = y
    this.parts[2] = z
    this.parts[3] = w
  }

  getArray()
  {
    return this.parts
  }

  static zero()
  {
    return new Vector4f(0,0,0,0)
  }

  static createFromVec4(vec4)
  {
    return new Vector4f(vec4[0], vec4[1], vec4[2], vec4[3])
  }

  get(index)
  {
    return this.parts[index]
  }

  getX()
  {
    return this.parts[0]
  }

  getY()
  {
    return this.parts[1]
  }

  getZ()
  {
    return this.parts[2]
  }

  getW()
  {
    return this.parts[3]
  }

  add(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.getX() + r.getX(), this.getY() + r.getY(), this.getZ() + r.getZ(), this.getW() + r.getW());
    }
    return new Vector4f(this.getX() + r, this.getY() + r, this.getZ() + r, this.getW() + r);
  }

  sub(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.getX() - r.getX(), this.getY() - r.getY(), this.getZ() - r.getZ(), this.getW() - r.getW());
    }
    return new Vector4f(this.getX() - r, this.getY() - r, this.getZ() - r, this.getW() - r);
  }

  mul(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.getX() * r.getX(), this.getY() * r.getY(), this.getZ() * r.getZ(), this.getW() * r.getW());
    }
    return new Vector4f(this.getX() * r, this.getY() * r, this.getZ() * r, this.getW() * r);
  }

  div(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.getX() / r.getX(), this.getY() / r.getY(), this.getZ() / r.getZ(), this.getW() / r.getW());
    }
    return new Vector4f(this.getX() / r, this.getY() / r, this.getZ() / r, this.getW() / r);
  }

  abs()
  {
    return new Vector4f(Math.abs(this.getX()), Math.abs(this.getY()), Math.abs(this.getZ()), Math.abs(this.getW()));
  }

  stringify()
  {
    return "(" + this.getX() + ", " + this.getY() + ", " + this.getZ() + ", " + this.getW() + ")";
  }

  equals(r)
  {
    return this.getX()==r.getX() && this.getY()==r.getY() && this.getZ()==r.getZ() && this.getW()==r.getW()
  }

  lerp(dest, lerpFactor)
  {
    return dest.sub(this).mul(lerpFactor).add(this)
  }
}