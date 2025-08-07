import React from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ 
  title, 
  subtitle, 
  items, 
  activeItem, 
  onItemClick, 
  onLogout 
}: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-300 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick?.(item.id)}
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
                  activeItem === item.id
                    ? "bg-blue-600 text-white border-r-4 border-blue-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.icon && (
                  <span className="text-lg">{item.icon}</span>
                )}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}