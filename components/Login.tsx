
import React, { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded credential check for demo purposes
        if (username === 'admin' && password === '123456') {
            onLogin();
        } else {
            setError('Username atau Password salah!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-t-4 border-blue-600">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700">LunasKas</h1>
                    <p className="text-gray-500">Sistem Kasir & Pembukuan</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="••••••"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200 transform active:scale-95 shadow-md"
                    >
                        Masuk
                    </button>
                </form>
                
                <div className="mt-6 text-center p-4 bg-blue-50 rounded text-sm text-blue-800">
                    <p className="font-bold mb-1">Demo Credentials:</p>
                    <p>Username: <strong>admin</strong></p>
                    <p>Password: <strong>123456</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
