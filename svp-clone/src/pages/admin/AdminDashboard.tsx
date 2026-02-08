import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

interface Certificate {
    id: number;
    certificate_serial: string;
    passport_number: string;
    holder_name: string;
    issue_date: string;
    expiry_date: string;
    status: string;
}

interface LaborResult {
    id: number;
    passport_number: string;
    occupation_key: string;
    nationality_code: string;
    exam_date: string;
    score: number;
    result: string;
}

interface SupportTicket {
    id: number;
    name: string;
    email: string;
    subject: string;
    description: string;
    status: string;
    created_at: string;
}

interface Applicant {
    id: number;
    passport_number: string;
    first_name: string;
    last_name: string;
    nationality: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
}

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
}

type TabType = 'certificates' | 'labor' | 'support' | 'applicants' | 'users';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('certificates');
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [laborResults, setLaborResults] = useState<LaborResult[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            let endpoint = '';
            switch (activeTab) {
                case 'certificates': endpoint = '/certificates'; break;
                case 'labor': endpoint = '/labor-results'; break;
                case 'support': endpoint = '/support'; break;
                case 'applicants': endpoint = '/applicants'; break;
                case 'users': endpoint = '/users'; break;
            }

            const res = await fetch(`${API_BASE}${endpoint}`, { headers });
            const data = await res.json();

            switch (activeTab) {
                case 'certificates': setCertificates(data); break;
                case 'labor': setLaborResults(data); break;
                case 'support': setSupportTickets(data); break;
                case 'applicants': setApplicants(data); break;
                case 'users': setUsers(data); break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const handleDelete = async (type: string, id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await fetch(`${API_BASE}/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setEditingItem(null);
        setFormData(getEmptyForm());
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setModalMode('edit');
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const getEmptyForm = () => {
        switch (activeTab) {
            case 'certificates':
                return { certificate_serial: '', passport_number: '', holder_name: '', issue_date: '', expiry_date: '', status: 'Valid' };
            case 'labor':
                return { passport_number: '', occupation_key: '', nationality_code: '', exam_date: '', score: '', result: 'Passed' };
            case 'support':
                return { name: '', email: '', subject: '', description: '', status: 'Open' };
            case 'users':
                return { email: '', password: '', first_name: '', last_name: '', role: 'user' };
            default:
                return {};
        }
    };

    const handleSave = async () => {
        try {
            let endpoint = '';
            let body: any = {};

            switch (activeTab) {
                case 'certificates':
                    endpoint = '/certificates';
                    body = {
                        certificateSerial: formData.certificate_serial,
                        passportNumber: formData.passport_number,
                        holderName: formData.holder_name,
                        issueDate: formData.issue_date,
                        expiryDate: formData.expiry_date,
                        status: formData.status
                    };
                    break;
                case 'labor':
                    endpoint = '/labor-results';
                    body = {
                        passportNumber: formData.passport_number,
                        occupationKey: formData.occupation_key,
                        nationalityCode: formData.nationality_code,
                        examDate: formData.exam_date,
                        score: parseInt(formData.score),
                        result: formData.result
                    };
                    break;
                case 'support':
                    endpoint = '/support';
                    body = formData;
                    break;
                case 'users':
                    endpoint = '/users';
                    body = {
                        email: formData.email,
                        password: formData.password,
                        firstName: formData.first_name,
                        lastName: formData.last_name,
                        role: formData.role
                    };
                    break;
            }

            const url = modalMode === 'edit' ? `${API_BASE}${endpoint}/${editingItem.id}` : `${API_BASE}${endpoint}`;
            const method = modalMode === 'edit' ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const updateStatus = async (type: string, id: number, status: string) => {
        try {
            await fetch(`${API_BASE}/${type}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const tabs = [
        { id: 'certificates' as TabType, label: '📜 Certificates', count: certificates.length },
        { id: 'labor' as TabType, label: '👷 Labor Results', count: laborResults.length },
        { id: 'support' as TabType, label: '🎫 Support', count: supportTickets.length },
        { id: 'applicants' as TabType, label: '📋 Applicants', count: applicants.length },
        { id: 'users' as TabType, label: '👤 Users', count: users.length },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-[#0f172a] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-[#0f766e]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 10 12 6.16-1.26 10-6.45 10-12V7l-10-5z" />
                        </svg>
                        <span className="text-xl font-bold">SVP Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">Welcome, {user?.firstName || 'Admin'}</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-[#0f766e] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Action Bar */}
                {activeTab !== 'applicants' && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-[#0f766e] text-white rounded-lg hover:bg-[#0d6b63] transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Add New
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <svg className="animate-spin h-8 w-8 mx-auto text-[#0f766e]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="mt-2 text-gray-500">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* Certificates Table */}
                            {activeTab === 'certificates' && (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Passport</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Holder</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {certificates.map((cert) => (
                                            <tr key={cert.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cert.certificate_serial}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{cert.passport_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{cert.holder_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(cert.expiry_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${cert.status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {cert.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button onClick={() => openEditModal(cert)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete('certificates', cert.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {certificates.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No certificates found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Labor Results Table */}
                            {activeTab === 'labor' && (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Passport</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Occupation</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {laborResults.map((labor) => (
                                            <tr key={labor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{labor.passport_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{labor.occupation_key}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{labor.nationality_code}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{labor.score}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${labor.result === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {labor.result}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button onClick={() => openEditModal(labor)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete('labor-results', labor.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {laborResults.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No labor results found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Support Tickets Table */}
                            {activeTab === 'support' && (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {supportTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{ticket.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{ticket.subject}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={ticket.status}
                                                        onChange={(e) => updateStatus('support', ticket.id, e.target.value)}
                                                        className={`px-2 py-1 text-xs rounded-full border-0 ${ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-700' :
                                                                ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button onClick={() => openEditModal(ticket)} className="text-blue-500 hover:text-blue-700 text-sm">View</button>
                                                    <button onClick={() => handleDelete('support', ticket.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {supportTickets.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No support tickets found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Applicants Table */}
                            {activeTab === 'applicants' && (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Passport</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {applicants.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.passport_number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{app.first_name} {app.last_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{app.nationality}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{app.email}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => updateStatus('applicants/' + app.id + '/status', app.id, e.target.value)}
                                                        className={`px-2 py-1 text-xs rounded-full border-0 ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Reviewing">Reviewing</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(app.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button onClick={() => openEditModal(app)} className="text-blue-500 hover:text-blue-700 text-sm">View</button>
                                                    <button onClick={() => handleDelete('applicants', app.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {applicants.length === 0 && (
                                            <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No applicants found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {/* Users Table */}
                            {activeTab === 'users' && (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{u.first_name} {u.last_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button onClick={() => openEditModal(u)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                                    <button onClick={() => handleDelete('users', u.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">
                                {modalMode === 'create' ? 'Add New' : 'Edit'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Certificate Form */}
                            {activeTab === 'certificates' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Serial</label>
                                        <input type="text" value={formData.certificate_serial || ''} onChange={(e) => setFormData({ ...formData, certificate_serial: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                        <input type="text" value={formData.passport_number || ''} onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Holder Name</label>
                                        <input type="text" value={formData.holder_name || ''} onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                            <input type="date" value={formData.issue_date?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input type="date" value={formData.expiry_date?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={formData.status || 'Valid'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none">
                                            <option value="Valid">Valid</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Revoked">Revoked</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Labor Results Form */}
                            {activeTab === 'labor' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                        <input type="text" value={formData.passport_number || ''} onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupation Key</label>
                                        <input type="text" value={formData.occupation_key || ''} onChange={(e) => setFormData({ ...formData, occupation_key: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality Code</label>
                                        <input type="text" value={formData.nationality_code || ''} onChange={(e) => setFormData({ ...formData, nationality_code: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                                            <input type="date" value={formData.exam_date?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                            <input type="number" value={formData.score || ''} onChange={(e) => setFormData({ ...formData, score: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                                        <select value={formData.result || 'Passed'} onChange={(e) => setFormData({ ...formData, result: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none">
                                            <option value="Passed">Passed</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Support Ticket Form/View */}
                            {activeTab === 'support' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input type="text" value={formData.subject || ''} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea rows={4} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={formData.status || 'Open'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none">
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Applicant View */}
                            {activeTab === 'applicants' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Passport:</span>
                                        <span className="font-medium">{formData.passport_number}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium">{formData.first_name} {formData.last_name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Nationality:</span>
                                        <span className="font-medium">{formData.nationality}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium">{formData.phone}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${formData.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                formData.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>{formData.status}</span>
                                    </div>
                                </div>
                            )}

                            {/* Users Form */}
                            {activeTab === 'users' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                    </div>
                                    {modalMode === 'create' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <input type="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select value={formData.role || 'user'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0f766e] outline-none">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            {activeTab !== 'applicants' && (
                                <button onClick={handleSave} className="px-4 py-2 bg-[#0f766e] text-white rounded-lg hover:bg-[#0d6b63] transition-colors">
                                    {modalMode === 'create' ? 'Create' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
