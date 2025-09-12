import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useRef, useState, useMemo } from "react";
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

const isDateOnly = (v?: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v as string);

const toDateOnly = (v?: string | Date | null): string => {
  if (!v) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  if (typeof v === "string") return isDateOnly(v) ? v : v.slice(0, 10);
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear(), m = v.getMonth() + 1, d = v.getDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

const formatDateFR = (v?: string | Date | null): string => {
  const s = toDateOnly(v);
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

const todayStr = (() => {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
})();

export default function CardItem({ card, index, onUpdateCard, onDeleteCard }: CardItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dueDateStr = useMemo(() => toDateOnly(card.dueDate), [card.dueDate]);
  const dateLabel = useMemo(() => formatDateFR(card.dueDate), [card.dueDate]);
  const isOverdue = useMemo(() => !card.isCompleted && !!dueDateStr && dueDateStr < todayStr, [card.isCompleted, dueDateStr]);

  const priorityChip = useMemo(() => {
    switch (card.priority) {
      case 3: return { text: "Haute", dot: "bg-red-500", bg: "bg-red-50", textColor: "text-red-700" };
      case 2: return { text: "Moyenne", dot: "bg-orange-400", bg: "bg-orange-50", textColor: "text-orange-700" };
      default: return { text: "Basse", dot: "bg-green-500", bg: "bg-green-50", textColor: "text-green-700" };
    }
  }, [card.priority]);

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

  const toggleCompleted = async () => {
    const next = !card.isCompleted;
    const optimistic: Card = { ...card, isCompleted: next };
    onUpdateCard?.(optimistic);
    try {
      const payload = {
        title: card.title,
        description: card.description ?? "",
        priority: card.priority,
        dueDate: dueDateStr,
        listId: card.listId,
        isCompleted: next,
      };
      const res = await api.put<ApiResponse<Card> | Card>(`/cards/${card.id}`, payload);
      const updated: Card = (res as any)?.data ?? (res as any);
      if (typeof (updated as any).isCompleted !== "boolean") (updated as any).isCompleted = next;
      onUpdateCard?.(updated);
    } catch {
      alert("Impossible de modifier le statut de la carte.");
      onUpdateCard?.({ ...card });
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={[
            "border rounded-md p-3 mb-2 relative transition-shadow",
            card.isCompleted ? "bg-gray-50 border-gray-200 opacity-95" : "bg-white border-gray-200",
            snapshot.isDragging ? "shadow-lg" : "shadow-sm",
          ].join(" ")}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3
                className={[
                  "font-semibold text-sm leading-snug break-words",
                  card.isCompleted ? "line-through text-gray-500" : "text-gray-900",
                ].join(" ")}
                title={card.title}
              >
                {card.title}
              </h3>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium flex-shrink-0",
                  card.isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700",
                ].join(" ")}
              >
                {card.isCompleted ? "Fait" : "À faire"}
              </span>
            </div>
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                type="button"
                className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100"
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
                  "absolute right-0 mt-1 w-48 max-w-[80vw] max-h-[60vh] overflow-auto z-[15]",
                  "bg-white border border-gray-200 rounded-lg shadow-sm",
                  menuOpen ? "block" : "hidden",
                ].join(" ")}
                role="menu"
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompleted();
                    setMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  {card.isCompleted ? "Marquer comme à faire" : "Marquer comme fait"}
                </button>
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
                    if (![1, 2, 3].includes(priorityNum)) { alert("Priorité invalide"); return; }
                    const currentDateStr = dueDateStr || toDateOnly(new Date());
                    const dueDateInput = prompt("Échéance (AAAA-MM-JJ)", currentDateStr) || currentDateStr;
                    try {
                      const res = await api.put<ApiResponse<Card> | Card>(`/cards/${card.id}`, {
                        title,
                        description,
                        priority: priorityNum,
                        dueDate: toDateOnly(dueDateInput),
                        listId: card.listId,
                        isCompleted: card.isCompleted ?? false,
                      });
                      const updated: Card = (res as any)?.data ?? (res as any);
                      if (typeof (updated as any).isCompleted !== "boolean") (updated as any).isCompleted = false;
                      onUpdateCard?.(updated);
                    } catch {
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
                    } catch {
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
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${priorityChip.bg} ${priorityChip.textColor}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${priorityChip.dot}`} />
              Priorité&nbsp;: {priorityChip.text}
            </span>
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                isOverdue ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-gray-100 text-gray-700",
              ].join(" ")}
              title={dueDateStr}
            >
              Échéance&nbsp;: {dateLabel}{isOverdue ? " — En retard" : ""}
            </span>
          </div>
          {card.description && card.description.trim().length > 0 && (
            <p className="m-0 mt-2 text-sm text-gray-700 break-words">
              {card.description}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
}
