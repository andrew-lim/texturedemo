/**
 * Utility functions to work with ImageData
 *
 * Author: Andrew Lim
 * https://github.com/andrew-lim
 */
class Graphics
{
    /**
     * https://stackoverflow.com/a/35690009/1645045
     */
    static setPixel(imageData, x, y, r, g, b, a)
    {
      let index = (x + y * imageData.width) * 4
      imageData.data[index+0] = r
      imageData.data[index+1] = g
      imageData.data[index+2] = b
      imageData.data[index+3] = a
    }

    static getPixel(imageData, x, y)
    {
      let index = (x + y * imageData.width) * 4;
      return {
        r : imageData.data[index+0],
        g : imageData.data[index+1],
        b : imageData.data[index+2],
        a : imageData.data[index+3]
      };
    }

    /**
     * Like setPixel but does checking and truncating of passed in values to make sure
     * they are integers
     */
    static getPixelF(imageData, fx, fy)
    {
      let x = Math.min(Math.trunc(fx*imageData.width), imageData.width-1);
      let y = Math.min(Math.trunc(fy*imageData.height), imageData.height-1);
      return Graphics.getPixel(imageData, x, y);
    }

    /**
     * Draw a line using Bresenham's line algorithm
     * Adapted from
     * https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
     */
    static bline(imageData, x0, y0, x1, y1, rgba=[255,255,255,255])
    {
      x0 = Math.round(x0)
      y0 = Math.round(y0)
      x1 = Math.round(x1)
      y1 = Math.round(y1)

      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = (x0 < x1) ? 1 : -1;
      let sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while(true) {
        Graphics.setPixel(imageData, x0, y0, rgba[0], rgba[1], rgba[2], rgba[3]);

        if ((x0 === x1) && (y0 === y1)) break;
        let e2 = 2*err;
        if (e2 > -dy) { err -= dy; x0  += sx; }
        if (e2 < dx) { err += dx; y0  += sy; }
      }
    }

    static drawTriangleWireframe(imageData, x1, y1, x2, y2, x3, y3, rgba=[255,255,255,255])
    {
      Graphics.bline(imageData, x1, y1, x2, y2, rgba);
      Graphics.bline(imageData, x2, y2, x3, y3, rgba);
      Graphics.bline(imageData, x3, y3, x1, y1, rgba);
    }

