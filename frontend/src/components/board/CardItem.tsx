import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useRef, useState } from "react";
import type { Card } from "./types";
import { RiMoreFill } from "@remixicon/react";
import api from "@/services/apiService";
import type { ApiResponse } from "@/components/layout/types";
type CardItemProps = {
  card: Card;
  index: number;
  onUpdateCard?: (card: Card) => void;
  onDeleteCard?: (cardId: string) => void;
};

export default function CardItem({ card, index, onUpdateCard, onDeleteCard }: CardItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
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
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`bg-white border border-gray-200 rounded-md p-2 mb-2 shadow-sm relative ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold mb-1">{card.title}</div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Actions carte"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <RiMoreFill className="w-4 h-4" />
              </button>
              <div
                className={[
                  "absolute right-0 mt-1 w-44 z-[15]",
                  "bg-white border border-gray-200 rounded-lg shadow-sm",
                  menuOpen ? "block" : "hidden",
                ].join(" ")}
                role="menu"
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const title = prompt("Nouveau titre", card.title)?.trim();
                    if (!title) { setMenuOpen(false); return; }
                    const description = prompt("Nouvelle description", card.description ?? "") ?? "";

                    const pr = prompt("Priorité (1=Basse, 2=Moyenne, 3=Haute)", String(card.priority));
                    if (!pr) { setMenuOpen(false); return; }
                    const priorityNum = Number(pr);
                    if (![1,2,3].includes(priorityNum)) { alert("Priorité invalide"); return; }

                    const currentDateStr = new Date(card.dueDate).toISOString().slice(0,10);
                    const dueDateInput = prompt("Échéance (AAAA-MM-JJ)", currentDateStr) || currentDateStr;
                    
                    try {
                      const res = await api.put<ApiResponse<Card>|Card>(`/cards/${card.id}`, {
                        title,
                        description,
                        priority: priorityNum,
                        dueDate: dueDateInput,
                        listId: card.listId,
                        isCompleted: card.isCompleted ?? false,
                      });
                      const updated: Card = (res as any)?.data ?? (res as any);
                      if (typeof (updated as any).isCompleted !== "boolean") (updated as any).isCompleted = false;
                      onUpdateCard?.(updated);
                    } catch (error) {
                      console.error("Erreur lors de la modification de la carte", error);
                      alert("Impossible de modifier la carte.");
                    } finally {
                      setMenuOpen(false);
                    }
                  }}
                  role="menuitem"
                >
                  Modifier la carte
                </button>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const ok = confirm("Supprimer cette carte ?");
                    if (!ok) { setMenuOpen(false); return; }
                    try {
                      await api.delete(`/cards/${card.id}`);
                      onDeleteCard?.(card.id);
                    } catch (error) {
                      console.error("Erreur lors de la suppression de la carte", error);
                      alert("Impossible de supprimer la carte.");
                    } finally {
                      setMenuOpen(false);
                    }
                  }}
                  role="menuitem"
                >
                  Supprimer la carte
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 text-xs text-gray-500 mb-1">
            <span>Priorité: {card.priority}</span>
            <span>Échéance: {new Date(card.dueDate).toLocaleDateString()}</span>
            {card.isCompleted && (
              <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-[11px]">
                Terminé
              </span>
            )}
          </div>
          <p className="m-0 text-sm text-gray-700">{card.description}</p>
        </div>
      )}
    </Draggable>
  );
}
