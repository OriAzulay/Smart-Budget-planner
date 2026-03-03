import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color: 'purple' | 'teal' | 'orange' | 'pink' | 'blue' | 'green';
  icon?: ReactNode;
  editable?: boolean;
  onDoubleClick?: () => void;
  subtitle?: string;
}

const colorClasses = {
  purple: 'bg-purple-100 border-purple-400 text-purple-900',
  teal: 'bg-teal-100 border-teal-400 text-teal-900',
  orange: 'bg-orange-100 border-orange-400 text-orange-900',
  pink: 'bg-pink-100 border-pink-400 text-pink-900',
  blue: 'bg-blue-100 border-blue-400 text-blue-900',
  green: 'bg-green-100 border-green-400 text-green-900',
};

export function StatCard({ title, value, color, icon, editable, onDoubleClick, subtitle }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border-4 p-6 ${colorClasses[color]} ${editable ? 'cursor-pointer hover:scale-105' : ''} transition-transform shadow-lg`}
      onDoubleClick={editable ? onDoubleClick : undefined}
      title={editable ? 'Double-click to edit' : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm uppercase tracking-wider opacity-75">{title}</h3>
        {icon && <div className="opacity-75">{icon}</div>}
      </div>
      <div className="text-4xl mt-4 tracking-tight" style={{ fontWeight: 800 }}>
        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
      </div>
      {subtitle && (
        <div className="text-sm mt-2 opacity-75">{subtitle}</div>
      )}
    </div>
  );
}
