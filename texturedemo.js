/**
 * Demonstrates affine and perspective-correct texture mapping using HTML5 canvas.
 * Requires
 *   graphics.js
 *   trianglemesh.js
 *   base64texture.js
 *   gl-matrix-min (https://glmatrix.net/)
 *
 * Author: Andrew Lim
 * https://github.com/andrew-lim
 */
class TextureDemo
{
  constructor(mainCanvas, displayWidth=480, displayHeight=360, textureSize=64, fovDegrees=90)
  {
    this.mainCanvas = mainCanvas
    this.displayWidth = displayWidth
    this.displayHeight = displayHeight
    this.textureSize = textureSize
    this.fovRadians = fovDegrees * Math.PI / 180

    this.worldZ = -200
    this.cameraMovement = 0
    this.xrot = 0
    this.yrot = 0
    this.zStep = 4
    this.zMax = -128

    this.mainCanvasContext;
    this.screenImageData;
    this.mesh;
    this.textureIndex = 0
    this.textureImageDatas = []
    this.texturesLoadedCount = 0
    this.texturesLoaded = false
    this.backfaceCullingOn = true
  }

 loadImages() {
    // Draw images on this temporary canvas to grab the ImageData pixels
    let canvas = document.createElement('canvas');
    canvas.width = this.textureSize;
    canvas.height = this.textureSize;
    let context = canvas.getContext('2d');

    let srcs = Base64Texture.getSrcs()
    let div_textures = document.getElementById("div_textures")
    let this2 = this
    for (let i=0; i<srcs.length; ++i) {
      let src = srcs[i];
      let img = document.createElement("img")
      img.onload = function() {
        context.drawImage(img, 0, 0, img.width, img.height);
        this2.textureImageDatas[i] = context.getImageData(0, 0, this2.textureSize, this2.textureSize);
        this2.texturesLoadedCount++
        this2.texturesLoaded = this2.texturesLoadedCount == srcs.length
      };
      img.onclick = function() {
        this2.textureIndex = i
      }
      div_textures.appendChild(img)
      img.src = src
    }
  }

  surfaceNormal(v1, v2, v3)
  {
    let vecAB = vec3.create()
    let vecAC = vec3.create()
    vec3.sub(vecAB, v2, v1)
    vec3.sub(vecAC, v3, v1)
    let crossProduct = vec3.create()
    vec3.cross(crossProduct, vecAB, vecAC)
    let normalized = vec3.create()
    vec3.normalize(normalized, crossProduct)
    return normalized
  }

  multiplyMat4s(mat4s)
  {
    let r = mat4.create()
    for (let i=0; i<mat4s.length; ++i) {
      let m = mat4s[i]
      mat4.multiply(r, r, m)
    }
    return r
  }

  /**
   * Does a perspective divide on vec4 clipping coordinates to get NDC
   */
  clipToNDC(clip)
  {
    let ndc = vec4.create()
    let w = clip[3]
    if (w!=0.0) {
      vec4.set(ndc, clip[0]/w, clip[1]/w, clip[2]/w, 1.0/w)
    }
    return ndc
  }

