import React from 'react';
import { Task, TaskStatus } from '../types/Task';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onDragEnd,
  onToggleStatus,
  onDelete,
}) => {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getColumnTitle = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return '待辦事項';
      case TaskStatus.IN_PROGRESS:
        return '進行中';
      case TaskStatus.DONE:
        return '已完成';
    }
  };

  const getColumnColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50';
      case TaskStatus.DONE:
        return 'bg-green-50';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(TaskStatus).map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg p-4 min-h-[200px] ${getColumnColor(status)} ${
                  snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                  {getColumnTitle(status)}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({getTasksByStatus(status).length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {getTasksByStatus(status).map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <TaskCard
                            task={task}
                            onToggleStatus={onToggleStatus}
                            onDelete={onDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
