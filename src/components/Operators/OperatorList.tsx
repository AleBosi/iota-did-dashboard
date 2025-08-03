import React from "react";
import { Operator } from "../../models/operator";

interface Props {
  operators: Operator[];
  onSelect?: (op: Operator) => void;
}

const OperatorList: React.FC<Props> = ({ operators, onSelect }) => (
  <ul>
    {operators.map(op => (
      <li key={op.operatorId} onClick={() => onSelect?.(op)}>
        {op.name} ({op.role}) - {op.did}
      </li>
    ))}
  </ul>
);

export default OperatorList;
