import { useEffect, useRef } from "react";
import type { BoardLite } from "./types";

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
      const el = panelRef.current?.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])");
      el?.focus();
    }
  }, [open]);

  return (
    <>
      <div
        className={`sidebarOverlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        id={id}
        ref={panelRef}
        className={`sidebarPanel ${open ? "open" : ""}`}
        aria-hidden={!open}
        tabIndex={-1}
      >
        <div className="sidebarHeader">
          <h3>Boards</h3>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer le menu">
            ×
          </button>
        </div>

        <nav className="sidebarContent">
          {boards.length === 0 && (
            <div className="empty">Aucun board</div>
          )}

          <ul className="boardList">
            {boards.map((b) => (
              <li key={b.id}>
                <button
                  className={`boardItem ${b.id === currentBoardId ? "active" : ""}`}
                  onClick={() => onSelectBoard?.(b.id)}
                >
                  {b.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}