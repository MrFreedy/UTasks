import { Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";
import type { List, Card } from "./types";
import { RiInformationLine } from "@remixicon/react";

type ListColumnProps = {
  list: List;
  cards: Card[];
};

export default function ListColumn({ list, cards }: ListColumnProps) {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 min-h-[200px] min-w-[250px] flex-none">
      <h2 className="m-0 mb-2 text-base font-semibold">
        {list.name}
        <span className="ml-1 align-middle relative group">
          <RiInformationLine className="inline-block w-3 h-3 text-gray-500 cursor-pointer mb-1" />
          <span className="absolute left-5 top-0 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            List ID: {list.id}
          </span>
        </span>
      </h2>
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