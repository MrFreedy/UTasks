import { useState, useEffect, useMemo } from "react";
import Board from "@/components/board/Board";
import type { Board as BoardType } from "@/components/board/types";
import Header from "@/components/layout/Header";
import api from "@/services/apiService";
import type { ApiResponse } from "@/components/layout/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiInformationLine, RiMoreFill } from "@remixicon/react";

const user = {
  id: localStorage.getItem("userId") || "",
  name: localStorage.getItem("username") || "",
  avatarUrl: ""
};

type BoardsResponse = { success: boolean; data: BoardType[] };

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | undefined>(undefined);

  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      const userId = localStorage.getItem("userId") || "";
      try {
        const res = await api.get<BoardsResponse>(`/boards/user/${userId}`);
        const payload = res?.data ?? [];
        const sorted = [...payload].sort((a, b) =>
          a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
        );
        setBoards(sorted);

        // If URL has ?b=, select that board; otherwise show tiles (no auto-select)
        const fromUrl = searchParams.get("b") || undefined;
        if (fromUrl) {
          setCurrentBoardId(fromUrl);
          localStorage.setItem("currentBoardId", fromUrl);
        } else {
          setCurrentBoardId(undefined);
        }
      } catch (err) {
        console.error("Erreur chargement boards:", err);
        setBoards([]);
      }
    };
    fetchBoards();
  }, []);

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

  const currentBoard = useMemo(
    () => boards.find((b) => b.id === currentBoardId),
    [boards, currentBoardId]
  );

  return (
    <>
      <Header
        user={user}
        boards={boards}
        currentBoardId={currentBoardId}
        onSelectBoard={(id) => {
          setCurrentBoardId(id);
          localStorage.setItem("currentBoardId", id);
          const sp = new URLSearchParams(searchParams);
          sp.set("b", id);
          navigate({ pathname: "/", search: sp.toString() });
        }}
        onBoardCreated={(newBoard) => {
          const next = [...boards, newBoard].sort((a, b) =>
            a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
          );
          setBoards(next);

          setCurrentBoardId(newBoard.id);
          localStorage.setItem("currentBoardId", newBoard.id);
          const sp = new URLSearchParams(searchParams);
          sp.set("b", newBoard.id);
          navigate({ pathname: "/", search: sp.toString() });
        }}
      />
      <main className="pt-14 px-4">
        {!currentBoard && (
          <div className="mt-8 mb-8">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {boards.map((b) => (
                <button
                  key={b.id}
                  className="text-left p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => {
                    setCurrentBoardId(b.id);
                    localStorage.setItem("currentBoardId", b.id);
                    const sp = new URLSearchParams(searchParams);
                    sp.set("b", b.id);
                    navigate({ pathname: "/", search: sp.toString() });
                  }}
                >
                  <div className="mb-1 flex items-start justify-between">
                    {/* Title + info tooltip (left), with truncation that doesn't clip the menu */}
                    <div className="min-w-0">
                      <div className="font-semibold truncate flex items-center">
                        <span className="truncate">{b.name}</span>
                        <span className="ml-1 align-middle relative group shrink-0">
                          <RiInformationLine className="inline-block w-3 h-3 text-gray-500 cursor-pointer mb-1" />
                          <span className="absolute left-5 top-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            Board ID: {b.id}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Actions button + dropdown menu (right, anchored top-right of the tile) */}
                    <div
                      className="relative shrink-0"
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

                      {/* Dropdown aligned to the top-right of the tile (opens downward) */}
                      <div
                        className={[
                          "absolute right-0 mt-1 w-48 max-w-[80vw] max-h-[60vh] overflow-auto z-[200]",
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
                  <div className="text-xs text-gray-500 truncate">{b.description}</div>
                </button>
              ))}
              {boards.length === 0 && (
                <div className="text-gray-500 text-sm">Aucun board pour l’instant.</div>
              )}
            </div>
          </div>
        )}

        {currentBoard && (
          <Board
            board={currentBoard}
            lists={[]}
            cards={[]}
            title={currentBoard.name}
          />
        )}
      </main>
      <span className="block text-center text-sm text-gray-500">
        ID du board : {currentBoard?.id || "Aucun board sélectionné"}
      </span>
    </>
  );
}
