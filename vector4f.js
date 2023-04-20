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
      return new Vector4f(this.parts[0] + r.parts[0],
                          this.parts[1] + r.parts[1],
                          this.parts[2] + r.parts[2],
                          this.parts[3] + r.parts[3]);
    }
    return new Vector4f(this.parts[0] + r, this.parts[1] + r,
                        this.parts[2] + r, this.parts[3] + r);
  }

  sub(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.parts[0] - r.parts[0],
                          this.parts[1] - r.parts[1],
                          this.parts[2] - r.parts[2],
                          this.parts[3] - r.parts[3]);
    }
    return new Vector4f(this.parts[0] - r, this.parts[1] - r,
                        this.parts[2] - r, this.parts[3] - r);
  }

  mul(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.parts[0] * r.parts[0],
                          this.parts[1] * r.parts[1],
                          this.parts[2] * r.parts[2],
                          this.parts[3] * r.parts[3]);
    }
    return new Vector4f(this.parts[0] * r, this.parts[1] * r,
                        this.parts[2] * r, this.parts[3] * r);
  }

  div(r)
  {
    if (r instanceof Vector4f) {
      return new Vector4f(this.parts[0] / r.parts[0],
                          this.parts[1] / r.parts[1],
                          this.parts[2] / r.parts[2],
                          this.parts[3] / r.parts[3]);
    }
    return new Vector4f(this.parts[0] / r, this.parts[1] / r,
                        this.parts[2] / r, this.parts[3] / r);
  }

  abs()
  {
    return new Vector4f(Math.abs(this.parts[0]),
                        Math.abs(this.parts[1]),
                        Math.abs(this.parts[2]),
                        Math.abs(this.parts[3]));
  }

  stringify()
  {
    return "(" + this.parts[0] + ", "
               + this.parts[1] + ", "
               + this.parts[2] + ", "
               + this.parts[3] + ")";
  }

  equals(r)
  {
    return this.parts[0]==r.parts[0] && this.parts[1]==r.parts[1] &&
           this.parts[2]==r.parts[2] && this.parts[3]==r.parts[3]
  }

  lerp(dest, lerpFactor)
  {
    return new Vector4f(
      this.parts[0] + (dest.parts[0] - this.parts[0]) * lerpFactor,
      this.parts[1] + (dest.parts[1] - this.parts[1]) * lerpFactor,
      this.parts[2] + (dest.parts[2] - this.parts[2]) * lerpFactor,
      this.parts[3] + (dest.parts[3] - this.parts[3]) * lerpFactor
    );
  }
}