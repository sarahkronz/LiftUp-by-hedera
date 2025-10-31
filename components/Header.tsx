import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import Notifications from './Notifications';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-navy-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/dashboard" className="text-2xl font-bold text-slate-200 cursor-pointer">
                LiftUP
                </Link>
                {user && (
                    <div className="flex items-center space-x-4">
                        <nav className="space-x-4">
                           <Link to="/dashboard" className="text-slate-300 hover:text-teal-400">Dashboard</Link>
                        </nav>
                        <Notifications />
                        <div className="flex items-center space-x-2">
                             <Link to="/profile" 
                                className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-navy-900 font-bold cursor-pointer"
                             >
                                {user.name.charAt(0)}
                             </Link>
                            <button onClick={logout} className="text-sm text-slate-400 hover:text-white">Logout</button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
