import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Activity, Trash2, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [allFiles, setAllFiles] = useState([]); // If we implemented Admin File View

    const pendingUsers = users.filter(u => u.status === 'PENDING');

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'requests') fetchUsers();
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'files') fetchAllFiles();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/logs');
            setLogs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Placeholder if we want extensive file management here, but reusing logic is better
    const fetchAllFiles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/files/all');
            setAllFiles(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to update role');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="flex items-center mb-8 bg-white p-4 rounded-lg shadow">
                <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </header>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users className="mr-2" size={18} /> Users
                    </button>
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <Activity className="mr-2" size={18} /> Audit Logs
                    </button>
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('files')}
                    >
                        <FileText className="mr-2" size={18} /> All Files
                    </button>
                    <button
                        className={`px-6 py-4 font-medium flex items-center ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <UserPlus className="mr-2" size={18} /> Requests
                        {pendingUsers.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                        <th className="p-3">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(userItem => (
                                        <tr key={userItem.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3">{userItem.name}</td>
                                            <td className="p-3">{userItem.email}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold
                                                    ${userItem.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                        userItem.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {userItem.role}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold
                                                    ${userItem.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        userItem.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {userItem.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="p-3 flex items-center space-x-2">
                                                <select
                                                    value={userItem.role}
                                                    onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                                    className="border rounded p-1 text-sm outline-none w-24"
                                                    disabled={userItem.id === user.id}
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="MANAGER">MANAGER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>

                                                {userItem.status !== 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(userItem.id, 'ACTIVE')}
                                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                                                        disabled={userItem.id === user.id}
                                                    >
                                                        Activate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusChange(userItem.id, 'SUSPENDED')}
                                                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                                                        disabled={userItem.id === user.id}
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleDeleteUser(userItem.id)}
                                                    className={`text-red-500 hover:text-red-700 p-1 ${userItem.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Delete User"
                                                    disabled={userItem.id === user.id}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                        <th className="p-3">Time</th>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Resource</th>
                                        <th className="p-3">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50 text-sm">
                                            <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="p-3">{log.User?.email || 'Unknown'}</td>
                                            <td className="p-3 font-medium">{log.action_type}</td>
                                            <td className="p-3">{log.File?.original_name || '-'}</td>
                                            <td className="p-3">{log.ip_address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                        <th className="p-3">Filename</th>
                                        <th className="p-3">Owner</th>
                                        <th className="p-3">Size</th>
                                        <th className="p-3">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allFiles.map(file => (
                                        <tr key={file.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="p-3">{file.original_name}</td>
                                            <td className="p-3">{file.owner?.email}</td>
                                            <td className="p-3">{(file.file_size / 1024).toFixed(2)} KB</td>
                                            <td className="p-3">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div>
                            {pendingUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pending user requests.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Requested Role (Default)</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.map(userItem => (
                                                <tr key={userItem.id} className="border-b last:border-0 hover:bg-gray-50">
                                                    <td className="p-3">{userItem.name}</td>
                                                    <td className="p-3">{userItem.email}</td>
                                                    <td className="p-3">
                                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                                                            {userItem.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleStatusChange(userItem.id, 'ACTIVE')}
                                                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(userItem.id)}
                                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
