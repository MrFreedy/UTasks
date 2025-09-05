import { Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";
import type { List, Card } from "./types";

type ListColumnProps = {
  list: List;
  cards: Card[];
};

export default function ListColumn({ list, cards }: ListColumnProps) {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-[200px] min-w-[250px] flex-none">
      <h2 className="m-0 mb-2 text-base font-semibold">{list.name}</h2>
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[40px] p-1.5 rounded-md transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-blue-100" : ""
            }`}
          >
            {cards.map((card, index) => (
              <CardItem key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}