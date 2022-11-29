class Triangle
{
  constructor()
  {
    this.vertices = [
      new Vertex(),
      new Vertex(),
      new Vertex()
    ]
    this.color = [255,0,0,255]
    this.affine = false
  }

  getVertices()
  {
    return this.vertices
  }

  getTexCoord(ptindex)
  {
    return this.vertices[ptindex].getTexCoords()
  }

  getTexU(ptindex)
  {
    return this.vertices[ptindex].getTexCoords().getX()
  }

  getTexV(ptindex)
  {
    return this.vertices[ptindex].getTexCoords().getY()
  }

  setTexUVs(u1, v1, u2, v2, u3, v3)
  {
    this.vertices[0].setTexCoords(new Vector4f(u1, v1))
    this.vertices[1].setTexCoords(new Vector4f(u2, v2))
    this.vertices[2].setTexCoords(new Vector4f(u3, v3))
  }

  getPoint(ptindex)
  {
    return this.vertices[ptindex]
  }

  getPointX(ptindex)
  {
    return this.vertices[ptindex].get(0)
  }

  getPointY(ptindex)
  {
    return this.vertices[ptindex].get(1)
  }

  getPointZ(ptindex)
  {
    return this.vertices[ptindex].get(2)
  }

  getPointW(ptindex)
  {
   return this.vertices[ptindex].get(3)
  }

  static createFromVertices(v1, v2, v3)
  {
    let t = new Triangle
    t.vertices = [
      v1, v2, v3
    ]
    return t
  }

  static createFromVec4(a, b, c)
  {
    let t = new Triangle
    t.vertices = [
      new Vertex(new Vector4f(a[0], a[1], a[2], a[3])),
      new Vertex(new Vector4f(b[0], b[1], b[2], b[3])),
      new Vertex(new Vector4f(c[0], c[1], c[2], c[3]))
    ]
    return t
  }

  static create(x1, y1, z1, x2, y2, z2, x3, y3, z3, color='white')
  {
    let t = new Triangle

    t.vertices = [
      new Vertex(new Vector4f(x1, y1, z1, 1)),
      new Vertex(new Vector4f(x2, y2, z2, 1)),
      new Vertex(new Vector4f(x3, y3, z3, 1)),
    ]

    t.color = color
    return t
  }

  rotateX(rad)
  {
    let b = vec3.create()
    let a = this.vertices[0].getPos().getArray();
    vec3.rotateX(a, a, b, rad)
    a = this.vertices[1].getPos().getArray();
    vec3.rotateX(a, a, b, rad)
    a = this.vertices[2].getPos().getArray();
    vec3.rotateX(a, a, b, rad)
  }

  rotateY(rad)
  {
    let b = vec3.create()
    let a = this.vertices[0].getPos().getArray();
    vec3.rotateY(a, a, b, rad)
    a = this.vertices[1].getPos().getArray();
    vec3.rotateY(a, a, b, rad)
    a = this.vertices[2].getPos().getArray();
    vec3.rotateY(a, a, b, rad)
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

