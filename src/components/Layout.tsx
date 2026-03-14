import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Shield,
  Bot,
  History,
  FileSearch,
  Settings,
  Wallet,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Compliance', href: '/compliance', icon: Shield },
  { name: 'AI Agent', href: '/ai-agent', icon: Bot },
  { name: 'Audit Trail', href: '/audit-trail', icon: FileSearch },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userName = user?.name || 'User';
  const userInstitution = user?.institution || 'Institution';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="app-theme min-h-screen bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg">CompliPay AI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{userInstitution}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-[padding] duration-300 ${
          desktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((prev) => !prev)}
              className="hidden lg:inline-flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              title={desktopSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {desktopSidebarOpen ? (
                <ChevronsLeft className="w-5 h-5" />
              ) : (
                <ChevronsRight className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                Solana Testnet
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-sm text-slate-400">Block: 245,892,103</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {userInitials}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-[60]">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-slate-700" />
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
