import { assert } from '@canvas-ui/assert'
import { NonConstructiable } from '../foundation'
import { Point, Rect } from '../math'
import { PlatformAdapter } from '../platform'

export type Directive = [string, ...number[]]

export class Path extends NonConstructiable {

  /**
   * 解析 SVG 路径
   */
  static parse(str: string): Directive[] {
    const result: Directive[] = []
    const coords: string[] = []
    let currentPath: string
    let parsed: number
    let match: RegExpExecArray | null = null
    let coordsStr: string

    if (!str || !str.match) {
      return result
    }

    const path = str.match(InvalidDirectiveReg)
    if (!path) {
      return result
    }

    for (let i = 0, n = path.length; i < n; i++) {
      currentPath = path[i]

      coordsStr = currentPath.slice(1).trim()
      coords.length = 0

      let command = currentPath.charAt(0)
      const coordsParsed: Directive = [command]

      if (command.toLowerCase() === 'a') {
        for (let args; (args = ArcArgsReg.exec(coordsStr));) {
          for (let j = 1; j < args.length; j++) {
            coords.push(args[j])
          }
        }
      }
      else {
        while ((match = FirstArgReg.exec(coordsStr))) {
          coords.push(match[0])
        }
      }

      for (let j = 0, jlen = coords.length; j < jlen; j++) {
        parsed = parseFloat(coords[j])
        if (!isNaN(parsed)) {
          coordsParsed.push(parsed)
        }
      }

      const commandLength = ArgLengths[command.toLowerCase()]
      const repeatedCommand = RepeatedCommands[command] || command

      if (coordsParsed.length - 1 > commandLength) {
        for (let k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
          result.push(([command] as Directive).concat(coordsParsed.slice(k, k + commandLength) as number[]) as Directive)
          command = repeatedCommand
        }
      } else {
        result.push(coordsParsed)
      }

    }

    return result
  }

  /**
   * 转换所有相对指令到绝对指令
   */
  static simplify(path: Directive[]) {
    let x = 0
    let y = 0
    const n = path.length
    let x1 = 0
    let y1 = 0
    let current: Directive | undefined
    let converted = false
    let result: Directive[] = []
    let previous: string | undefined
    let controlX = 0
    let controlY = 0
    for (let i = 0; i < n; ++i) {
      converted = false
      current = path[i].slice(0) as Directive
      switch (current[0]) {
        case 'l':
          current[0] = 'L'
          current[1] += x
          current[2] += y
        // falls through
        case 'L':
          x = current[1]
          y = current[2]
          break
        case 'h':
          current[1] += x
        // falls through
        case 'H':
          current[0] = 'L'
          current[2] = y
          x = current[1]
          break
        case 'v':
          current[1] += y
        // falls through
        case 'V':
          current[0] = 'L'
          y = current[1]
          current[1] = x
          current[2] = y
          break
        case 'm':
          current[0] = 'M'
          current[1] += x
          current[2] += y
        // falls through
        case 'M':
          x = current[1]
          y = current[2]
          x1 = current[1]
          y1 = current[2]
          break
        case 'c':
          current[0] = 'C'
          current[1] += x
          current[2] += y
          current[3] += x
          current[4] += y
          current[5] += x
          current[6] += y
        // falls through
        case 'C':
          controlX = current[3]
          controlY = current[4]
          x = current[5]
          y = current[6]
          break
        case 's':
          current[0] = 'S'
          current[1] += x
          current[2] += y
          current[3] += x
          current[4] += y
        // falls through
        case 'S':
          if (previous === 'C') {
            controlX = 2 * x - controlX
            controlY = 2 * y - controlY
          }
          else {
            controlX = x
            controlY = y
          }
          x = current[3]
          y = current[4]
          current[0] = 'C'
          current[5] = current[3]
          current[6] = current[4]
          current[3] = current[1]
          current[4] = current[2]
          current[1] = controlX
          current[2] = controlY
          controlX = current[3]
          controlY = current[4]
          break
        case 'q':
          current[0] = 'Q'
          current[1] += x
          current[2] += y
          current[3] += x
          current[4] += y
        // falls through
        case 'Q':
          controlX = current[1]
          controlY = current[2]
          x = current[3]
          y = current[4]
          break
        case 't':
          current[0] = 'T'
          current[1] += x
          current[2] += y
        // falls through
        case 'T':
          if (previous === 'Q') {
            controlX = 2 * x - controlX
            controlY = 2 * y - controlY
          }
          else {
            controlX = x
            controlY = y
          }
          current[0] = 'Q'
          x = current[1]
          y = current[2]
          current[1] = controlX
          current[2] = controlY
          current[3] = x
          current[4] = y
          break
        case 'a':
          current[0] = 'A'
          current[6] += x
          current[7] += y
        // falls through
        case 'A':
          converted = true
          result = result.concat(fromArcToBeziers(x, y, current))
          x = current[6]
          y = current[7]
          break
        case 'z':
        case 'Z':
          x = x1
          y = y1
          break
        default:
      }
      if (!converted) {
        result.push(current)
      }
      previous = current[0]
    }
    return result
  }

