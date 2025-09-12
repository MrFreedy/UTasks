import { useEffect, useRef, useState } from "react";
import { RiMoreFill } from "@remixicon/react";
import type { BoardLite, ApiResponse } from "./types";
import type { Board } from "@/components/board/types";
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
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const el = panelRef.current?.querySelector<HTMLElement>(
        "button, a, [tabindex]:not([tabindex='-1'])"
      );
      el?.focus();
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenuForId(null);
    }
    function onClick() {
      if (openMenuForId) setOpenMenuForId(null);
    }
    if (openMenuForId) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [openMenuForId]);

  const handleNewBoard = () => {
    const name = prompt("Nom du nouveau board ?");
    if (!name) return;
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
          <a className="m-0 text-base font-bold hover:underline" href="/">Mes Boards</a>
          <button
            className="text-2xl leading-none bg-transparent border-0 cursor-pointer hover:opacity-80"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <nav className="p-3">
          {boards.length === 0 && (
            <div className="text-gray-500 text-center text-sm px-3 py-2">Aucun board disponible</div>
          )}

          <ul className="grid gap-1.5 list-none m-0 p-0">
            {boards.map((b) => {
              const active = b.id === currentBoardId;
              return (
                <li key={b.id}>
                  <div
                    className={[
                      "w-full px-2 py-2.5 rounded-lg border",
                      "bg-slate-50 border-gray-200 hover:bg-slate-100",
                      active ? "bg-indigo-100 border-indigo-300 border-3" : "",
                      "flex items-center justify-between gap-2",
                    ].join(" ")}
                    onClick={() => onSelectBoard?.(b.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate px-1 text-left">{b.name}</div>
                    </div>

                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100"
                        aria-haspopup="menu"
                        aria-expanded={openMenuForId === b.id}
                        title="Actions du board"
                        onClick={() => setOpenMenuForId((v) => (v === b.id ? null : b.id))}
                      >
                        <RiMoreFill className="w-4 h-4" />
                      </button>

                      <div
                        className={[
                          "absolute right-0 mt-1 w-48 z-[200]",
                          "bg-white border border-gray-200 rounded-lg shadow-sm",
                          openMenuForId === b.id ? "block" : "hidden",
                        ].join(" ")}
                        role="menu"
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          role="menuitem"
                          onClick={async () => {
                            try {
                              const fetched = await api.get<ApiResponse<Board> | Board>(`/boards/${b.id}`);
                              const current = (fetched as any)?.data ?? (fetched as any);
                              const newName = prompt("Renommer le board", current?.name ?? b.name)?.trim();
                              if (!newName || newName === (current?.name ?? b.name)) {
                                setOpenMenuForId(null);
                                return;
                              }
                              const newDesc = prompt(
                                "Description du board",
                                current?.description ?? ""
                              ) ?? current?.description ?? "";

                              await api.put<ApiResponse<Board>>(`/boards/${b.id}`, {
                                name: newName,
                                description: newDesc,
                                userId: current?.userId ?? localStorage.getItem("userId") ?? "",
                              });

                              window.location.reload();
                            } catch (error) {
                              console.error("Erreur lors du renommage du board", error);
                              alert("Impossible de renommer le board.");
                            } finally {
                              setOpenMenuForId(null);
                            }
                          }}
                        >
                          Renommer le board
                        </button>

                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          role="menuitem"
                          onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.set("b", b.id);
                            navigator.clipboard?.writeText(url.toString());
                            setOpenMenuForId(null);
                          }}
                        >
                          Copier le lien du board
                        </button>

                        <div className="h-px bg-gray-200 my-1" />

                        <button
                          className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
                          role="menuitem"
                          onClick={async () => {
                            const ok = confirm(`Supprimer le board "${b.name}" ?`);
                            if (!ok) { setOpenMenuForId(null); return; }
                            try {
                              await api.delete(`/boards/${b.id}`);
                              if (b.id === currentBoardId) {
                                window.location.href = "/";
                              } else {
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error("Erreur lors de la suppression du board", error);
                              alert("Impossible de supprimer le board.");
                            } finally {
                              setOpenMenuForId(null);
                            }
                          }}
                        >
                          Supprimer le board
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <button className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleNewBoard}>
            Créer un nouveau board
          </button>
        </nav>
      </aside>
    </>
  );
}
