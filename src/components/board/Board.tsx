import { useEffect, useMemo, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import ListColumn from "./ListColumn";
import { normalize } from "./normalize";
import type { BoardProps, UIState } from "./types";

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
      newOrder.splice(destination.index, 0, draggableId);

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
    <div className="w-full block px-4 mt-2 overflow-x-visible">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row flex-nowrap gap-4 items-start w-full max-w-full overflow-x-auto pb-2 overscroll-contain [scrollbar-gutter:stable_both-edges]">
          {listsToRender.map((list) => {
            const cardIds = state.cardOrderByList[list.id] || [];
            const cards = cardIds.map((id) => state.cardsById[id]).filter(Boolean);
            return <ListColumn key={list.id} list={list} cards={cards} />;
          })}

          <div className="min-w-[250px] flex items-center justify-center flex-none">
            <button
              className="bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-gray-300 rounded-lg p-3 w-full min-h-[200px] flex items-center justify-center text-gray-500 cursor-pointer"
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