  static calculateBounds(path: Directive[]) {
    const aX = []
    const aY = []
    let current: Directive
    let subpathStartX = 0
    let subpathStartY = 0
    let x = 0
    let y = 0
    let bounds: { x: number, y: number }[]
    for (let i = 0, n = path.length; i < n; ++i) {
      current = path[i]
      switch (current[0]) {

        case 'L':
          x = current[1]
          y = current[2]
          bounds = []
          break

        case 'M':
          x = current[1]
          y = current[2]
          subpathStartX = x
          subpathStartY = y
          bounds = []
          break

        case 'C':
          bounds = getBoundsOfCurve(x, y,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          )
          x = current[5]
          y = current[6]
          break

        case 'Q':
          bounds = getBoundsOfCurve(x, y,
            current[1],
            current[2],
            current[1],
            current[2],
            current[3],
            current[4]
          )
          x = current[3]
          y = current[4]
          break

        case 'z':
        case 'Z':
          x = subpathStartX
          y = subpathStartY
          break
      }
      bounds!.forEach(function (point) {
        aX.push(point.x)
        aY.push(point.y)
      })
      aX.push(x)
      aY.push(y)
    }

    const minX = Math.min(...aX),
      minY = Math.min(...aY),
      maxX = Math.max(...aX),
      maxY = Math.max(...aY)

    return Rect.fromLTRB(
      minX,
      minY,
      maxX,
      maxY,
    )
  }

  private static _testContext: CanvasDrawPath & CanvasPathDrawingStyles

  private static get testContext() {
    if (Path._testContext) {
      return Path._testContext
    }

    const size = 1
    const canvas = PlatformAdapter.supportOffscreenCanvas
      ? PlatformAdapter.createOffscreenCanvas(size, size)
      : PlatformAdapter.createCanvas(size, size)

    const context = canvas.getContext('2d')
    assert(context)
    context.lineCap = 'round'
    return Path._testContext = context
  }

  static isPointInStroke(path: Path2D, point: Point, strokeWidth = 1) {
    const { testContext } = Path
    testContext.lineWidth = strokeWidth
    return testContext.isPointInStroke(path, point.x, point.y)
  }
}

const NumberPattern = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?\\s*'
const CommaWspPattern = '(?:\\s+,?\\s*|,\\s*)'
const FirstArgReg = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:[eE][-+]?\d+)?)/ig
const NumberCommaWspPattern = '(' + NumberPattern + ')' + CommaWspPattern
const FlagCommaWspPattern = '([01])' + CommaWspPattern + '?'
const ArcArgsReg = new RegExp(
  NumberCommaWspPattern +
  '?' + NumberCommaWspPattern +
  '?' + NumberCommaWspPattern +
  FlagCommaWspPattern +
  FlagCommaWspPattern +
  NumberCommaWspPattern +
  '?(' + NumberPattern + ')',
  'g')

const InvalidDirectiveReg = /[mzlhvcsqta][^mzlhvcsqta]*/gi

const ArgLengths: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
} as const

const RepeatedCommands: Record<string, string> = {
  m: 'l',
  M: 'L',
} as const

function fromArcToBeziers(fx: number, fy: number, coords: any[]) {
  const rx = coords[1],
    ry = coords[2],
    rot = coords[3],
    large = coords[4],
    sweep = coords[5],
    tx = coords[6],
    ty = coords[7],
    segs = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot)

  for (let i = 0, len = segs.length; i < len; i++) {
    segs[i][1] += fx
    segs[i][2] += fy
    segs[i][3] += fx
    segs[i][4] += fy
    segs[i][5] += fx
    segs[i][6] += fy
  }
  return segs
}

/**
 * http://dxr.mozilla.org/mozilla-central/source/content/svg/content/src/nsSVGPathDataParser.cpp
 */
