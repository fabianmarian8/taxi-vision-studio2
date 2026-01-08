'use client';

import { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'phone' | 'email' | 'url' | 'image';

interface EditableFieldProps {
  children: ReactNode;
  fieldKey: string;
  fieldType: FieldType;
  label: string;
  isEditMode: boolean;
  onClick: (fieldKey: string, fieldType: FieldType, label: string) => void;
  className?: string;
}

export function EditableField({
  children,
  fieldKey,
  fieldType,
  label,
  isEditMode,
  onClick,
  className = '',
}: EditableFieldProps) {
  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      onClick={() => onClick(fieldKey, fieldType, label)}
      className={`group relative cursor-pointer ${className}`}
    >
      {/* Highlight border */}
      <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-lg transition-colors pointer-events-none" />

      {/* Edit indicator */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-yellow-400 text-gray-900 rounded-full p-1.5 shadow-lg">
          <Pencil className="w-3 h-3" />
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Upraviť: {label}
        </div>
      </div>

      {/* Content */}
      <div className="group-hover:opacity-75 transition-opacity">
        {children}
      </div>
    </div>
  );
}
