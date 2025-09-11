import { useState, useEffect, useMemo } from "react";
import Board from "@/components/board/Board";
import type { Board as BoardType } from "@/components/board/types";
import Header from "@/components/layout/Header";
import api from "@/services/apiService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiInformationLine } from "@remixicon/react";

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
                  <div className="font-semibold mb-1 truncate">{b.name}
                    <span className="ml-1 align-middle relative group">
                      <RiInformationLine className="inline-block w-3 h-3 text-gray-500 cursor-pointer mb-1" />
                      <span className="absolute left-5 top-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Board ID: {b.id}
                      </span>
                    </span>
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