    static drawLine(ctx, x1, y1, x2, y2, color)
    {
      ctx.strokeStyle = color;
      ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    static fillTriangle(imageData, x1, y1, x2, y2, x3, y3, rgba)
    {
      x1 = Math.trunc( x1 )
      y1 = Math.trunc( y1 )
      x2 = Math.trunc( x2 )
      y2 = Math.trunc( y2 )
      x3 = Math.trunc( x3 )
      y3 = Math.trunc( y3 )

      let tmp = 0;

      if (y2 < y1) {
        tmp = y1; y1 = y2; y2 = tmp;
        tmp = x1; x1 = x2; x2 = tmp;
      }

      if (y3 < y1) {
        tmp = y1; y1 = y3; y3 = tmp;
        tmp = x1; x1 = x3; x3 = tmp;
      }

      if (y3 < y2) {
        tmp = y2; y2 = y3; y3 = tmp;
        tmp = x2; x2 = x3; x3 = tmp;
      }

      let dy1 = y2 - y1
      let dx1 = x2 - x1

      let dy2 = y3 - y1
      let dx2 = x3 - x1

      let dax_step = 0, dbx_step = 0;

      if (dy1) dax_step = dx1 / Math.abs(dy1);
      if (dy2) dbx_step = dx2 / Math.abs(dy2);

      if (dy1) {
        for (let i = Math.trunc(y1); i <= y2; i++) {
          let ax = Math.trunc( x1 + (i - y1) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
          }

          for (let j = ax; j < bx; j++) {
            Graphics.setPixel(imageData, j, i, rgba[0], rgba[1], rgba[2], rgba[3]);
          }
        }
      }

      dy1 = y3 - y2;
      dx1 = x3 - x2;

      if (dy1) dax_step = dx1 / Math.abs(dy1);
      if (dy2) dbx_step = dx2 / Math.abs(dy2);

      if (dy1) {
        for (let i = Math.trunc(y2); i <= y3; i++) {
          let ax = Math.trunc( x2 + (i - y2) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
          }

          for (let j = ax; j < bx; j++) {
            Graphics.setPixel(imageData, j, i, rgba[0], rgba[1], rgba[2], rgba[3]);
          }
        }
      }
    }

    /**
     * Draws an affine textured triangle
     * imageData is the ImageData to draw on
     * The x, y parameters are the triangle screen vertices
     * The u, v parameters are the respective texture coordinates
     * textureImageData the ImageData holding the texture pixels
     */
    static affineTexturedTriangle(imageData,
                                  x1, y1, u1, v1,
                                  x2, y2, u2, v2,
                                  x3, y3, u3, v3,
                                  textureImageData)
    {
      x1 = Math.trunc( x1 )
      y1 = Math.trunc( y1 )
      x2 = Math.trunc( x2 )
      y2 = Math.trunc( y2 )
      x3 = Math.trunc( x3 )
      y3 = Math.trunc( y3 )

      let tmp = 0;

      if (y2 < y1) {
        tmp = y1; y1 = y2; y2 = tmp;
        tmp = x1; x1 = x2; x2 = tmp;
        tmp = u1; u1 = u2; u2 = tmp;
        tmp = v1; v1 = v2; v2 = tmp;
      }

      if (y3 < y1) {
        tmp = y1; y1 = y3; y3 = tmp;
        tmp = x1; x1 = x3; x3 = tmp;
        tmp = u1; u1 = u3; u3 = tmp;
        tmp = v1; v1 = v3; v3 = tmp;
      }

      if (y3 < y2) {
        tmp = y2; y2 = y3; y3 = tmp;
        tmp = x2; x2 = x3; x3 = tmp;
        tmp = u2; u2 = u3; u3 = tmp;
        tmp = v2; v2 = v3; v3 = tmp;
      }

      let dy1 = y2 - y1
      let dx1 = x2 - x1
      let dv1 = v2 - v1
      let du1 = u2 - u1

      let dy2 = y3 - y1
      let dx2 = x3 - x1
      let dv2 = v3 - v1
      let du2 = u3 - u1

      let tex_u, tex_v;

      let dax_step = 0, dbx_step = 0;
      let du1_step = 0, dv1_step = 0;
      let du2_step = 0, dv2_step = 0;

      if (dy1) dax_step = dx1 / Math.abs(dy1)
      if (dy2) dbx_step = dx2 / Math.abs(dy2)

      if (dy1) du1_step = du1 / Math.abs(dy1)
      if (dy1) dv1_step = dv1 / Math.abs(dy1)

      if (dy2) du2_step = du2 / Math.abs(dy2)
      if (dy2) dv2_step = dv2 / Math.abs(dy2)

      if (dy1) {
        for (let i = Math.trunc(y1); i <= y2; i++) {
          let ax = Math.trunc( x1 + (i - y1) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          let tex_su = u1 + (i - y1) * du1_step;
          let tex_sv = v1 + (i - y1) * dv1_step;

          let tex_eu = u1 + (i - y1) * du2_step;
          let tex_ev = v1 + (i - y1) * dv2_step;

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
            tmp = tex_su; tex_su = tex_eu; tex_eu = tmp;
            tmp = tex_sv; tex_sv = tex_ev; tex_ev = tmp;
          }

          tex_u = tex_su;
          tex_v = tex_sv;

          let tstep = 1.0 / (bx - ax);
          let t = 0.0;

          for (let j = ax; j < bx; j++) {
            tex_u = (1.0 - t) * tex_su + t * tex_eu;
            tex_v = (1.0 - t) * tex_sv + t * tex_ev;

            let pixel = Graphics.getPixelF(textureImageData, tex_u, tex_v)
            Graphics.setPixel(imageData, j, i, pixel.r, pixel.g, pixel.b, pixel.a);
            t += tstep;
          }
        }
      }

      dy1 = y3 - y2;
      dx1 = x3 - x2;
      dv1 = v3 - v2;
      du1 = u3 - u2;

      if (dy1) dax_step = dx1 / Math.abs(dy1);
      if (dy2) dbx_step = dx2 / Math.abs(dy2);

      du1_step = 0;
      dv1_step = 0;
      if (dy1) du1_step = du1 / Math.abs(dy1);
      if (dy1) dv1_step = dv1 / Math.abs(dy1);

      if (dy1) {
        for (let i = Math.trunc(y2); i <= y3; i++) {
          let ax = Math.trunc( x2 + (i - y2) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          let tex_su = u2 + (i - y2) * du1_step;
          let tex_sv = v2 + (i - y2) * dv1_step;

          let tex_eu = u1 + (i - y1) * du2_step;
          let tex_ev = v1 + (i - y1) * dv2_step;

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
            tmp = tex_su; tex_su = tex_eu; tex_eu = tmp;
            tmp = tex_sv; tex_sv = tex_ev; tex_ev = tmp;
          }

          tex_u = tex_su;
          tex_v = tex_sv;

          let tstep = 1.0 / (bx - ax);
          let t = 0.0;

          for (let j = ax; j < bx; j++) {
            tex_u = (1.0 - t) * tex_su + t * tex_eu;
            tex_v = (1.0 - t) * tex_sv + t * tex_ev;
            let pixel = Graphics.getPixelF(textureImageData, tex_u, tex_v)
            Graphics.setPixel(imageData, j, i, pixel.r, pixel.g, pixel.b, pixel.a);
            t += tstep;
          }
        }
      }
    }

    /**
     * Draws a perspective correct textured triangle
     * See https://github.com/OneLoneCoder/Javidx9/blob/master/PixelGameEngine/SmallerProjects/OneLoneCoder_PGE_olcEngine3D.cpp
     *
     * imageData is the ImageData to draw on
     * The x, y parameters are the triangle screen vertices
     * The u, v parameters are the respective texture coordinates
     * The w parameters are the w values after projection matrix was applied on the triangle vertices,
     * but before perspective division into normalized device coordinates
     * textureImageData the ImageData holding the texture pixels
     */
    static texturedTriangle(imageData,
                            x1, y1, u1, v1, w1,
                            x2, y2, u2, v2, w2,
                            x3, y3, u3, v3, w3,
                            textureImageData)
    {
      // Only want the integer parts of the triangle vertices
      x1 = Math.trunc( x1 )
      y1 = Math.trunc( y1 )
      x2 = Math.trunc( x2 )
      y2 = Math.trunc( y2 )
      x3 = Math.trunc( x3 )
      y3 = Math.trunc( y3 )

      // Texture mapping perspective correction using w
      u1 = u1 / w1
      u2 = u2 / w2
      u3 = u3 / w3
      v1 = v1 / w1
      v2 = v2 / w2
      v3 = v3 / w3
      w1 = 1.0 / w1
      w2 = 1.0 / w2
      w3 = 1.0 / w3

      // For swapping variables
      let tmp = 0;

      // Order the y coordinates in order of y1, y2, y3
      if (y2 < y1) {
        tmp = y1; y1 = y2; y2 = tmp;
        tmp = x1; x1 = x2; x2 = tmp;
        tmp = u1; u1 = u2; u2 = tmp;
        tmp = v1; v1 = v2; v2 = tmp;
        tmp = w1; w1 = w2; w2 = tmp;
      }
      if (y3 < y1) {
        tmp = y1; y1 = y3; y3 = tmp;
        tmp = x1; x1 = x3; x3 = tmp;
        tmp = u1; u1 = u3; u3 = tmp;
        tmp = v1; v1 = v3; v3 = tmp;
        tmp = w1; w1 = w3; w3 = tmp;
      }
      if (y3 < y2) {
        tmp = y2; y2 = y3; y3 = tmp;
        tmp = x2; x2 = x3; x3 = tmp;
        tmp = u2; u2 = u3; u3 = tmp;
        tmp = v2; v2 = v3; v3 = tmp;
        tmp = w2; w2 = w3; w3 = tmp;
      }

      let dy1 = y2 - y1
      let dx1 = x2 - x1
      let dv1 = v2 - v1
      let du1 = u2 - u1
      let dw1 = w2 - w1

      let dy2 = y3 - y1
      let dx2 = x3 - x1
      let dv2 = v3 - v1
      let du2 = u3 - u1
      let dw2 = w3 - w1

      let tex_u, tex_v, tex_w;

      let dax_step = 0, dbx_step = 0;
      let du1_step = 0, dv1_step = 0;
      let du2_step = 0, dv2_step = 0;
      let dw1_step = 0, dw2_step = 0;

      if (dy1) dax_step = dx1 / Math.abs(dy1)
      if (dy2) dbx_step = dx2 / Math.abs(dy2)

      if (dy1) du1_step = du1 / Math.abs(dy1)
      if (dy1) dv1_step = dv1 / Math.abs(dy1)
      if (dy1) dw1_step = dw1 / Math.abs(dy1)

      if (dy2) du2_step = du2 / Math.abs(dy2)
      if (dy2) dv2_step = dv2 / Math.abs(dy2)
      if (dy2) dw2_step = dw2 / Math.abs(dy2)

      if (dy1) {
        for (let i = Math.trunc(y1); i <= y2; i++) {
          let ax = Math.trunc( x1 + (i - y1) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          let tex_su = u1 + (i - y1) * du1_step;
          let tex_sv = v1 + (i - y1) * dv1_step;
          let tex_sw = w1 + (i - y1) * dw1_step;

          let tex_eu = u1 + (i - y1) * du2_step;
          let tex_ev = v1 + (i - y1) * dv2_step;
          let tex_ew = w1 + (i - y1) * dw2_step;

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
            tmp = tex_su; tex_su = tex_eu; tex_eu = tmp;
            tmp = tex_sv; tex_sv = tex_ev; tex_ev = tmp;
            tmp = tex_sw; tex_sw = tex_ew; tex_ew = tmp;
          }

          tex_u = tex_su;
          tex_v = tex_sv;
          tex_w = tex_sw;

          let tstep = 1.0 / (bx - ax);
          let t = 0.0;

          for (let j = ax; j < bx; j++) {
            tex_u = (1.0 - t) * tex_su + t * tex_eu;
            tex_v = (1.0 - t) * tex_sv + t * tex_ev;
            tex_w = (1.0 - t) * tex_sw + t * tex_ew;
            let pixel = Graphics.getPixelF(textureImageData, tex_u / tex_w, tex_v / tex_w)
            Graphics.setPixel(imageData, j, i, pixel.r, pixel.g, pixel.b, pixel.a);
            t += tstep;
          }
        }
      }

      dy1 = y3 - y2;
      dx1 = x3 - x2;
      dv1 = v3 - v2;
      du1 = u3 - u2;
      dw1 = w3 - w2;

      if (dy1) dax_step = dx1 / Math.abs(dy1);
      if (dy2) dbx_step = dx2 / Math.abs(dy2);

      du1_step = 0;
      dv1_step = 0;
      if (dy1) du1_step = du1 / Math.abs(dy1);
      if (dy1) dv1_step = dv1 / Math.abs(dy1);
      if (dy1) dw1_step = dw1 / Math.abs(dy1);

      if (dy1) {
        for (let i = Math.trunc(y2); i <= y3; i++) {
          let ax = Math.trunc( x2 + (i - y2) * dax_step )
          let bx = Math.trunc( x1 + (i - y1) * dbx_step )

          let tex_su = u2 + (i - y2) * du1_step;
          let tex_sv = v2 + (i - y2) * dv1_step;
          let tex_sw = w2 + (i - y2) * dw1_step;

          let tex_eu = u1 + (i - y1) * du2_step;
          let tex_ev = v1 + (i - y1) * dv2_step;
          let tex_ew = w1 + (i - y1) * dw2_step;

          if (ax > bx) {
            tmp = ax; ax = bx; bx = tmp;
            tmp = tex_su; tex_su = tex_eu; tex_eu = tmp;
            tmp = tex_sv; tex_sv = tex_ev; tex_ev = tmp;
            tmp = tex_sw; tex_sw = tex_ew; tex_ew = tmp;
          }

          tex_u = tex_su;
          tex_v = tex_sv;
          tex_w = tex_sw;

          let tstep = 1.0 / (bx - ax);
          let t = 0.0;

          for (let j = ax; j < bx; j++) {
            tex_u = (1.0 - t) * tex_su + t * tex_eu;
            tex_v = (1.0 - t) * tex_sv + t * tex_ev;
            tex_w = (1.0 - t) * tex_sw + t * tex_ew;
            let pixel = Graphics.getPixelF(textureImageData, tex_u / tex_w, tex_v / tex_w)
            Graphics.setPixel(imageData, j, i, pixel.r, pixel.g, pixel.b, pixel.a);
            t += tstep;
          }
        }
      }
    }

}