import React from 'react';
import { Task } from '../types/Task';
import TaskCard from './TaskCard';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateTask: (id: number, updates: Partial<Task>) => void;
  onDragEnd: (result: DropResult) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleStatus, onDelete, onUpdateTask, onDragEnd }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">目前沒有任務</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="taskList" direction="vertical">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
              snapshot.isDraggingOver ? 'bg-gray-100 rounded-lg p-4' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${snapshot.isDragging ? 'z-50' : ''}`}
                    style={{
                      ...provided.draggableProps.style,
                      transform: snapshot.isDragging
                        ? `${provided.draggableProps.style?.transform} scale(1.02)`
                        : provided.draggableProps.style?.transform
                    }}
                  >
                    <TaskCard
                      task={task}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                      onUpdateTask={onUpdateTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
