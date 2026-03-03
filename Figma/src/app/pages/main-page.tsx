import { useState } from 'react';
import { useBudget } from '../contexts/budget-context';
import { StatCard } from '../components/stat-card';
import { EditableCell } from '../components/editable-cell';
import { Target, TrendingUp, Plus } from 'lucide-react';

export function MainPage() {
  const { budgetData, updateGoal, updateMainTableCell, updateMainTableColumn, addMainTableRow, addMainTableColumn, getAverageSpend } = useBudget();
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInput, setGoalInput] = useState(budgetData.goal.toString());
  const [newColumnName, setNewColumnName] = useState('');

  const handleGoalSave = () => {
    updateGoal(parseFloat(goalInput) || 0);
    setShowGoalInput(false);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addMainTableColumn(newColumnName);
      setNewColumnName('');
    }
  };

  const averageSpend = getAverageSpend();

  return (
    <div className="p-8 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Average Monthly Spend"
          value={averageSpend.toFixed(2)}
          color="teal"
          icon={<TrendingUp size={24} />}
          subtitle="Calculated from all expenses"
        />
        
        {showGoalInput ? (
          <div className="rounded-2xl border-4 border-orange-400 bg-orange-100 p-6 shadow-lg">
            <h3 className="text-sm uppercase tracking-wider text-orange-900 opacity-75 mb-4">Set Your Goal</h3>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={handleGoalSave}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
              className="w-full text-4xl p-3 border-2 border-orange-500 rounded-lg outline-none"
              style={{ fontWeight: 800 }}
              autoFocus
              placeholder="0"
            />
          </div>
        ) : (
          <StatCard
            title="Monthly Goal"
            value={budgetData.goal || 'Set Goal'}
            color="orange"
            icon={<Target size={24} />}
            editable
            onDoubleClick={() => {
              setShowGoalInput(true);
              setGoalInput(budgetData.goal.toString());
            }}
            subtitle="Double-click to edit"
          />
        )}
      </div>

      {/* Main Budget Table */}
      <div className="bg-white rounded-2xl border-4 border-purple-400 shadow-lg overflow-hidden">
        <div className="bg-purple-400 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-2xl" style={{ fontWeight: 800 }}>Budget Overview</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              placeholder="New column name"
              className="px-3 py-2 rounded-lg border-2 border-white/30 bg-white/20 text-white placeholder:text-white/60 outline-none"
            />
            <button
              onClick={handleAddColumn}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
              style={{ fontWeight: 700 }}
            >
              <Plus size={20} />
              Add Column
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-100">
                {budgetData.mainTableColumns.map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-purple-900 border-b-2 border-purple-300"
                    style={{ fontWeight: 700 }}
                  >
                    {i === 0 ? (
                      <div className="px-0">{col}</div>
                    ) : (
                      <EditableCell
                        value={col}
                        onSave={(value) => updateMainTableColumn(i, value)}
                        className="!px-0 font-bold"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetData.mainTableData.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border-b border-purple-200">
                      {colIndex === 0 ? (
                        <div className="px-4 py-2 text-purple-900" style={{ fontWeight: 600 }}>{cell}</div>
                      ) : (
                        <EditableCell
                          value={cell}
                          onSave={(value) => updateMainTableCell(rowIndex, colIndex, value)}
                          type="text"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-purple-50 border-t-2 border-purple-300">
          <button
            onClick={addMainTableRow}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <Plus size={20} />
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
}