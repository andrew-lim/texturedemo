class Triangle
{
  constructor()
  {
    this.vertices = [
      new Float32Array(3),
      new Float32Array(3),
      new Float32Array(3)
    ]
    this.texcoords = [
      new Float32Array(2),
      new Float32Array(2),
      new Float32Array(2)
    ]
    this.color = [255,0,0,255]
    this.affine = false
  }

  getTexCoord(ptindex)
  {
    return this.texcoords[ptindex]
  }

  getTexU(ptindex)
  {
    return this.texcoords[ptindex][0]
  }

  getTexV(ptindex)
  {
    return this.texcoords[ptindex][1]
  }

  setTexUVs(u1, v1, u2, v2, u3, v3)
  {
    this.texcoords[0][0] = u1
    this.texcoords[0][1] = v1
    this.texcoords[1][0] = u2
    this.texcoords[1][1] = v2
    this.texcoords[2][0] = u3
    this.texcoords[2][1] = v3
  }

  getPoint(ptindex)
  {
    return this.vertices[ptindex]
  }

  getPointX(ptindex)
  {
    return this.vertices[ptindex][0]
  }

  getPointY(ptindex)
  {
    return this.vertices[ptindex][1]
  }

  getPointZ(ptindex)
  {
    return this.vertices[ptindex][2]
  }

  static create(x1, y1, z1, x2, y2, z2, x3, y3, z3, color='white')
  {
    let t = new Triangle
    t.vertices[0][0] = x1
    t.vertices[0][1] = y1
    t.vertices[0][2] = z1
    t.vertices[1][0] = x2
    t.vertices[1][1] = y2
    t.vertices[1][2] = z2
    t.vertices[2][0] = x3
    t.vertices[2][1] = y3
    t.vertices[2][2] = z3
    t.color = color
    return t
  }

  copyTriangle(t2)
  {
    let t = this

    t.vertices[0][0] = t2.vertices[0][0]
    t.vertices[0][1] = t2.vertices[0][1]
    t.vertices[0][2] = t2.vertices[0][2]
    t.vertices[1][0] = t2.vertices[1][0]
    t.vertices[1][1] = t2.vertices[1][1]
    t.vertices[1][2] = t2.vertices[1][2]
    t.vertices[2][0] = t2.vertices[2][0]
    t.vertices[2][1] = t2.vertices[2][1]
    t.vertices[2][2] = t2.vertices[2][2]

    t.texcoords[0][0] = t2.texcoords[0][0]
    t.texcoords[0][1] = t2.texcoords[0][1]
    t.texcoords[1][0] = t2.texcoords[1][0]
    t.texcoords[1][1] = t2.texcoords[1][1]
    t.texcoords[2][0] = t2.texcoords[2][0]
    t.texcoords[2][1] = t2.texcoords[2][1]

    t.color = t2.color

    return this
  }

  clone()
  {
    let t = this
    let t2 = new Triangle
    t2.copyTriangle(t)
    return t2
  }

  translate(x=0, y=0, z=0)
  {
    this.vertices[0][0] += x
    this.vertices[1][0] += x
    this.vertices[2][0] += x

    this.vertices[0][1] += y
    this.vertices[1][1] += y
    this.vertices[2][1] += y

    this.vertices[0][2] += z
    this.vertices[1][2] += z
    this.vertices[2][2] += z
  }

  rotateX(rad)
  {
    let b = vec3.create()
    let a = this.vertices[0];
    vec3.rotateX(this.vertices[0], a, b, rad)
    a = this.vertices[1];
    vec3.rotateX(this.vertices[1], a, b, rad)
    a = this.vertices[2];
    vec3.rotateX(this.vertices[2], a, b, rad)
  }

  rotateY(rad)
  {
    let b = vec3.create()
    let a = this.vertices[0];
    vec3.rotateY(this.vertices[0], a, b, rad)
    a = this.vertices[1];
    vec3.rotateY(this.vertices[1], a, b, rad)
    a = this.vertices[2];
    vec3.rotateY(this.vertices[2], a, b, rad)
  }
}

class TriangleMesh
{
  constructor()
  {
    this.triangles = [];
  }

  addTriangle(t)
  {
    this.triangles.push(t)
  }
}

