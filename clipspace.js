/**
 * Clip space utilty class
 *
 * Author: Andrew Lim
 * https://github.com/andrew-lim
 */
class ClipSpace
{
  /*
  Finds the interpolation amount based off 2 homogeneous points,
  1 outside the clipping plane, and 1 inside the clipping plane.
  The clipping plane is based on their w components

  Uses the formula for ratio between 2 signed distances

    d1/(d1-d2)

  Let N be inside normal of clipping plane, then
    d1 is the signed distance between source point and N
    d2 is the signed distance between destination point and N

  Full explanation for this formula here:
  https://fabiensanglard.net/polygon_codec/clippingdocument/Clipping.pdf

  @param src source point to lerp from
  @param dst destination point
  @param ixyz Axis part - 0, 1, or 3
  @param planeSign Either 1 or -1
  */
  static findLerpFactor(src, dst, ixyz, planeSign)
  {
    // const N = -planeSign
    const d1 = (src.get(ixyz) - src.getW()*planeSign) // * N
    const d2 = (dst.get(ixyz) - dst.getW()*planeSign) // * N
    return d1/(d1-d2)
  }

  /**
   * Clips a Triangle by one of the xyz planes
   * @param triangle  Triangle to clip
   * @param ixyz      0/1/2 for x/y/z planes respectively
   * @param planeSign 1 for positive plane, -1 for negative plane
   * @return new triangles clipped from original
   */
  static clipTriangle(triangle, ixyz, planeSign)
  {
    let triangles = []

    let insidePoints = []
    let outsidePoints = []
    let insideIndices = []
    let outsideIndices = []

    for (let i=0; i<3; ++i) {
      const pt = triangle.getPoint(i)
      const xyz = pt.get(ixyz)
      const w = pt.getW()
      const outside = (planeSign<0 && xyz<-w) || (planeSign>0 && xyz>w)
      if (outside) {
        outsidePoints.push(pt)
        outsideIndices.push(i)
      }
      else {
        insidePoints.push(pt)
        insideIndices.push(i)
      }
    }

    if (3==outsidePoints.length) {
      // Triangle is outside this plane
    }

    else if (3==insidePoints.length) {
      // Triangle is completely inside this plane
      triangles.push(triangle)
    }

    // 2 points outside, create a smaller triangle
    else if (2==outsidePoints.length && 1==insidePoints.length) {
      const a = insidePoints[0]
      const b = outsidePoints[0]
      const c = outsidePoints[1]
      const ai = insideIndices[0]
      const bi = outsideIndices[0]
      const bt = ClipSpace.findLerpFactor(b, a, ixyz, planeSign)
      const ct = ClipSpace.findLerpFactor(c, a, ixyz, planeSign)
      const b1 = b.lerp(a, bt)
      const c1 = c.lerp(a, ct)

      // Preserve winding order
      // B follows A
      if ( ((ai+1)%3)==bi ) {
         triangles.push(Triangle.createFromVertices(a, b1, c1))
      }
      // C follows A
      else {
         triangles.push(Triangle.createFromVertices(a, c1, b1))
      }
    }

    // 1 point outside, create 2 smaller triangles
    else if (1==outsidePoints.length && 2==insidePoints.length) {
      const a = insidePoints[0]
      const b = outsidePoints[0]
      const c = insidePoints[1]
      const ai = insideIndices[0]
      const bi = outsideIndices[0]
      const abt = ClipSpace.findLerpFactor(b, a, ixyz, planeSign)
      const cbt = ClipSpace.findLerpFactor(b, c, ixyz, planeSign)
      const a1 = b.lerp(a, abt)
      const c1 = b.lerp(c, cbt)

      // Preserve winding order
      // B follows A
      if ( ((ai+1)%3)==bi ) {
        triangles.push(Triangle.createFromVertices(a, a1, c1))
        triangles.push(Triangle.createFromVertices(a, c1, c))
      }
      // C follows A
      else {
        triangles.push(Triangle.createFromVertices(a, c, c1))
        triangles.push(Triangle.createFromVertices(a, c1, a1))
      }
    }

    return triangles
  }

  /**
   * Clips the given triangles by a single plane
   * @param ixyz      0/1/2 for x/y/z planes respectively
   * @param planeSign 1 for positive plane, -1 for negative plane
   * @return new array of clipped triangles
   */
  static clipTrianglesByPlane(triangles, ixyz, planeSign)
  {
    let triangles2 = []
    for (let t of triangles) {
      triangles2.push(...ClipSpace.clipTriangle(t, ixyz, planeSign))
    }
    return triangles2
  }

  /**
   * Clips the given triangles by all the X/Y/Z planes and returns
   * the resulting new triangles
   *
   * @param triangles array of Triangles to clip
   * @return new array of clipped Triangles
   */
  static clipTrianglesByAllPlanes(triangles)
  {
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 2, -1) // near
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 2, 1)  // far
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 0, 1)  // right
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 0, -1) // left
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 1, 1)  // top
    triangles = ClipSpace.clipTrianglesByPlane(triangles, 1, -1) // bottom
    return triangles
  }
}