  createMesh()
  {
    let mesh = new TriangleMesh

    let leftX   = -64
    let rightX  = 64
    let topY    = 64
    let bottomY = -64
    let frontZ  = 64
    let backZ   = frontZ - 128

    let pink   = [255, 192, 203, 255]
    let green  = [0, 255, 0, 255]
    let red    = [255, 0, 0, 255]
    let blue   = [0, 0, 255, 255]
    let yellow = [255, 255, 0, 255]
    let violet = [98, 88, 124, 255]

    let t = null

    // Note: all triangle vertices are defined counter-clockwise

    // South
    t = Triangle.create(leftX, topY, frontZ, leftX, bottomY, frontZ, rightX, topY, frontZ, pink);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0);
    mesh.addTriangle(t)
    t = Triangle.create(leftX, bottomY, frontZ, rightX, bottomY, frontZ, rightX, topY, frontZ, pink);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0);
    mesh.addTriangle(t)

    // East
    t = Triangle.create(rightX, topY, frontZ, rightX, bottomY, frontZ, rightX, topY, backZ, green);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)
    t = Triangle.create(rightX, bottomY, frontZ, rightX, bottomY, backZ, rightX, topY, backZ, green);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)

    // North
    t = Triangle.create(rightX, topY, backZ, rightX, bottomY, backZ, leftX, topY, backZ, blue);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)
    t = Triangle.create(rightX, bottomY, backZ, leftX, bottomY, backZ, leftX, topY, backZ, blue);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)

    // West
    t = Triangle.create(leftX, topY, backZ, leftX, bottomY, backZ, leftX, topY, frontZ, red);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)
    t = Triangle.create(leftX, bottomY, backZ, leftX, bottomY, frontZ, leftX, topY, frontZ, red);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)

    // Top
    t = Triangle.create(leftX, topY, backZ, leftX, topY, frontZ, rightX, topY, backZ, yellow);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)
    t = Triangle.create(leftX, topY, frontZ, rightX, topY, frontZ, rightX, topY, backZ, yellow);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)

    // Bottom
    t = Triangle.create(leftX, bottomY, frontZ, leftX, bottomY, backZ, rightX, bottomY, frontZ, violet);
    t.setTexUVs(0.0, 0.0, 0.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)
    t = Triangle.create(leftX, bottomY, backZ, rightX, bottomY, backZ, rightX, bottomY, frontZ, violet);
    t.setTexUVs(0.0, 1.0, 1.0, 1.0, 1.0, 0.0)
    mesh.addTriangle(t)

    // Rotate in local space around
    let len = mesh.triangles.length
    for (let i=0; i<len; ++i) {
      let t = mesh.triangles[i]
      t.rotateX(this.xrot * Math.PI / 180)
      t.rotateY(this.yrot * Math.PI / 180)
    }

    return mesh
  }

  init() {
    this.loadImages()
    this.bindKeys();
    this.initScreen();
    this.gameCycle();
  }

  ndcToWindow(point, windowWidth, windowHeight)
  {
    let xNDC = point[0]
    let yNDC = point[1]
    let zNDC = point[2]

    // (px/2)xd + ox
    // (py/2)yd + oy
    let ox = windowWidth  / 2
    let oy = (1.0 - 2*yNDC) * windowHeight/2
    let xWindow = windowWidth /  2 * xNDC + ox
    let yWindow = windowHeight / 2 * yNDC + oy
    let zWindow = zNDC

    return [xWindow, yWindow, zWindow]
  }

  initScreen() {;
    this.mainCanvasContext = this.mainCanvas.getContext('2d');
    this.mainCanvas.width = this.displayWidth;
    this.mainCanvas.height = this.displayHeight;
  }

  // bind keyboard events to game functions (movement, etc)
  bindKeys() {
    let this2 = this
    document.onkeydown = function(e) {
      e = e || window.event;
      switch (e.keyCode) { // which key was pressed?
        case 82: // R - reset payer
          this2.xrot = 0
          this2.yrot = 0
          this2.worldZ = -200
          break;
        case 38: // up
        case 87: // W - move forwards
          this2.cameraMovement = 1;
          break;
        case 40: // down
        case 83: // S - move backwards
          this2.cameraMovement = -1;
          break;
      }
    }

    document.onkeyup = function(e) {
      e = e || window.event;
      switch (e.keyCode) {
        case 38: // Up
        case 40: // Down
        case 87: // W
        case 83: // S
          this2.cameraMovement = 0; // stop the player movement when W/S keys are released
          break;
        case 66: // B
          this2.backfaceCullingOn = !this2.backfaceCullingOn
          break
      }
    }
  }

  move() {
    if (this.cameraMovement == 1) {
      let newY = this.worldZ + this.zStep
      if (newY < this.zMax) {
        this.worldZ = newY;
      }
    }
    else if (this.cameraMovement == -1) {
      let newY = this.worldZ - this.zStep
      if (newY < this.zMax) {
        this.worldZ = newY;
      }
    }
    this.xrot += 1
    this.yrot += 1
    this.xrot = this.xrot % 360
    this.yrot = this.yrot % 360
  }

  gameCycle() {
    if (this.texturesLoaded) {
      this.move();
      this.drawWorld();
    }
    var this2 = this
    setTimeout(function() {
      this2.gameCycle()
    },1000/30);
  }

  drawWorld()
  {
    this.mesh = this.createMesh()
    this.screenImageData = this.mainCanvasContext.createImageData(this.displayWidth, this.displayHeight);

    for (let count=0; count<2; count++) {
      for (let i=0; i<this.mesh.triangles.length; ++i) {
        let t = this.mesh.triangles[i]

        // Triangle Vertex Coordinates
        let v1 = vec4.fromValues(t.getPointX(0), t.getPointY(0), t.getPointZ(0), 1)
        let v2 = vec4.fromValues(t.getPointX(1), t.getPointY(1), t.getPointZ(1), 1)
        let v3 = vec4.fromValues(t.getPointX(2), t.getPointY(2), t.getPointZ(2), 1)

        // Create ModelView Matriz
        let translate = mat4.create()
        mat4.fromTranslation(translate, [0,0,this.worldZ])
        let modelViewMatrix = translate

        // Create Projection Matrix
        let proj = mat4.create();
        mat4.perspective(proj, this.fovRadians, (this.displayWidth/2)/this.displayHeight,  0.1, 1000)

        // Combine Projection and ModelView Matrices
        let modelViewProjectionMatrix = this.multiplyMat4s([proj, modelViewMatrix])

        // Apply Projection and ModelView to get clipped vertices
        let clip1 = vec4.create()
        let clip2 = vec4.create()
        let clip3 = vec4.create()
        vec4.transformMat4(clip1, v1, modelViewProjectionMatrix)
        vec4.transformMat4(clip2, v2, modelViewProjectionMatrix)
        vec4.transformMat4(clip3, v3, modelViewProjectionMatrix)

        // Perspective Division to get NDC
        let ndc1 = this.clipToNDC(clip1)
        let ndc2 = this.clipToNDC(clip2)
        let ndc3 = this.clipToNDC(clip3)

        // Backface Culling Check
        if (this.backfaceCullingOn && this.surfaceNormal(ndc1, ndc2, ndc3)[2]<0) {
          continue;
        }

        // NDC to Window Coordinates
        let win1 = this.ndcToWindow(ndc1, this.displayWidth/2, this.displayHeight)
        let win2 = this.ndcToWindow(ndc2, this.displayWidth/2, this.displayHeight)
        let win3 = this.ndcToWindow(ndc3, this.displayWidth/2, this.displayHeight)

        if (document.getElementById("cb_solid").checked) {
          Graphics.fillTriangle(this.screenImageData,
                                win1[0], win1[1],
                                win2[0], win2[1],
                                win3[0], win3[1], t.color);
        }
        else {
          let textureImageData = this.textureImageDatas[this.textureIndex]

          // Draw affine textured mesh
          if (count == 0) {
            Graphics.affineTexturedTriangle(this.screenImageData,
                                            win1[0], win1[1], t.getTexU(0), t.getTexV(0),
                                            win2[0], win2[1], t.getTexU(1), t.getTexV(1),
                                            win3[0], win3[1], t.getTexU(2), t.getTexV(2),
                                            textureImageData);
          }
          // Draw perspective correct textured mesh
          else {
            Graphics.texturedTriangle(this.screenImageData,
                                      win1[0], win1[1], t.getTexU(0), t.getTexV(0), clip1[3],
                                      win2[0], win2[1], t.getTexU(1), t.getTexV(1), clip2[3],
                                      win3[0], win3[1], t.getTexU(2), t.getTexV(2), clip3[3],
                                      textureImageData);
          }
        }

        if (document.getElementById("cb_wireframe").checked) {
          Graphics.drawTriangleWireframe(this.screenImageData, win1[0], win1[1], win2[0], win2[1], win3[0], win3[1], [255, 0, 255, 255]);
        }


      } // this.mesh.triangles.length

      // Draw affine textured mesh on the left
      if (count ==0 ) {
        this.mainCanvasContext.putImageData(this.screenImageData, 0, 0);
      }
      // Draw perspective-correct textured mesh on the right
      else {
        this.mainCanvasContext.putImageData(this.screenImageData, this.displayWidth/2, 0);
      }

    } // count
  }
}