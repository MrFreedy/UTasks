export type Board = {
  id: string;
  name: string;
  description?: string;
  userId: string;
};

export type List = {
  id: string;
  name: string;
  boardId: string;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  listId: string;
  dueDate: string;
  priority: 1 | 2 | 3;
  isCompleted: boolean;
};

export type UIState = {
  boardId: string;
  listOrder: string[];
  listsById: Record<string, List>;
  cardsById: Record<string, Card>;
  cardOrderByList: Record<string, string[]>;
};

export type BoardProps = {
  board: Board;
  lists: List[];
  cards: Card[];
  title?: string;

  onMoveCard?: (card: Card, newListId: string, newIndex: number, state: UIState) => void | Promise<void>;
  onReorderList?: (newListOrder: string[], state: UIState) => void | Promise<void>;
  disableLocalPersistence?: boolean;
};