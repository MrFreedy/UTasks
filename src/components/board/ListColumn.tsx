import { Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";
import type { List, Card } from "./types";

type ListColumnProps = {
  list: List;
  cards: Card[];
};

export default function ListColumn({ list, cards }: ListColumnProps) {
  return (
    <div className="column">
      <h2>{list.name}</h2>
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`taskList ${snapshot.isDraggingOver ? "dragOver" : ""}`}
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