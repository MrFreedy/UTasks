import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import type { User, BoardLite } from "./types";
import Avatar from "@/assets/avatar.svg";
import { RiDoorLine, RiDoorOpenLine } from '@remixicon/react';

type HeaderProps = {
  user: User;
  boards: BoardLite[];
  currentBoardId?: string;
  onSelectBoard?: (boardId: string) => void;
  onBoardCreated?: (board: BoardLite) => void;
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
  const [isHovered, setIsHovered] = useState(false);

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
      <header
        className={[
          "fixed inset-x-0 top-0 h-14 z-[110]",
          "flex items-center justify-between",
          "px-3 sm:px-4 border-b border-gray-200 bg-white shadow-sm",
          className ?? "",
        ].join(" ")}
      >
        {/* Left */}
        <div className="flex items-center gap-2.5">
          <button
            ref={btnRef}
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Ouvrir le menu des boards"
            aria-expanded={open}
            aria-controls="left-sidebar"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="inline-flex flex-col gap-0.5" aria-hidden>
              <span className="block w-[18px] h-[2px] bg-gray-900 rounded" />
              <span className="block w-[18px] h-[2px] bg-gray-900 rounded" />
              <span className="block w-[18px] h-[2px] bg-gray-900 rounded" />
            </span>
          </button>

          <div className="text-gray-900 font-bold text-base sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            {boards.find((b) => b.id === currentBoardId)?.name ?? "Mes Boards"}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm hidden sm:inline">
            {localStorage.getItem('username') || user.name}
          </span>
          <div className="user">
            <img
              className="w-9 h-9 rounded-full border border-gray-200 object-cover"
              src={Avatar}
              alt={`${user.name}`}
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              localStorage.removeItem('userId');
              localStorage.removeItem('username');
              window.location.reload();
            }}
            title="Se déconnecter"
          >
            {isHovered ? <RiDoorOpenLine className="text-xl" /> : <RiDoorLine className="text-xl" />}
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
