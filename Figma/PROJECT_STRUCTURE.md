# Budget Planner Application - Project Structure Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Data Models](#data-models)
5. [State Management](#state-management)
6. [Component Hierarchy](#component-hierarchy)
7. [Routing Structure](#routing-structure)
8. [Key Features](#key-features)
9. [Styling System](#styling-system)
10. [Integration Guide](#integration-guide)
11. [Future Backend Considerations](#future-backend-considerations)

---

## Project Overview

The Budget Planner is a fully interactive, frontend-only financial planning application built with React, TypeScript, React Router, and Tailwind CSS. It features a vibrant, playful-yet-professional design with high contrast colors and bold typography.

### Core Functionality
- **Two-layer navigation**: Main Dashboard and Months view
- **Editable tables**: Double-click to edit any cell
- **Dynamic data management**: Add/remove rows, columns, expenses, and incomes
- **Real-time calculations**: Automatic totals and averages
- **Persistent state**: In-memory state management via Context API

---

## Architecture

### Technology Stack
- **React 18.3.1**: Component-based UI
- **TypeScript**: Type-safe development
- **React Router 7.13.0**: Client-side routing
- **Tailwind CSS 4.1.12**: Utility-first styling
- **Lucide React**: Icon library

### Design Pattern
- **Provider Pattern**: State management through React Context
- **Component Composition**: Reusable, single-responsibility components
- **Controlled Components**: Form inputs managed by React state

---

## Folder Structure

```
/src/app/
├── App.tsx                      # Root component with RouterProvider
├── routes.ts                    # Route configuration
├── components/
│   ├── layout.tsx              # Main layout with navigation tabs
│   ├── stat-card.tsx           # Reusable statistic card component
│   ├── editable-cell.tsx       # Double-click editable table cell
│   └── figma/
│       └── ImageWithFallback.tsx  # Image component with fallback
├── contexts/
│   └── budget-context.tsx      # Global state management
└── pages/
    ├── main-page.tsx           # Dashboard with overview table
    └── month-page.tsx          # Monthly detail view

/src/styles/
├── theme.css                   # CSS variables and base styles
└── fonts.css                   # Font imports
```

---

## Data Models

### Type Definitions

#### Expense Interface
```typescript
interface Expense {
  id: string;              // Unique identifier
  description: string;     // Expense name/description
  amount: number;          // Dollar amount
  category?: string;       // Optional category (Housing, Food, etc.)
  date?: string;          // Optional date string
}
```

#### Income Interface
```typescript
interface Income {
  id: string;              // Unique identifier
  description: string;     // Income source name
  amount: number;          // Dollar amount
  source?: string;         // Optional source (Employment, etc.)
  date?: string;          // Optional date string
}
```

#### MonthData Interface
```typescript
interface MonthData {
  income: number;                // Legacy total income field
  fixedExpenses: Expense[];      // Monthly recurring expenses
  userExpenses: Expense[];       // User-added one-time expenses
  incomes: Income[];             // Detailed income sources
}
```

#### BudgetData Interface
```typescript
interface BudgetData {
  goal: number;                              // Monthly spending goal
  monthlyData: Record<string, MonthData>;    // Data for all 12 months
  mainTableData: string[][];                 // Main dashboard table cells
  mainTableColumns: string[];                // Table column headers
}
```

---

## State Management

### Context API Structure

**Location**: `/src/app/contexts/budget-context.tsx`

The application uses a single centralized context for all state management:

#### Provider Component
```typescript
<BudgetProvider>
  {children}
</BudgetProvider>
```

#### Available Actions

| Action | Parameters | Description |
|--------|-----------|-------------|
| `updateGoal` | `goal: number` | Set monthly budget goal |
| `updateMonthIncome` | `month: string, income: number` | Update legacy income field |
| `addExpense` | `month, expense, type` | Add new expense (fixed or user) |
| `updateExpense` | `month, expenseId, updatedExpense, type` | Modify existing expense |
| `deleteExpense` | `month, expenseId, type` | Remove expense |
| `addIncome` | `month, income` | Add new income source |
| `updateIncome` | `month, incomeId, updatedIncome` | Modify existing income |
| `deleteIncome` | `month, incomeId` | Remove income source |
| `updateMainTableCell` | `row, col, value` | Edit main table cell |
| `updateMainTableColumn` | `colIndex, name` | Rename table column |
| `addMainTableRow` | none | Add row to main table |
| `addMainTableColumn` | `name: string` | Add column to main table |
| `getAverageSpend` | none | Calculate average monthly expenses |

#### Initial State

**12 Months**: January through December, each initialized with:
- 3 default fixed expenses (Rent, Utilities, Groceries)
- 1 default income (Salary)
- Empty user expenses array

**Main Table**: 12 rows × 7 columns
- Columns: Month, Income, Housing, Food, Transport, Entertainment, Other
- All data cells initialized as empty strings

---

## Component Hierarchy

### Page Components

#### 1. MainPage (`/src/app/pages/main-page.tsx`)
**Route**: `/`

**Features**:
- Average monthly spend card (auto-calculated)
- Goal setting card (double-click to edit)
- Budget overview table (12 months × customizable columns)
- Add row/column functionality
- Editable column headers (except first column)

**State Hooks Used**:
- `useState`: Goal input visibility, new column name input
- `useBudget`: All budget data and actions

#### 2. MonthPage (`/src/app/pages/month-page.tsx`)
**Route**: `/months`

**Features**:
- Month selector dropdown
- Three summary cards (Total Income, Total Expenses, Balance)
- Monthly Incomes table (green theme)
- Monthly Fixed Expenses table (teal theme)
- Additional Expenses table (pink theme)
- Add/edit/delete functionality for all tables

**State Hooks Used**:
- `useState`: Selected month
- `useBudget`: Month-specific data and actions

### Reusable Components

#### 1. Layout (`/src/app/components/layout.tsx`)
**Purpose**: Consistent navigation and page structure

**Features**:
- File-tab style navigation (Main Dashboard, Months)
- Active tab highlighting
- Gradient background
- Max-width content container

#### 2. StatCard (`/src/app/components/stat-card.tsx`)
**Purpose**: Display key metrics with consistent styling

**Props**:
```typescript
{
  title: string;              // Card header
  value: string | number;     // Main display value
  color: 'purple' | 'teal' | 'orange' | 'pink' | 'blue' | 'green';
  icon?: ReactNode;           // Optional icon (Lucide)
  editable?: boolean;         // Enable double-click editing
  onDoubleClick?: () => void; // Edit handler
  subtitle?: string;          // Helper text below value
}
```

**Color Themes**: Each color has corresponding border, background, and text colors for high contrast.

#### 3. EditableCell (`/src/app/components/editable-cell.tsx`)
**Purpose**: Table cell with inline editing

**Props**:
```typescript
{
  value: string;
  onSave: (value: string) => void;
  className?: string;
  type?: 'text' | 'number';
}
```

**Interaction Flow**:
1. Display mode: Shows value with hover effect
2. Double-click: Switches to input mode with autofocus
3. Save triggers: Blur, Enter key
4. Cancel: Escape key reverts changes

---

## Routing Structure

### Router Configuration
**Location**: `/src/app/routes.ts`

```typescript
createBrowserRouter([
  {
    path: '/',
    Component: Root (wraps MainPage)
  },
  {
    path: '/months',
    Component: Root (wraps MonthPage)
  },
  {
    path: '*',
    Component: NotFound (redirects to '/')
  }
])
```

### Root Wrapper
Wraps all routes with:
1. `BudgetProvider` (state management)
2. `Layout` (navigation and structure)

---

## Key Features

### 1. Interactive Tables
- **Double-click editing**: All data cells are editable in-place
- **Dynamic columns**: Add/rename columns in main table
- **Dynamic rows**: Add rows to main table
- **Row actions**: Delete button for expenses/incomes

### 2. Real-time Calculations
- **Average Monthly Spend**: Sum of all expenses ÷ 12
- **Total Income**: Sum of all income sources per month
- **Total Expenses**: Sum of fixed + user expenses per month
- **Balance**: Income - Expenses with color coding

### 3. Data Management
- **Add Operations**: Expenses, incomes, rows, columns
- **Update Operations**: All cells, column names, goal
- **Delete Operations**: Individual expenses/incomes
- **No data loss**: All edits saved immediately to context

### 4. Visual Design
- **Color System**:
  - Purple: Main branding, primary actions
  - Teal: Expenses, positive states
  - Orange: Goals, warnings
  - Pink: User additions
  - Green: Income
  - Blue: Navigation

- **Typography**: Bold headers (800), medium labels (700), normal text (400)
- **Borders**: 4px thick borders for high contrast
- **Shadows**: Consistent shadow-lg for depth

---

## Styling System

### Tailwind CSS v4.0
- **Utility-first approach**: Inline classes for all styling
- **Custom CSS variables**: Defined in `/src/styles/theme.css`
- **Responsive design**: Grid layouts adapt to screen size

### Theme Variables
```css
:root {
  --color-purple-*: Purple theme
  --color-teal-*: Teal theme
  --color-orange-*: Orange theme
  --color-pink-*: Pink theme
  --color-green-*: Green theme
  --color-blue-*: Blue theme
}
```

### Design Principles
1. **High Contrast**: 4px borders, bold colors
2. **Consistent Spacing**: p-6, p-8, gap-6 patterns
3. **Interactive Feedback**: Hover states, transitions
4. **Accessible**: Clear labels, focus states, semantic HTML

---

## Integration Guide

### Preparing for Fullstack Integration

#### 1. Backend API Requirements

**Endpoints Needed**:
```
GET    /api/budget                    # Fetch all budget data
POST   /api/budget                    # Create/update budget
GET    /api/budget/months/:month      # Fetch month data
POST   /api/budget/expenses           # Add expense
PUT    /api/budget/expenses/:id       # Update expense
DELETE /api/budget/expenses/:id       # Delete expense
POST   /api/budget/incomes            # Add income
PUT    /api/budget/incomes/:id        # Update income
DELETE /api/budget/incomes/:id        # Delete income
```

#### 2. Data Persistence Strategy

**Option A: RESTful API**
- Replace Context with React Query or SWR
- Add loading/error states
- Implement optimistic updates
- Add debouncing for edits

**Option B: GraphQL**
- Define schema for Budget, Expense, Income types
- Use Apollo Client or Urql
- Implement mutations for all CRUD operations
- Cache management

#### 3. Authentication Integration

**Add User Context**:
```typescript
interface User {
  id: string;
  email: string;
  budgetId?: string;
}
```

**Protected Routes**:
- Wrap routes with auth check
- Redirect to login if unauthenticated
- Associate budget data with user ID

#### 4. Migration Steps

**Step 1**: Keep existing structure, add API layer
```typescript
// services/budget-api.ts
export const budgetApi = {
  fetchBudget: async () => { /* ... */ },
  updateExpense: async (expense) => { /* ... */ },
  // ... other methods
};
```

**Step 2**: Replace Context actions with API calls
```typescript
const addExpense = async (month, expense, type) => {
  const result = await budgetApi.addExpense(month, expense, type);
  // Update local state with result
};
```

**Step 3**: Add loading states
```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**Step 4**: Implement error handling
```typescript
try {
  await budgetApi.updateExpense(/* ... */);
} catch (error) {
  toast.error('Failed to save changes');
}
```

---

## Future Backend Considerations

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Budgets Table
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id),
  month VARCHAR(20),
  description TEXT,
  amount DECIMAL(10, 2),
  category VARCHAR(100),
  type VARCHAR(20), -- 'fixed' or 'user'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Incomes Table
```sql
CREATE TABLE incomes (
  id UUID PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id),
  month VARCHAR(20),
  description TEXT,
  amount DECIMAL(10, 2),
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### TableData Table
```sql
CREATE TABLE table_data (
  id UUID PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id),
  columns JSONB, -- Array of column names
  rows JSONB,    -- 2D array of cell values
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Architecture Recommendations

#### 1. RESTful Approach
- **Pros**: Simple, cacheable, well-understood
- **Cons**: Multiple requests for complex operations

#### 2. GraphQL Approach
- **Pros**: Single endpoint, flexible queries, type-safe
- **Cons**: More complex setup, caching challenges

#### 3. Real-time Considerations
- **WebSocket**: For collaborative editing (multiple users)
- **Server-Sent Events**: For live budget updates
- **Polling**: Simple fallback for periodic updates

### Security Considerations

1. **Authentication**: JWT tokens or session-based
2. **Authorization**: Users can only access their own budgets
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent abuse of API endpoints
5. **HTTPS Only**: Encrypt all data in transit

### Performance Optimizations

1. **Pagination**: For large expense/income lists
2. **Lazy Loading**: Load month data on-demand
3. **Caching**: Redis for frequently accessed data
4. **Indexing**: Database indexes on user_id, month fields
5. **Compression**: Gzip response data

---

## File Checklist for Migration

### Files to Keep As-Is
- ✅ `/src/app/components/layout.tsx`
- ✅ `/src/app/components/stat-card.tsx`
- ✅ `/src/app/components/editable-cell.tsx`
- ✅ `/src/app/routes.ts` (may need auth guards)

### Files to Modify
- 🔄 `/src/app/contexts/budget-context.tsx` → Add API calls
- 🔄 `/src/app/pages/main-page.tsx` → Add loading states
- 🔄 `/src/app/pages/month-page.tsx` → Add loading states
- 🔄 `/src/app/App.tsx` → Add auth provider

### Files to Add
- ➕ `/src/services/budget-api.ts` → API client
- ➕ `/src/contexts/auth-context.tsx` → Auth management
- ➕ `/src/hooks/use-budget.ts` → Custom data fetching hook
- ➕ `/src/utils/validators.ts` → Input validation
- ➕ `/src/types/api.ts` → API response types

---

## Development Notes

### Current State
- **100% Frontend**: All data stored in memory (React Context)
- **No Persistence**: Data lost on page refresh
- **Single User**: No multi-user support
- **No Backend**: Pure client-side application

### Known Limitations
1. Data lost on refresh/close
2. No data validation beyond TypeScript types
3. No undo/redo functionality
4. No data export/import
5. No budget comparison or analytics

### Recommended Next Steps
1. Implement local storage persistence
2. Add data export (CSV/JSON)
3. Create backend API
4. Add user authentication
5. Implement data sync
6. Add analytics dashboard
7. Mobile app version

---

## Testing Recommendations

### Unit Tests
- Context actions (add, update, delete)
- Calculation functions (averages, totals)
- Component rendering

### Integration Tests
- Full user flows (add expense → see updated total)
- Navigation between pages
- Table editing workflows

### E2E Tests
- Complete budget creation
- Multi-month data entry
- Goal setting and tracking

---

## Conclusion

This Budget Planner is architected as a modern, type-safe React application with clear separation of concerns. The modular structure allows for easy integration into a fullstack project by adding an API layer while keeping the existing UI components largely unchanged.

The Context-based state management can be seamlessly replaced with server-side data fetching using React Query, SWR, or similar libraries without major refactoring of the component tree.

**Ready for Backend Integration**: ✅
**Production Ready (Frontend)**: ✅
**Scalable Architecture**: ✅
