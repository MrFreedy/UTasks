import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import ListColumn from "./ListColumn";
import { normalize } from "./normalize";
import type { BoardProps, UIState, List, Card } from "./types";
import type { ApiResponse } from "@/components/layout/types";
import api from "@/services/apiService";

export default function Board({
  board,
  lists,
  cards,
  onMoveCard,
  onReorderList,
  disableLocalPersistence
}: BoardProps) {
  const [state, setState] = useState<UIState>(() => normalize(board, lists, cards));
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    setState(normalize(board, lists, cards));
  }, [board.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiResponse<List[]>>(`/lists/board/${board.id}`);
        const listsFromApi = res?.data ?? [];
        const cardResponses = await Promise.all(
          listsFromApi.map((l) =>
            api
              .get<ApiResponse<Card[]>>(`/cards/list/${l.id}`)
              .catch(() => undefined)
          )
        );
        const cardsFromApi: Card[] = cardResponses.flatMap((r) => r?.data ?? []);
        if (!cancelled) setState(normalize(board, listsFromApi, cardsFromApi));
      } catch (err) {
        console.error("Erreur lors du chargement des listes du board:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [board.id]);

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

    if (sourceListId === destListId) {
      const newOrder = Array.from(state.cardOrderByList[sourceListId] || []);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId);

      const next: UIState = {
        ...state,
        cardOrderByList: {
          ...state.cardOrderByList,
          [sourceListId]: newOrder,
        },
      };
      setState(next);
      const movedCard = state.cardsById[draggableId];
      onMoveCard?.(movedCard, destListId, destination.index, next);
      return;
    }

    const sourceOrder = Array.from(state.cardOrderByList[sourceListId] || []);
    sourceOrder.splice(source.index, 1);
    const destOrder = Array.from(state.cardOrderByList[destListId] || []);
    destOrder.splice(destination.index, 0, draggableId);

    const movedCard = { ...state.cardsById[draggableId], listId: destListId };
    if (movedCard.dueDate) {
      movedCard.dueDate = movedCard.dueDate.split("T")[0];
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
    console.log(movedCard.dueDate);
    (async () => {
      try {
        await api.put<ApiResponse<Card> | Card>(`/cards/${draggableId}`, {
          title: movedCard.title,
          description: movedCard.description,
          priority: movedCard.priority,
          dueDate: movedCard.dueDate,
          listId: movedCard.listId,
          isCompleted: movedCard.isCompleted ?? false,
        });
        console.log(movedCard.dueDate);
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la carte après déplacement:", err);
      }
    })();
  }

  return (
    <div className="w-full block px-4 mt-2 overflow-x-visible">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board-columns" type="COLUMN" direction={isNarrow ? "vertical" : "horizontal"}>
          {(colProvided) => (
            <div
              ref={colProvided.innerRef}
              {...colProvided.droppableProps}
              className={[
                isNarrow
                  ? "flex flex-col gap-4 items-stretch w-full max-w-full overflow-y-auto pb-2"
                  : "flex flex-row flex-nowrap gap-4 items-start w-full max-w-full overflow-x-auto pb-2 overscroll-contain [scrollbar-gutter:stable_both-edges]",
              ].join(" ")}
            >
              {listsToRender.map((list, index) => {
                const cardIds = state.cardOrderByList[list.id] || [];
                const cards = cardIds.map((id) => state.cardsById[id]).filter(Boolean);
                return (
                  <Draggable draggableId={list.id} index={index} key={list.id}>
                    {(provided) => (
                      <ListColumn
                        list={list}
                        cards={cards}
                        innerRef={provided.innerRef as any}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                        onDeleteList={(listId) => {
                          setState((prev) => {
                            const { [listId]: _removedList, ...restListsById } = prev.listsById;
                            const newListOrder = prev.listOrder.filter((id) => id !== listId);
                            const newCardsById: UIState["cardsById"] = {};
                            for (const [cid, c] of Object.entries(prev.cardsById)) {
                              if (c.listId !== listId) newCardsById[cid] = c;
                            }
                            const { [listId]: _removedOrder, ...restCardOrderByList } = prev.cardOrderByList;
                            return {
                              ...prev,
                              listsById: restListsById,
                              listOrder: newListOrder,
                              cardsById: newCardsById,
                              cardOrderByList: restCardOrderByList,
                            };
                          });
                        }}
                        onRenameList={(updated) => {
                          setState((prev) => ({
                            ...prev,
                            listsById: { ...prev.listsById, [updated.id]: updated },
                          }));
                        }}
                        onAddCard={(card) => {
                          setState((prev) => ({
                            ...prev,
                            cardsById: { ...prev.cardsById, [card.id]: card },
                            cardOrderByList: {
                              ...prev.cardOrderByList,
                              [list.id]: [...(prev.cardOrderByList[list.id] || []), card.id],
                            },
                          }));
                        }}
                        onUpdateCard={(updated) => {
                          setState((prev) => ({
                            ...prev,
                            cardsById: { ...prev.cardsById, [updated.id]: updated },
                          }));
                        }}
                        onDeleteCard={(cardId) => {
                          setState((prev) => {
                            const card = prev.cardsById[cardId];
                            if (!card) return prev;
                            const { [cardId]: _removed, ...restCardsById } = prev.cardsById;
                            const order = prev.cardOrderByList[card.listId] || [];
                            const newOrder = order.filter((id) => id !== cardId);
                            return {
                              ...prev,
                              cardsById: restCardsById,
                              cardOrderByList: { ...prev.cardOrderByList, [card.listId]: newOrder },
                            };
                          });
                        }}
                      />
                    )}
                  </Draggable>
                );
              })}

              <div className="w-full sm:max-w-[250px] sm:min-w-[250px] flex items-center justify-center flex-none">
                <button
                  className="bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-gray-300 rounded-lg p-3 w-full min-h-[200px] flex items-center justify-center text-gray-500 cursor-pointer"
                  onClick={async () => {
                    const name = prompt("Nom de la nouvelle liste ?");
                    if (!name) return;
                    try {
                      const res = await api.post<ApiResponse<List>>("/lists", { name, boardId: state.boardId });
                      const newList = res.data;
                      setState((prev) => ({
                        ...prev,
                        listsById: { ...prev.listsById, [newList.id]: newList },
                        listOrder: [...prev.listOrder, newList.id],
                        cardOrderByList: { ...prev.cardOrderByList, [newList.id]: [] },
                      }));
                    } catch (error) {
                      console.error("Erreur lors de la création de la liste :", error);
                      alert("Impossible de créer la liste. Réessayez.");
                    }
                  }}
                >
                  + Ajouter une liste
                </button>
              </div>

              {colProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
