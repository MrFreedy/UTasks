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
          className={`bg-white border border-gray-200 rounded-md p-2 mb-2 shadow-sm ${
            snapshot.isDragging ? "shadow-lg" : ""
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="font-semibold mb-1">{card.title}</div>
          <div className="flex gap-2 text-xs text-gray-500 mb-1">
            <span>Priorité: {card.priority}</span>
            <span>Échéance: {new Date(card.dueDate).toLocaleDateString()}</span>
            {card.isCompleted && (
              <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-[11px]">
                Terminé
              </span>
            )}
          </div>
          <p className="m-0 text-sm text-gray-700">{card.description}</p>
        </div>
      )}
    </Draggable>
  );
}