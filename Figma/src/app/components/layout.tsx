import { Link, useLocation } from 'react-router';
import { FileText, Calendar } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isMonthsPage = location.pathname.startsWith('/months');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50">
      {/* Header with File Tabs */}
      <div className="bg-white border-b-4 border-purple-400 shadow-lg">
        <div className="px-8 py-4">
          <h1 className="text-4xl text-purple-900 mb-4" style={{ fontWeight: 900 }}>
            💰 Budget Planner
          </h1>
          
          {/* File Tabs */}
          <div className="flex gap-2 pb-2">
            <Link
              to="/"
              className={`px-6 py-3 rounded-t-xl border-4 border-b-0 flex items-center gap-2 transition-all ${
                isMainPage
                  ? 'bg-purple-400 text-white border-purple-400'
                  : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-50'
              }`}
              style={{ fontWeight: 700 }}
            >
              <FileText size={20} />
              Main Dashboard
            </Link>
            
            <Link
              to="/months"
              className={`px-6 py-3 rounded-t-xl border-4 border-b-0 flex items-center gap-2 transition-all ${
                isMonthsPage
                  ? 'bg-teal-400 text-white border-teal-400'
                  : 'bg-white text-teal-900 border-teal-300 hover:bg-teal-50'
              }`}
              style={{ fontWeight: 700 }}
            >
              <Calendar size={20} />
              Months
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
}