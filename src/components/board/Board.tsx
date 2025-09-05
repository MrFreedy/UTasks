import { useEffect, useMemo, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import ListColumn from "./ListColumn";
import { normalize } from "./normalize";
import type { BoardProps, UIState } from "./types";
import "@/styles/Board.css"
export default function Board({
  board,
  lists,
  cards,
  title,
  onMoveCard,
  onReorderList,
  disableLocalPersistence
}: BoardProps) {
  const [state, setState] = useState<UIState>(() => normalize(board, lists, cards));

  useEffect(() => {
    if (disableLocalPersistence) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`board:${state.boardId}`, JSON.stringify(state));
  }, [state, disableLocalPersistence]);

  const listsToRender = useMemo(
    () => state.listOrder.map((id) => state.listsById[id]),
    [state]
  );

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      if (destination.index === source.index) return;
      const newOrder = Array.from(state.listOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId); // ici draggableId serait listId

      const next: UIState = { ...state, listOrder: newOrder };
      setState(next);
      onReorderList?.(newOrder, next);
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    if (sourceListId === destListId && destination.index === source.index) return;

    const sourceOrder = Array.from(state.cardOrderByList[sourceListId] || []);
    sourceOrder.splice(source.index, 1);

    const destOrder = Array.from(state.cardOrderByList[destListId] || []);
    destOrder.splice(destination.index, 0, draggableId);

    const movedCard = { ...state.cardsById[draggableId] };
    if (movedCard.listId !== destListId) {
      movedCard.listId = destListId;
    }

    const next: UIState = {
      ...state,
      cardsById: { ...state.cardsById, [movedCard.id]: movedCard },
      cardOrderByList: {
        ...state.cardOrderByList,
        [sourceListId]: sourceOrder,
        [destListId]: destOrder,
      },
    };

    setState(next);
    onMoveCard?.(movedCard, destListId, destination.index, next);
  }

  return (
    <div className="app">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="boardRow">
          {listsToRender.map((list) => {
            const cardIds = state.cardOrderByList[list.id] || [];
            const cards = cardIds.map((id) => state.cardsById[id]).filter(Boolean);
            return <ListColumn key={list.id} list={list} cards={cards} />;
          })}

          <div className="addListCol">
            <button
              className="addListBtn"
              onClick={() => {
                const name = prompt("Nom de la nouvelle liste ?");
                if (!name) return;

                const newListId = `list-${Date.now()}`;
                const newList = { id: newListId, name, boardId: state.boardId };

                setState((prev) => ({
                  ...prev,
                  listsById: { ...prev.listsById, [newListId]: newList },
                  listOrder: [...prev.listOrder, newListId],
                  cardOrderByList: { ...prev.cardOrderByList, [newListId]: [] },
                }));
              }}
            >
              + Ajouter une liste
            </button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}