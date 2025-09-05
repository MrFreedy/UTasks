import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import type { User, BoardLite } from "./types";
import "@/styles/header.css";

type HeaderProps = {
  user: User;
  boards: BoardLite[];
  currentBoardId?: string;
  onSelectBoard?: (boardId: string) => void;
  className?: string;
};

export default function Header({
  user,
  boards,
  currentBoardId,
  onSelectBoard,
  className,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) btnRef.current?.focus();
  }, [open]);

  return (
    <>
      <header className={`appHeader ${className ?? ""}`}>
        <div className="headerLeft">
          <button
            ref={btnRef}
            type="button"
            className="menuBtn"
            aria-label="Ouvrir le menu des boards"
            aria-expanded={open}
            aria-controls="left-sidebar"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menuIcon" aria-hidden>
              <span></span><span></span><span></span>
            </span>
          </button>

          <div className="brand">
            {boards.find(b => b.id === currentBoardId)?.name ?? "Mes Boards"}
          </div>
        </div>

        <div className="headerRight">
          <div className="user">
            <img
              className="avatar"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={`${user.name}`}
              referrerPolicy="no-referrer"
            />
          </div>
          <button>
            Disconnect
          </button>
        </div>
      </header>

      <Sidebar
        id="left-sidebar"
        open={open}
        boards={boards}
        currentBoardId={currentBoardId}
        onClose={() => setOpen(false)}
        onSelectBoard={(id) => {
          onSelectBoard?.(id);
          setOpen(false);
        }}
      />
    </>
  );
}