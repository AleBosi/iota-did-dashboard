import React from "react";

interface User {
  username: string;
  role: "admin" | "azienda" | "creator" | "operatore" | "macchinario";
  avatarUrl?: string;
}

interface Props {
  user: User;
  onLogout?: () => void;
}

const roleLabel: Record<User["role"], string> = {
  admin: "Amministratore",
  azienda: "Azienda",
  creator: "Creator",
  operatore: "Operatore",
  macchinario: "Macchinario"
};

export default function Header({ user, onLogout }: Props) {
  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-8 py-3 border-b">
      <div className="flex items-center gap-4">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-10 h-10 rounded-full border"
          />
        )}
        <div>
          <div className="font-semibold text-lg">{user.username}</div>
          <div className="text-sm text-gray-500">{roleLabel[user.role]}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Notifiche: esempio badge/placeholder */}
        {/* <button className="relative px-2 py-1">
          <span className="material-icons text-gray-400">notifications</span>
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </button> */}
        {onLogout && (
          <button
            className="bg-red-100 text-red-600 font-semibold rounded px-4 py-1 hover:bg-red-200 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
