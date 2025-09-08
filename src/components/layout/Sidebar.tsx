import { useEffect, useRef } from "react";
import type { BoardLite, ApiResponse } from "./types";
import api from "@/services/apiService";

type SidebarProps = {
  id?: string;
  open: boolean;
  boards: BoardLite[];
  currentBoardId?: string;
  onClose: () => void;
  onSelectBoard?: (boardId: string) => void;
};

export default function Sidebar({
  id = "left-sidebar",
  open,
  boards,
  currentBoardId,
  onClose,
  onSelectBoard,
}: SidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const el = panelRef.current?.querySelector<HTMLElement>(
        "button, a, [tabindex]:not([tabindex='-1'])"
      );
      el?.focus();
    }
  }, [open]);

  const handleNewBoard = () => {
    const name = prompt("Nom du nouveau board ?");
    const description = prompt("Description du nouveau board ?");
    if (!name || !description) return;

    createNewBoard(name, description);
  };

  const createNewBoard = async (name: string, description: string) => {
    try {
      const userId = localStorage.getItem("userId") || "";
      const res = await api.post<ApiResponse<BoardLite>>('/boards', { name, description, userId });

      window.location.href = `?b=${res.data.id}`;

    } catch (error) {
      console.error("Error creating board:", error);
      alert("Erreur lors de la création du board. Veuillez réessayer.");
    }
    finally {
      onClose();
    }
      
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 bg-black/25 transition-opacity duration-200 z-[120]",
          open ? "opacity-100 visible" : "opacity-0 invisible",
        ].join(" ")}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        id={id}
        ref={panelRef}
        className={[
          "fixed top-0 left-0 bottom-0 z-[130]",
          "w-[86vw] sm:w-72 bg-white border-r border-gray-200",
          "transform transition-transform duration-200 will-change-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "flex flex-col",
        ].join(" ")}
        aria-hidden={!open}
        tabIndex={-1}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
          <h3 className="m-0 text-base font-bold">Boards</h3>
          <button
            className="text-2xl leading-none bg-transparent border-0 cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav className="p-3 overflow-y-auto">
          {boards.length === 0 && (
            <div className="text-gray-500 text-sm px-3 py-2">Aucun board</div>
          )}

          <ul className="grid gap-1.5 list-none m-0 p-0">
            {boards.map((b) => {
              const active = b.id === currentBoardId;
              return (
                <li key={b.id}>
                  <button
                    className={[
                      "w-full text-left px-3 py-2.5 rounded-lg border",
                      "bg-slate-50 border-gray-200 hover:bg-slate-100",
                      active ? "bg-indigo-100 border-indigo-300" : "",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                    ].join(" ")}
                    onClick={() => onSelectBoard?.(b.id)}
                  >
                    {b.name}
                  </button>
                </li>
              );
            })}
          </ul>

          <button className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleNewBoard}>
            Nouveau board
          </button>
        </nav>
      </aside>
    </>
  );
}