import { useState } from 'react';
import { useBudget } from '../contexts/budget-context';
import { StatCard } from '../components/stat-card';
import { EditableCell } from '../components/editable-cell';
import { DollarSign, TrendingDown, TrendingUp, Plus, Trash2 } from 'lucide-react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthPage() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const { budgetData, updateMonthIncome, addExpense, updateExpense, deleteExpense, addIncome, updateIncome, deleteIncome } = useBudget();
  
  const monthData = budgetData.monthlyData[selectedMonth];
  const totalExpenses = monthData.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                        monthData.userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = monthData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalSum = totalIncomes - totalExpenses;

  const handleAddUserExpense = () => {
    const newExpense = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: '',
    };
    addExpense(selectedMonth, newExpense, 'user');
  };

  const handleAddIncome = () => {
    const newIncome = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      source: '',
    };
    addIncome(selectedMonth, newIncome);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Month Selector - Prominent */}
      <div className="bg-white rounded-2xl border-4 border-blue-400 shadow-lg p-6">
        <label className="text-2xl text-blue-900 block mb-4" style={{ fontWeight: 800 }}>Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-6 py-4 text-2xl border-4 border-blue-400 rounded-xl bg-blue-50 text-blue-900 outline-none cursor-pointer hover:bg-blue-100 transition-colors"
          style={{ fontWeight: 700 }}
        >
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={totalIncomes.toFixed(2)}
          color="green"
          icon={<TrendingUp size={24} />}
          subtitle="From all income sources"
        />
        
        <StatCard
          title="Total Expenses"
          value={totalExpenses.toFixed(2)}
          color="pink"
          icon={<TrendingDown size={24} />}
          subtitle="Fixed + User expenses"
        />
        
        <StatCard
          title="Balance"
          value={totalSum.toFixed(2)}
          color={totalSum >= 0 ? 'teal' : 'orange'}
          icon={<DollarSign size={24} />}
          subtitle="Income - Expenses"
        />
      </div>

      {/* Monthly Incomes */}
      <div className="bg-white rounded-2xl border-4 border-green-400 shadow-lg overflow-hidden">
        <div className="bg-green-400 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-2xl" style={{ fontWeight: 800 }}>Monthly Incomes</h2>
          <button
            onClick={handleAddIncome}
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <Plus size={20} />
            Add Income
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-100">
                <th className="px-4 py-3 text-left text-green-900" style={{ fontWeight: 700 }}>Description</th>
                <th className="px-4 py-3 text-left text-green-900" style={{ fontWeight: 700 }}>Source</th>
                <th className="px-4 py-3 text-left text-green-900" style={{ fontWeight: 700 }}>Amount</th>
                <th className="px-4 py-3 text-left text-green-900" style={{ fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthData.incomes.map((income, index) => (
                <tr key={income.id} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                  <td className="border-b border-green-200">
                    <EditableCell
                      value={income.description}
                      onSave={(value) => updateIncome(selectedMonth, income.id, { ...income, description: value })}
                    />
                  </td>
                  <td className="border-b border-green-200">
                    <EditableCell
                      value={income.source || ''}
                      onSave={(value) => updateIncome(selectedMonth, income.id, { ...income, source: value })}
                    />
                  </td>
                  <td className="border-b border-green-200">
                    <EditableCell
                      value={income.amount.toString()}
                      onSave={(value) => updateIncome(selectedMonth, income.id, { ...income, amount: parseFloat(value) || 0 })}
                      type="number"
                    />
                  </td>
                  <td className="border-b border-green-200 px-4 py-2">
                    <button
                      onClick={() => deleteIncome(selectedMonth, income.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Fixed Expenses */}
      <div className="bg-white rounded-2xl border-4 border-teal-400 shadow-lg overflow-hidden">
        <div className="bg-teal-400 px-6 py-4">
          <h2 className="text-white text-2xl" style={{ fontWeight: 800 }}>Monthly Fixed Expenses</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-100">
                <th className="px-4 py-3 text-left text-teal-900" style={{ fontWeight: 700 }}>Description</th>
                <th className="px-4 py-3 text-left text-teal-900" style={{ fontWeight: 700 }}>Category</th>
                <th className="px-4 py-3 text-left text-teal-900" style={{ fontWeight: 700 }}>Amount</th>
                <th className="px-4 py-3 text-left text-teal-900" style={{ fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthData.fixedExpenses.map((expense, index) => (
                <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-teal-50'}>
                  <td className="border-b border-teal-200">
                    <EditableCell
                      value={expense.description}
                      onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, description: value }, 'fixed')}
                    />
                  </td>
                  <td className="border-b border-teal-200">
                    <EditableCell
                      value={expense.category || ''}
                      onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, category: value }, 'fixed')}
                    />
                  </td>
                  <td className="border-b border-teal-200">
                    <EditableCell
                      value={expense.amount.toString()}
                      onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, amount: parseFloat(value) || 0 }, 'fixed')}
                      type="number"
                    />
                  </td>
                  <td className="border-b border-teal-200 px-4 py-2">
                    <button
                      onClick={() => deleteExpense(selectedMonth, expense.id, 'fixed')}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Added Expenses */}
      <div className="bg-white rounded-2xl border-4 border-pink-400 shadow-lg overflow-hidden">
        <div className="bg-pink-400 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-2xl" style={{ fontWeight: 800 }}>Additional Expenses</h2>
          <button
            onClick={handleAddUserExpense}
            className="bg-white text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
        
        {monthData.userExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No additional expenses yet. Click "Add Expense" to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-100">
                  <th className="px-4 py-3 text-left text-pink-900" style={{ fontWeight: 700 }}>Description</th>
                  <th className="px-4 py-3 text-left text-pink-900" style={{ fontWeight: 700 }}>Category</th>
                  <th className="px-4 py-3 text-left text-pink-900" style={{ fontWeight: 700 }}>Amount</th>
                  <th className="px-4 py-3 text-left text-pink-900" style={{ fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthData.userExpenses.map((expense, index) => (
                  <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-pink-50'}>
                    <td className="border-b border-pink-200">
                      <EditableCell
                        value={expense.description}
                        onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, description: value }, 'user')}
                      />
                    </td>
                    <td className="border-b border-pink-200">
                      <EditableCell
                        value={expense.category || ''}
                        onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, category: value }, 'user')}
                      />
                    </td>
                    <td className="border-b border-pink-200">
                      <EditableCell
                        value={expense.amount.toString()}
                        onSave={(value) => updateExpense(selectedMonth, expense.id, { ...expense, amount: parseFloat(value) || 0 }, 'user')}
                        type="number"
                      />
                    </td>
                    <td className="border-b border-pink-200 px-4 py-2">
                      <button
                        onClick={() => deleteExpense(selectedMonth, expense.id, 'user')}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}