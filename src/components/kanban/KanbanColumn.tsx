import { Droppable, Draggable } from '@hello-pangea/dnd'
import type { Task, TaskStatus } from '../../types'
import { STATUS_CONFIG } from '../../types'
import { TaskCard } from '../tasks/TaskCard'

interface Props {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onTaskClick }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className={`flex items-center gap-2 mb-3 px-1`}>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${config.color} ${config.bgColor}`}>
          {config.label}
        </span>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 p-2 rounded-lg min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      dragHandleProps={provided.dragHandleProps as object | undefined}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
