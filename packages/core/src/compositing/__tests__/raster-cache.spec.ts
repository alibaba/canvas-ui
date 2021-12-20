import { Matrix } from '../../math'
import { PictureRecoder } from '../../canvas'
import { RasterCache } from '..'

describe('RasterCache', () => {
  it('getCacheKey', () => {
    const recorder = new PictureRecoder()
    recorder.begin()
    const picture = recorder.end()
    const matrix = Matrix.fromTranslate(1, 1)
    const matrixToString = Matrix.setTranslate(matrix, 0, 0).values.toString()
    expect(RasterCache.getCacheKey(picture, matrix)).toEqual(picture.id + matrixToString)
  })
})
