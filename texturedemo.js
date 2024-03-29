/**
 * Demonstrates affine and perspective-correct texture mapping using HTML5 canvas.
 * Requires
 *   vertex.js
 *   vector4f.js
 *   graphics.js
 *   triangle.js
 *   base64texture.js
 *   gl-matrix-min (https://glmatrix.net/)
 *
 * Author: Andrew Lim
 * https://github.com/andrew-lim
 */
const KEY_LEFT  = 37
const KEY_RIGHT = 39
const KEY_UP    = 38
const KEY_DOWN  = 40
const KEY_W     = 87
const KEY_S     = 83
const KEY_A     = 65
const KEY_D     = 68
const KEY_E     = 69
const KEY_Q     = 81
const KEY_N     = 78

class TextureDemo
{
  constructor(mainCanvas, displayWidth=640, displayHeight=360, textureSize=64, fovDegrees=90)
  {
    this.mainCanvas = mainCanvas
    this.displayWidth = displayWidth
    this.displayHeight = displayHeight
    this.textureSize = textureSize
    this.fovRadians = fovDegrees * Math.PI / 180

    this.worldX = 0
    this.worldY = 0
    this.worldZ = -200
    this.cameraMovement = 0
    this.xrot = 0
    this.yrot = 0
    this.zStep = 4
    this.xStep = this.zStep
    this.yStep = this.zStep
    this.zMax = -128

    this.mainCanvasContext;
    this.screenImageData;
    this.mesh;
    this.textureIndex = 0
    this.textureImageDatas = []
    this.texturesLoadedCount = 0
    this.texturesLoaded = false
    this.keys = []
    this.zbuffer = new ZBuffer(displayWidth, displayHeight)
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

  /**
   * Chain mat4.multiply calls
   */
  multiplyMat4s(mat4s)
  {
    let r = mat4.create()
    for (let m of mat4s) {
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
    // UV coordinates start from the bottom-left (0,0) of an image
    // Top-right would be (1,1)

    // South
    t = Triangle.create(leftX, topY, frontZ, leftX, bottomY, frontZ, rightX, topY, frontZ, pink);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    t = Triangle.create(leftX, bottomY, frontZ, rightX, bottomY, frontZ, rightX, topY, frontZ, pink);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    // East
    t = Triangle.create(rightX, topY, frontZ, rightX, bottomY, frontZ, rightX, topY, backZ, green);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)
    t = Triangle.create(rightX, bottomY, frontZ, rightX, bottomY, backZ, rightX, topY, backZ, green);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    // North
    t = Triangle.create(rightX, topY, backZ, rightX, bottomY, backZ, leftX, topY, backZ, blue);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)
    t = Triangle.create(rightX, bottomY, backZ, leftX, bottomY, backZ, leftX, topY, backZ, blue);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    // West
    t = Triangle.create(leftX, topY, backZ, leftX, bottomY, backZ, leftX, topY, frontZ, red);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)
    t = Triangle.create(leftX, bottomY, backZ, leftX, bottomY, frontZ, leftX, topY, frontZ, red);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    // Top
    t = Triangle.create(leftX, topY, backZ, leftX, topY, frontZ, rightX, topY, backZ, yellow);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)
    t = Triangle.create(leftX, topY, frontZ, rightX, topY, frontZ, rightX, topY, backZ, yellow);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)

    // Bottom
    t = Triangle.create(leftX, bottomY, frontZ, leftX, bottomY, backZ, rightX, bottomY, frontZ, violet);
    t.setTexUVs(0.0, 1.0, 0.0, 0.0, 1.0, 1.0);
    mesh.addTriangle(t)
    t = Triangle.create(leftX, bottomY, backZ, rightX, bottomY, backZ, rightX, bottomY, frontZ, violet);
    t.setTexUVs(0.0, 0.0, 1.0, 0.0, 1.0, 1.0);
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
    this.initScreen();
    this.bindKeys();
    this.loadImages()
    this.gameCycle();
  }

  ndcToWindow(point, windowWidth, windowHeight)
  {
    let xNDC = point[0]
    let yNDC = point[1]
    let zNDC = point[2]

    // Hack to make sure right and bottom edges are really clipped
    // to prevent drawing outside viewport
    windowWidth = windowWidth-1
    windowHeight = windowHeight-1

    let xWindow = Math.trunc(windowWidth/2*xNDC + windowWidth/2)
    let yWindow = Math.trunc((-yNDC)*windowHeight/2 + windowHeight/2)
    let zWindow = zNDC
    return [xWindow, yWindow, zWindow]
  }

  initScreen() {;
    // this.mainCanvasContext = this.mainCanvas.getContext('2d');
    // this.mainCanvas.width = this.displayWidth;
    // this.mainCanvas.height = this.displayHeight;

    const SCREEN_WIDTH = this.displayWidth//848
    const SCREEN_HEIGHT = this.displayHeight // 480

    this.mainCanvasContext = this.mainCanvas.getContext('2d');
    let screen = document.getElementById("screen");
    this.mainCanvas.width = (this.displayWidth);
    this.mainCanvas.height = (this.displayHeight);
    screen.style.width = (SCREEN_WIDTH) + "px";
    screen.style.height = (SCREEN_HEIGHT) + "px";
    this.mainCanvas.style.width = SCREEN_WIDTH
    this.mainCanvas.style.height = SCREEN_HEIGHT
  }

  // bind keyboard events to game functions (movement, etc)
  bindKeys() {
    let this2 = this
    document.onkeydown = function(e) {
      e = e || window.event;
      this2.keys[e.keyCode] = true
      switch (e.keyCode) { // which key was pressed?
        case 82: // R - reset payer
          this2.xrot = 0
          this2.yrot = 0
          this2.worldZ = -200
          this2.worldX = 0
          this2.worldY = 0
          break;
      }
    }

    document.onkeyup = function(e) {
      e = e || window.event;
      this2.keys[e.keyCode] = false
    }
  }

  move() {
    if (this.keys[KEY_W]) {
      this.worldZ += this.zStep;
    }
    else if (this.keys[KEY_S]) {
      this.worldZ -= this.zStep;
    }
    if (this.keys[KEY_A]) {
      this.worldX += this.xStep
    }
    if (this.keys[KEY_D]) {
      this.worldX -= this.xStep
    }
    if (this.keys[KEY_E]) {
      this.worldY += this.yStep
    }
    if (this.keys[KEY_Q]) {
      this.worldY -= this.yStep
    }
    if (this.keys[KEY_LEFT]) {
      this.yrot += -1
    }
    if (this.keys[KEY_RIGHT]) {
      this.yrot += 1
    }
    if (this.keys[KEY_UP]) {
      this.xrot += -1
    }
    if (this.keys[KEY_DOWN]) {
      this.xrot += 1
    }
    this.xrot = this.xrot % 360
    this.yrot = this.yrot % 360
  }

  gameCycle() {
    if (this.texturesLoaded) {
      this.move();
      this.drawWorld();
    }
    var this2 = this
    window.requestAnimationFrame(function(){
      this2.gameCycle()
    });
  }


  drawWorld()
  {
    this.mesh = this.createMesh()
    if (!this.screenImageData) {
      this.screenImageData = this.mainCanvasContext.createImageData(this.displayWidth, this.displayHeight);
      this.blankImageData  = this.mainCanvasContext.createImageData(this.displayWidth, this.displayHeight);
    }

    // Clear the screen data
    this.screenImageData.data.set(this.blankImageData.data)

    this.zbuffer.clear()

    for (let i=0; i<this.mesh.triangles.length; ++i) {
      let t = this.mesh.triangles[i]

      // Create ModelView Matriz
      let translate = mat4.create()
      mat4.fromTranslation(translate, [this.worldX, this.worldY, this.worldZ])
      let modelViewMatrix = translate

      // Create Projection Matrix
      let proj = mat4.create();
      mat4.perspective(proj, this.fovRadians, (this.displayWidth)/(this.displayHeight), 1, 1000)

      // Combine Projection and ModelView Matrices
      let modelViewProjectionMatrix = this.multiplyMat4s([proj, modelViewMatrix])

      // Triangle Vertex Coordinates
      let v1 = t.getPoint(0).getPos().getArray()
      let v2 = t.getPoint(1).getPos().getArray()
      let v3 = t.getPoint(2).getPos().getArray()

      // Apply Projection and ModelView to get clip coordinates
      let clip1 = vec4.create()
      let clip2 = vec4.create()
      let clip3 = vec4.create()
      vec4.transformMat4(clip1, v1, modelViewProjectionMatrix)
      vec4.transformMat4(clip2, v2, modelViewProjectionMatrix)
      vec4.transformMat4(clip3, v3, modelViewProjectionMatrix)

      // Create a triangle with clip coordinates
      let clipVertex1 = new Vertex(Vector4f.createFromVec4(clip1), t.getTexCoord(0))
      let clipVertex2 = new Vertex(Vector4f.createFromVec4(clip2), t.getTexCoord(1))
      let clipVertex3 = new Vertex(Vector4f.createFromVec4(clip3), t.getTexCoord(2))
      let triangleToClip = Triangle.createFromVertices(clipVertex1, clipVertex2, clipVertex3)
      triangleToClip.color = t.color

      // Clip the triangle to the frustrum volume
      let clippedTriangles = ClipSpace.clipTrianglesByAllPlanes([triangleToClip])

      for( let triangle of clippedTriangles) {
        // Perspective Division to get NDC
        let ndc1 = this.clipToNDC(triangle.getPoint(0).getPos().getArray())
        let ndc2 = this.clipToNDC(triangle.getPoint(1).getPos().getArray())
        let ndc3 = this.clipToNDC(triangle.getPoint(2).getPos().getArray())

        // Backface Culling Check
        let backfaceCullingOn = document.getElementById("cb_backfaceCulling").checked
        if (backfaceCullingOn && Graphics.crossProduct2D(ndc1, ndc2, ndc3)<0) {
          continue;
        }

        // // NDC to Window Coordinates
        const viewWidth = this.displayWidth
        const viewHeight = this.displayHeight
        let win1 = this.ndcToWindow(ndc1, viewWidth, viewHeight)
        let win2 = this.ndcToWindow(ndc2, viewWidth, viewHeight)
        let win3 = this.ndcToWindow(ndc3, viewWidth, viewHeight)

        let textureImageData = this.textureImageDatas[this.textureIndex]
        const zbufferOn = document.getElementById("cb_zbuffer").checked

        if (document.getElementById("radioDrawModeSolid").checked) {
          Graphics.fillTriangle(this.screenImageData,
                                win1[0], win1[1],
                                win2[0], win2[1],
                                win3[0], win3[1], triangleToClip.color);
        }

        else if (document.getElementById("radioDrawModeAffine").checked) {
          Graphics.affineTexturedTriangle(this.screenImageData,
                                          win1[0], win1[1], triangle.getTexU(0), triangle.getTexV(0),
                                          win2[0], win2[1], triangle.getTexU(1), triangle.getTexV(1),
                                          win3[0], win3[1], triangle.getTexU(2), triangle.getTexV(2),
                                          textureImageData);
        }
        else {
          Graphics.texturedTriangle(this.screenImageData,
                                    win1[0], win1[1], triangle.getTexU(0), triangle.getTexV(0), triangle.getPointW(0),
                                    win2[0], win2[1], triangle.getTexU(1), triangle.getTexV(1), triangle.getPointW(1),
                                    win3[0], win3[1], triangle.getTexU(2), triangle.getTexV(2), triangle.getPointW(2),
                                    textureImageData,
                                    zbufferOn?this.zbuffer:null);
        }

        if (document.getElementById("cb_wireframe").checked) {
          Graphics.drawTriangleWireframe(this.screenImageData, win1[0], win1[1], win2[0], win2[1], win3[0], win3[1], [255, 255, 0, 255]);
        }
      } // for trianglesToDraw


    } // this.mesh.triangles.length

    this.mainCanvasContext.putImageData(this.screenImageData, 0, 0);
  }
}