import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UploadComponent from '../components/UploadComponent';
import { Download, Trash2, Share2, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('READ');
    const [shareMessage, setShareMessage] = useState('');
    const navigate = useNavigate();

    const fetchFiles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/files/my-files');
            setFiles(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files/download/${fileId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert('Failed to download file. You might not have permission.');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/files/${fileId}`);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (error) {
            alert('Failed to delete file.');
        }
    };

    const openShareModal = (fileId) => {
        setSelectedFileId(fileId);
        setShareModalOpen(true);
        setShareMessage('');
    };

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/files/share/${selectedFileId}`, {
                email: shareEmail,
                permission_type: sharePermission
            });
            setShareMessage('File shared successfully!');
            setTimeout(() => {
                setShareModalOpen(false);
                setShareEmail('');
            }, 1500);
        } catch (error) {
            setShareMessage(error.response?.data?.message || 'Failed to share file');
        }
    };

    const canUpload = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Secure File Storage</h1>
                    <p className="text-gray-500">Welcome, {user?.name} ({user?.role})</p>
                </div>
                <div className="flex gap-4">
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            <Shield className="mr-1" size={18} /> Admin Panel
                        </button>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center text-red-600 hover:text-red-800 font-medium"
                    >
                        <LogOut className="mr-1" size={18} /> Logout
                    </button>
                </div>
            </header>

            {canUpload && <UploadComponent onUploadSuccess={fetchFiles} />}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-700">My Files & Shared Files</h2>
                </div>
                {loading ? (
                    <div className="p-4">Loading...</div>
                ) : files.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No files found. Upload one to get started!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                    <th className="p-4 border-b">Filename</th>
                                    <th className="p-4 border-b">Size</th>
                                    <th className="p-4 border-b">Type</th>
                                    <th className="p-4 border-b">Uploaded At</th>
                                    <th className="p-4 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-4">{file.original_name}</td>
                                        <td className="p-4">{(file.file_size / 1024).toFixed(2)} KB</td>
                                        <td className="p-4">{file.file_type}</td>
                                        <td className="p-4">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => handleDownload(file.id, file.original_name)}
                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {/* Only Owner can Share/Delete */}
                                            {file.owner_id === user.id && (
                                                <>
                                                    <button
                                                        onClick={() => openShareModal(file.id)}
                                                        className="text-green-500 hover:text-green-700 p-1"
                                                        title="Share"
                                                    >
                                                        <Share2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(file.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {shareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Share File</h3>
                        {shareMessage && <div className="mb-2 text-sm text-blue-600">{shareMessage}</div>}
                        <form onSubmit={handleShare}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                                <input
                                    type="email"
                                    className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                                <select
                                    className="w-full border rounded p-2 outline-none"
                                    value={sharePermission}
                                    onChange={(e) => setSharePermission(e.target.value)}
                                >
                                    <option value="READ">View Only (Metadata)</option>
                                    <option value="DOWNLOAD">Download</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShareModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Share
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
