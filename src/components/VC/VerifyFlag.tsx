import React from "react";

interface Props {
  isValid: boolean;
}

export default function VerifyFlag({ isValid }: Props) {
  return (
    <span className={`ml-2 text-xl ${isValid ? "text-green-600" : "text-red-600"}`}>
      {isValid ? "✅" : "❌"}
    </span>
  );
}
