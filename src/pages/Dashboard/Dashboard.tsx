import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Board from "@/components/board/Board";
import type { Board as BoardType, List, Card } from "@/components/board/types";
import Header from "@/components/layout/Header";
import api from "@/services/apiService";

const user = { id: localStorage.getItem("userId") || "", name: localStorage.getItem("username") || "", avatarUrl: "" };
const currentBoardId = "b1";

const allLists: List[] = [
  { id: "l-todo",  name: "À faire",  boardId: "b1" },
  { id: "l-doing", name: "En cours", boardId: "b1" },
  { id: "l-done",  name: "Terminé",  boardId: "b1" },
];
const lists = allLists.filter(l => l.boardId === currentBoardId);

const mockCards: Card[] = [
  {
    id: "c1", title: "Préparer la démo", description: "slides + scénar",
    listId: "l-todo", dueDate: new Date().toISOString(), priority: 2, isCompleted: false
  },
  {
    id: "c2", title: "Écrire la doc", description: "README + API",
    listId: "l-todo", dueDate: new Date(Date.now()+86400000).toISOString(), priority: 1, isCompleted: false
  },
  {
    id: "c3", title: "Fix bug #123", description: "page profile crash",
    listId: "l-doing", dueDate: new Date().toISOString(), priority: 3, isCompleted: false
  },
];

type BoardsResponse = { success: boolean; data: BoardType[] };

const Dashboard: NextPage = () => {
  const [boards, setBoards] = useState<BoardType[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      const userId = localStorage.getItem("userId") || "";
      const res = await api.get<BoardsResponse>(`/boards/user/${userId}`);
      const payload = Array.isArray(res?.data) ? res.data : [];
      const sorted = [...payload].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
      setBoards(sorted);
    };
    fetchBoards();
  }, []);

  const currentBoard = boards.find((b) => b.id === currentBoardId);

  return (
    <>
      <Header user={user} boards={boards} currentBoardId={currentBoardId} onSelectBoard={() => {}} />
      <main className="pt-14">
        {currentBoard && (
          <Board board={currentBoard} lists={lists} cards={mockCards} title={currentBoard.name} />
        )}
      </main>
    </>
  );
};

export default Dashboard;