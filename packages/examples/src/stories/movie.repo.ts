
export const MovieFields = [
  '电影ID',
  '电影名',
  '上映年度',
  '电影英文名',
  '类型',
  '片长',
  '上映时间',
  '制式',
  '国家及地区',
  '累计票房',
  '发行公司',
  '导演',
  '主演',
  '制片公司列表',
  '发行公司列表',
] as const

export type Movie = Record<typeof MovieFields[number], string>

export class MovieRepo {

  private pageCache?: Movie[]
  private async fetchPage() {
    if (!this.pageCache) {
      const { default: page } = await import('./movie.json')
      this.pageCache = page.map(it => {
        return MovieFields.reduce((acc, field) => {
          acc[field] = String(it[field])
          return acc
        }, {} as Movie)
      })
    }
    return this.pageCache
  }

  async fetch(count: number) {
    const result: Movie[] = []
    while (result.length < count) {
      result.push(...await this.fetchPage())
    }
    result.length = count
    return result
  }
}
