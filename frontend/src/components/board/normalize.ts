import type { Board, List, Card, UIState } from "./types";

export function normalize(board: Board, lists: List[], cards: Card[]): UIState {
  const listsById: UIState["listsById"] = {};
  const listOrder: string[] = [];
  const cardsById: UIState["cardsById"] = {};
  const cardOrderByList: UIState["cardOrderByList"] = {};

  for (const l of lists) {
    listsById[l.id] = l;
    listOrder.push(l.id);
    cardOrderByList[l.id] = [];
  }

  for (const c of cards) {
    cardsById[c.id] = c;
    if (!cardOrderByList[c.listId]) cardOrderByList[c.listId] = [];
    cardOrderByList[c.listId].push(c.id);
  }

  return {
    boardId: board.id,
    listOrder,
    listsById,
    cardsById,
    cardOrderByList,
  };
}