function arcToSegments(
  toX: number,
  toY: number,
  rx: number,
  ry: number,
  large: number,
  sweep: number,
  rotateX: number,) {
  const PI = Math.PI
  const th = rotateX * PI / 180
  const sinTh = Math.sin(th)
  const cosTh = Math.cos(th)
  let fromX = 0
  let fromY = 0

  rx = Math.abs(rx)
  ry = Math.abs(ry)

  const px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
    py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
    rx2 = rx * rx, ry2 = ry * ry, py2 = py * py, px2 = px * px,
    pl = rx2 * ry2 - rx2 * py2 - ry2 * px2
  let root = 0

  if (pl < 0) {
    const s = Math.sqrt(1 - pl / (rx2 * ry2))
    rx *= s
    ry *= s
  } else {
    root = (large === sweep ? -1.0 : 1.0) *
      Math.sqrt(pl / (rx2 * py2 + ry2 * px2))
  }

  const cx = root * rx * py / ry,
    cy = -root * ry * px / rx,
    cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
    cy1 = sinTh * cx + cosTh * cy + toY * 0.5

  let mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry)
  let dtheta = calcVectorAngle((px - cx) / rx, (py - cy) / ry, (-px - cx) / rx, (-py - cy) / ry)

  if (sweep === 0 && dtheta > 0) {
    dtheta -= 2 * PI
  }
  else if (sweep === 1 && dtheta < 0) {
    dtheta += 2 * PI
  }

  // Convert into cubic bezier segments <= 90deg
  const segments = Math.ceil(Math.abs(dtheta / PI * 2))
  const result = []
  const mDelta = dtheta / segments
  const mT = 8 / 3 * Math.sin(mDelta / 4) * Math.sin(mDelta / 4) / Math.sin(mDelta / 2)
  let th3 = mTheta + mDelta

  for (let i = 0; i < segments; i++) {
    result[i] = segmentToBezier(mTheta, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY)
    fromX = result[i][5]
    fromY = result[i][6]
    mTheta = th3
    th3 += mDelta
  }

  return result
}

function calcVectorAngle(ux: number, uy: number, vx: number, vy: number) {
  const ta = Math.atan2(uy, ux)
  const tb = Math.atan2(vy, vx)
  if (tb >= ta) {
    return tb - ta
  }
  else {
    return 2 * Math.PI - (ta - tb)
  }
}

function segmentToBezier(
  th2: number,
  th3: number,
  cosTh: number,
  sinTh: number,
  rx: number,
  ry: number,
  cx1: number,
  cy1: number,
  mT: number,
  fromX: number,
  fromY: number
) {
  const costh2 = Math.cos(th2),
    sinth2 = Math.sin(th2),
    costh3 = Math.cos(th3),
    sinth3 = Math.sin(th3),
    toX = cosTh * rx * costh3 - sinTh * ry * sinth3 + cx1,
    toY = sinTh * rx * costh3 + cosTh * ry * sinth3 + cy1,
    cp1X = fromX + mT * (-cosTh * rx * sinth2 - sinTh * ry * costh2),
    cp1Y = fromY + mT * (-sinTh * rx * sinth2 + cosTh * ry * costh2),
    cp2X = toX + mT * (cosTh * rx * sinth3 + sinTh * ry * costh3),
    cp2Y = toY + mT * (sinTh * rx * sinth3 - cosTh * ry * costh3)

  return [
    'C',
    cp1X, cp1Y,
    cp2X, cp2Y,
    toX, toY
  ] as Directive
}

// http://jsbin.com/ivomiq/56/edit
function getBoundsOfCurve(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {

  const sqrt = Math.sqrt,
    min = Math.min, max = Math.max,
    abs = Math.abs, tvalues = [],
    bounds: any[] = [[], []]

  let a, b, c, t, t1, t2, b2ac, sqrtb2ac

  b = 6 * x0 - 12 * x1 + 6 * x2
  a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3
  c = 3 * x1 - 3 * x0

  for (let i = 0; i < 2; ++i) {
    if (i > 0) {
      b = 6 * y0 - 12 * y1 + 6 * y2
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3
      c = 3 * y1 - 3 * y0
    }

    if (abs(a) < 1e-12) {
      if (abs(b) < 1e-12) {
        continue
      }
      t = -c / b
      if (0 < t && t < 1) {
        tvalues.push(t)
      }
      continue
    }
    b2ac = b * b - 4 * c * a
    if (b2ac < 0) {
      continue
    }
    sqrtb2ac = sqrt(b2ac)
    t1 = (-b + sqrtb2ac) / (2 * a)
    if (0 < t1 && t1 < 1) {
      tvalues.push(t1)
    }
    t2 = (-b - sqrtb2ac) / (2 * a)
    if (0 < t2 && t2 < 1) {
      tvalues.push(t2)
    }
  }

  let x, y, j = tvalues.length
  const jlen = j
  let mt: number
  while (j--) {
    t = tvalues[j]
    mt = 1 - t
    x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3)
    bounds[0][j] = x

    y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3)
    bounds[1][j] = y
  }

  bounds[0][jlen] = x0
  bounds[1][jlen] = y0
  bounds[0][jlen + 1] = x3
  bounds[1][jlen + 1] = y3
  const result = [
    {
      // eslint-disable-next-line prefer-spread
      x: min.apply(null, bounds[0]),
      // eslint-disable-next-line prefer-spread
      y: min.apply(null, bounds[1])
    },
    {
      // eslint-disable-next-line prefer-spread
      x: max.apply(null, bounds[0]),
      // eslint-disable-next-line prefer-spread
      y: max.apply(null, bounds[1])
    }
  ]
  return result
}
