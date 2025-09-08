import { useState, useEffect, useMemo } from "react";
import Board from "@/components/board/Board";
import type { Board as BoardType } from "@/components/board/types";
import Header from "@/components/layout/Header";
import api from "@/services/apiService";
import { useNavigate, useSearchParams } from "react-router-dom";

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

        const fromUrl = searchParams.get("b") || undefined;
        const fromStorage = localStorage.getItem("currentBoardId") || undefined;
        const initial = fromUrl ?? fromStorage ?? sorted[0]?.id;
        if (initial) setCurrentBoardId(initial);
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
      <main className="pt-14">
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