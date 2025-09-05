import type { NextPage } from "next";
import Board from "@/components/board/Board";
import type { Board as BoardType, List, Card } from "@/components/board/types";
import Header from "@/components/layout/Header";

const user = { id: "u1", name: "Arthur le boss", avatarUrl: "" };

const boards = [
  { id: "b1", name: "Projet X" },
  { id: "b2", name: "Cours 3iL" },
  { id: "b3", name: "Side project" },
];

const currentBoardId = "b1";

const allBoards: BoardType[] = [
  { id: "b1", name: "Projet X", description: "Board de démo", userId: "u123" },
  { id: "b2", name: "Cours 3iL", description: "Board de démo 2", userId: "u123" },
];
const currentBoard = allBoards.find(b => b.id === currentBoardId)!;

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

const App: NextPage = () => {
  return (
    <>
      <Header
        user={user}
        boards={boards}
        currentBoardId={currentBoardId}
        onSelectBoard={(id) => {
          console.log("switch board ->", id);
        }}
      />

      <main className="pt-14">
        <Board
          board={currentBoard}
          lists={lists}
          cards={mockCards}
          title={currentBoard.name}
        />
      </main>
    </>
  );
};

export default App;