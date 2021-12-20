const LIST_COUNT = 10
const CARD_COUNT = 5000

export interface CardListSchema {
  cards: CardSchema[]
  id: string
}
export interface CardSchema {
  text: string
  id: string
}

const data: CardListSchema[] = []
for (let i = 0; i < LIST_COUNT; i++) {
  data[i] = {
    cards: [],
    id: ''
  }
  data[i].id = i.toString()
  for (let j = 0; j < CARD_COUNT; j++) {
    data[i].cards.push({
      text: `任务 ${i + '-' + j}`.repeat(Math.ceil(Math.random() * 20)),
      id: i + '-' + j
    })
  }
}

export {
  data
}
