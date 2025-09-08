import { Droppable } from "@hello-pangea/dnd";
import { useEffect, useMemo, useRef, useState } from "react";
import CardItem from "./CardItem";
import type { List, Card } from "./types";
import { RiInformationLine, RiMoreFill } from "@remixicon/react";
import api from "@/services/apiService";
import type { ApiResponse } from "@/components/layout/types";

type ListColumnProps = {
  list: List;
  cards: Card[];
  onDeleteList?: (listId: string) => void;
  onRenameList?: (updated: List) => void;
  onAddCard?: (card: Card) => void;
};

export default function ListColumn({ list, cards, onDeleteList, onRenameList, onAddCard }: ListColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [sortMode, setSortMode] = useState<"none" | "dueDate" | "priority">("none");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuOpen && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const cardsToRender = useMemo(() => {
    if (sortMode === "none") return cards;
    const withIndex = cards.map((c, i) => ({ c, i }));
    if (sortMode === "dueDate") {
      withIndex.sort((a, b) => {
        const da = new Date(a.c.dueDate).getTime();
        const db = new Date(b.c.dueDate).getTime();
        if (da === db) return a.i - b.i; // stable tie-breaker
        return da - db; // earliest first
      });
    } else if (sortMode === "priority") {
      withIndex.sort((a, b) => {
        // Highest priority first (3 > 2 > 1)
        if (a.c.priority === b.c.priority) return a.i - b.i;
        return b.c.priority - a.c.priority;
      });
    }
    return withIndex.map((x) => x.c);
  }, [cards, sortMode]);

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-[200px] min-w-[250px] flex-none relative">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="m-0 text-base font-semibold">
          {list.name}
          <span className="ml-1 align-middle relative group">
            <RiInformationLine className="inline-block w-3 h-3 text-gray-500 cursor-pointer mb-1" />
            <span className="absolute left-5 top-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              List ID: {list.id}
            </span>
          </span>
        </h2>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="inline-flex items-center justify-center h-6 px-2 rounded hover:bg-gray-200 text-sm"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="Une bouton action"
          >
            <RiMoreFill className="w-4 h-4 mr-1" />
          </button>
          <div
            className={[
              "absolute right-0 mt-1 w-44 z-[5]",
              "bg-white border border-gray-200 rounded-lg shadow-sm",
              menuOpen ? "block" : "hidden",
            ].join(" ")}
            role="menu"
          >
            <div className="px-3 py-2 text-xs text-gray-500 border-b">Trier</div>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={() => {
                setSortMode("dueDate");
                setMenuOpen(false);
              }}
              role="menuitem"
            >
              Par échéance {sortMode === "dueDate" ? "✓" : ""}
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={() => {
                setSortMode("priority");
                setMenuOpen(false);
              }}
              role="menuitem"
            >
              Par priorité {sortMode === "priority" ? "✓" : ""}
            </button>
            {sortMode !== "none" && (
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                onClick={() => {
                  setSortMode("none");
                  setMenuOpen(false);
                }}
                role="menuitem"
              >
                Réinitialiser le tri
              </button>
            )}
            <div className="h-px bg-gray-200 my-1" />
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={async () => {
                const title = prompt(`Nom de la nouvelle carte dans \"${list.name}\" ?`);
                if (!title) return;

                const description = prompt("Description de la nouvelle carte ?") ?? "";

                const pr = prompt("Priorité (1=Basse, 2=Moyenne, 3=Haute)", "2");
                if (!pr) return;
                const priorityNum = Number(pr);
                if (![1, 2, 3].includes(priorityNum)) {
                  alert("Priorité invalide. Choisissez 1, 2 ou 3.");
                  return;
                }

                const dueDateInput = prompt("Échéance (AAAA-MM-JJ)", "");
                if (!dueDateInput) return;
                const m = dueDateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (!m) {
                  alert("Date invalide. Utilisez le format AAAA-MM-JJ.");
                  return;
                }
                const [_, y, mo, d] = m;
                const yN = Number(y);
                const moN = Number(mo);
                const dN = Number(d);
                const dObj = new Date(Date.UTC(yN, moN - 1, dN, 23, 59, 59, 0));

                if (
                  dObj.getUTCFullYear() !== yN ||
                  dObj.getUTCMonth() !== moN - 1 ||
                  dObj.getUTCDate() !== dN
                ) {
                  alert("Date invalide. Utilisez une date réelle au format AAAA-MM-JJ.");
                  return;
                }

                const dueDateForApi = `${y}-${mo}-${d}`;

                try {
                  const res = await api.post<ApiResponse<Card>|Card>("/cards", {
                    title,
                    description,
                    listId: list.id,
                    dueDate: dueDateForApi,
                    priority: priorityNum,
                    isCompleted: false,
                  });
                  const newCard: Card = (res as any)?.data ?? (res as any);
                  if (typeof (newCard as any).isCompleted !== "boolean") {
                    (newCard as any).isCompleted = false;
                  }
                  onAddCard?.(newCard);
                } catch (error: any) {
                  const serverMsg = error?.response?.data?.message || error?.message || "";
                  console.error("Erreur lors de la création de la carte", error?.response?.data || error);
                  alert("Impossible de créer la carte. Réessayez.");
                } finally {
                  setMenuOpen(false);
                }
              }}
              role="menuitem"
            >
              Ajouter une carte
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={async () => {
                const newName = prompt(`Renommer la liste \"${list.name}\"`, list.name)?.trim();
                if (!newName || newName === list.name) return;
                try {
                  const res = await api.put<ApiResponse<List>>(`/lists/${list.id}`, {
                    name: newName,
                    boardId: list.boardId,
                  });
                  onRenameList?.(res.data);
                } catch (error) {
                  console.error("Erreur lors du renommage de la liste :", error);
                  alert("Impossible de renommer la liste. Réessayez.");
                } finally {
                  setMenuOpen(false);
                }
              }}
              role="menuitem"
            >
              Renommer la liste
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
              onClick={async () => {
                const confirmDelete = confirm(`Confirmer la suppression de la liste \"${list.name}\" ?`);
                if (!confirmDelete) return;
                try {
                  await api.delete(`/lists/${list.id}`);
                  onDeleteList?.(list.id);
                } catch (error) {
                  console.error("Erreur lors de la suppression de la liste", error);
                  alert("Impossible de supprimer la liste. Réessayez.");
                  return;
                }
                setMenuOpen(false);
              }}
              role="menuitem"
            >
              Supprimer la liste
            </button>
          </div>
        </div>
      </div>
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[40px] p-1.5 rounded-md transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-blue-100" : ""
            }`}
          >
            {cardsToRender.map((card, index) => (
              <CardItem key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
