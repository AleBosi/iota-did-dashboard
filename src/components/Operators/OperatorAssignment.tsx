import React from "react";

interface Operator {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

interface Props {
  operators: Operator[];
  tasks: Task[];
  onAssign: (operatorId: string, taskId: string) => void;
}

export default function OperatorAssignment({ operators, tasks, onAssign }: Props) {
  return (
    <div>
      <h4>Assegna Task a Operatore</h4>
      {tasks.map(task => (
        <div key={task.id} className="mb-2">
          <span className="font-semibold">{task.name}</span>
          <select
            className="ml-2 border rounded"
            onChange={e => onAssign(e.target.value, task.id)}
            defaultValue=""
          >
            <option value="" disabled>Seleziona operatore</option>
            {operators.map(op => (
              <option value={op.id} key={op.id}>{op.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
