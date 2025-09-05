import { Draggable } from "@hello-pangea/dnd";
import type { Card } from "./types";

type CardItemProps = {
  card: Card;
  index: number;
};

export default function CardItem({ card, index }: CardItemProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task ${snapshot.isDragging ? "dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task-title">{card.title}</div>
          <div className="task-meta">
            <span>Priorité: {card.priority}</span>
            <span>Échéance: {new Date(card.dueDate).toLocaleDateString()}</span>
            {card.isCompleted && <span className="badge">Terminé</span>}
          </div>
          <p className="task-desc">{card.description}</p>
        </div>
      )}
    </Draggable>
  );
}