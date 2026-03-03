import { useState } from 'react';

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  type?: 'text' | 'number';
}

export function EditableCell({ value, onSave, className = '', type = 'text' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(tempValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 bg-white border-2 border-purple-500 rounded outline-none ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`px-3 py-2 cursor-pointer hover:bg-purple-50 transition-colors rounded ${className}`}
      title="Double-click to edit"
    >
      {value || '-'}
    </div>
  );
}
