import { createBrowserRouter, Navigate } from 'react-router';
import { MainPage } from './pages/main-page';
import { MonthPage } from './pages/month-page';
import { Layout } from './components/layout';
import { BudgetProvider } from './contexts/budget-context';
import React from 'react';

const Root = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    BudgetProvider,
    null,
    React.createElement(Layout, null, children)
  );
};

const NotFound = () => {
  return React.createElement(Navigate, { to: '/', replace: true });
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: () => React.createElement(Root, null, React.createElement(MainPage)),
  },
  {
    path: '/months',
    Component: () => React.createElement(Root, null, React.createElement(MonthPage)),
  },
  {
    path: '*',
    Component: NotFound,
  },
]);