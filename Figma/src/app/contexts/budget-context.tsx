import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  date?: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  source?: string;
  date?: string;
}

export interface MonthData {
  income: number;
  fixedExpenses: Expense[];
  userExpenses: Expense[];
  incomes: Income[];
}

export interface BudgetData {
  goal: number;
  monthlyData: Record<string, MonthData>;
  mainTableData: string[][];
  mainTableColumns: string[];
}

interface BudgetContextType {
  budgetData: BudgetData;
  updateGoal: (goal: number) => void;
  updateMonthIncome: (month: string, income: number) => void;
  addExpense: (month: string, expense: Expense, type: 'fixed' | 'user') => void;
  updateExpense: (month: string, expenseId: string, updatedExpense: Expense, type: 'fixed' | 'user') => void;
  deleteExpense: (month: string, expenseId: string, type: 'fixed' | 'user') => void;
  addIncome: (month: string, income: Income) => void;
  updateIncome: (month: string, incomeId: string, updatedIncome: Income) => void;
  deleteIncome: (month: string, incomeId: string) => void;
  updateMainTableCell: (row: number, col: number, value: string) => void;
  updateMainTableColumn: (colIndex: number, name: string) => void;
  addMainTableRow: () => void;
  addMainTableColumn: (name: string) => void;
  getAverageSpend: () => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const initialMonthData: MonthData = {
  income: 0,
  fixedExpenses: [
    { id: '1', description: 'Rent', amount: 1200, category: 'Housing' },
    { id: '2', description: 'Utilities', amount: 150, category: 'Housing' },
    { id: '3', description: 'Groceries', amount: 400, category: 'Food' },
  ],
  userExpenses: [],
  incomes: [
    { id: '1', description: 'Salary', amount: 5000, source: 'Employment' },
  ],
};

const initialTableColumns = ['Month', 'Income', 'Housing', 'Food', 'Transport', 'Entertainment', 'Other'];
const initialTableData: string[][] = months.map(month => [month, '', '', '', '', '', '']);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgetData, setBudgetData] = useState<BudgetData>(() => {
    const monthlyData: Record<string, MonthData> = {};
    months.forEach(month => {
      monthlyData[month] = { 
        ...initialMonthData, 
        fixedExpenses: [...initialMonthData.fixedExpenses],
        incomes: [...initialMonthData.incomes],
      };
    });
    
    return {
      goal: 0,
      monthlyData,
      mainTableData: initialTableData,
      mainTableColumns: initialTableColumns,
    };
  });

  const updateGoal = (goal: number) => {
    setBudgetData(prev => ({ ...prev, goal }));
  };

  const updateMonthIncome = (month: string, income: number) => {
    setBudgetData(prev => ({
      ...prev,
      monthlyData: {
        ...prev.monthlyData,
        [month]: {
          ...prev.monthlyData[month],
          income,
        },
      },
    }));
  };

  const addExpense = (month: string, expense: Expense, type: 'fixed' | 'user') => {
    setBudgetData(prev => {
      const field = type === 'fixed' ? 'fixedExpenses' : 'userExpenses';
      return {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [month]: {
            ...prev.monthlyData[month],
            [field]: [...prev.monthlyData[month][field], expense],
          },
        },
      };
    });
  };

  const updateExpense = (month: string, expenseId: string, updatedExpense: Expense, type: 'fixed' | 'user') => {
    setBudgetData(prev => {
      const field = type === 'fixed' ? 'fixedExpenses' : 'userExpenses';
      return {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [month]: {
            ...prev.monthlyData[month],
            [field]: prev.monthlyData[month][field].map(exp =>
              exp.id === expenseId ? updatedExpense : exp
            ),
          },
        },
      };
    });
  };

  const deleteExpense = (month: string, expenseId: string, type: 'fixed' | 'user') => {
    setBudgetData(prev => {
      const field = type === 'fixed' ? 'fixedExpenses' : 'userExpenses';
      return {
        ...prev,
        monthlyData: {
          ...prev.monthlyData,
          [month]: {
            ...prev.monthlyData[month],
            [field]: prev.monthlyData[month][field].filter(exp => exp.id !== expenseId),
          },
        },
      };
    });
  };

  const addIncome = (month: string, income: Income) => {
    setBudgetData(prev => ({
      ...prev,
      monthlyData: {
        ...prev.monthlyData,
        [month]: {
          ...prev.monthlyData[month],
          incomes: [...prev.monthlyData[month].incomes, income],
        },
      },
    }));
  };

  const updateIncome = (month: string, incomeId: string, updatedIncome: Income) => {
    setBudgetData(prev => ({
      ...prev,
      monthlyData: {
        ...prev.monthlyData,
        [month]: {
          ...prev.monthlyData[month],
          incomes: prev.monthlyData[month].incomes.map(inc =>
            inc.id === incomeId ? updatedIncome : inc
          ),
        },
      },
    }));
  };

  const deleteIncome = (month: string, incomeId: string) => {
    setBudgetData(prev => ({
      ...prev,
      monthlyData: {
        ...prev.monthlyData,
        [month]: {
          ...prev.monthlyData[month],
          incomes: prev.monthlyData[month].incomes.filter(inc => inc.id !== incomeId),
        },
      },
    }));
  };

  const updateMainTableCell = (row: number, col: number, value: string) => {
    setBudgetData(prev => {
      const newData = prev.mainTableData.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? value : c)) : r
      );
      return { ...prev, mainTableData: newData };
    });
  };

  const updateMainTableColumn = (colIndex: number, name: string) => {
    setBudgetData(prev => ({
      ...prev,
      mainTableColumns: prev.mainTableColumns.map((col, i) =>
        i === colIndex ? name : col
      ),
    }));
  };

  const addMainTableRow = () => {
    setBudgetData(prev => ({
      ...prev,
      mainTableData: [...prev.mainTableData, new Array(prev.mainTableColumns.length).fill('')],
    }));
  };

  const addMainTableColumn = (name: string) => {
    setBudgetData(prev => ({
      ...prev,
      mainTableColumns: [...prev.mainTableColumns, name],
      mainTableData: prev.mainTableData.map(row => [...row, '']),
    }));
  };

  const getAverageSpend = () => {
    const monthsWithData = Object.values(budgetData.monthlyData);
    const totalSpend = monthsWithData.reduce((sum, month) => {
      const fixedTotal = month.fixedExpenses.reduce((s, e) => s + e.amount, 0);
      const userTotal = month.userExpenses.reduce((s, e) => s + e.amount, 0);
      return sum + fixedTotal + userTotal;
    }, 0);
    return totalSpend / 12;
  };

  return (
    <BudgetContext.Provider
      value={{
        budgetData,
        updateGoal,
        updateMonthIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        updateMainTableCell,
        updateMainTableColumn,
        addMainTableRow,
        addMainTableColumn,
        getAverageSpend,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
