import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings,
    Search, Bell, Plus, MoreVertical, Edit2, Trash2, Filter,
    X, Check, ChevronDown, Mail, Phone, Globe, CreditCard, ArrowLeft, Menu, ShieldX, LogIn
} from 'lucide-react';
import { api } from './api';
import { useAuth } from './contexts/AuthContext';

// --- INITIAL STATE ---
// We keep initial structure but now rely heavily on API data

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ScentsmithsAdmin() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [dashboardStats, setDashboardStats] = useState({ totalSales: '0', totalOrders: 0, totalCustomers: 0, avgOrder: '0' });
    const [adminNotifications, setAdminNotifications] = useState<any[]>([]);

    // UI State
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Modals
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);
    const [viewingCustomer, setViewingCustomer] = useState<any>(null); // Viewing profile
    const [editingCustomer, setEditingCustomer] = useState<any>(null); // Editing profile

    // --- REAL-TIME POLLING ---
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') return;

        let intervalId: any;
        let previousTotalOrders = 0;

        // Initial fetch
        const fetchData = async () => {
            try {
                const [productsData, ordersData, customersData, statsData] = await Promise.all([
                    api.get('/api/products'),
                    api.get('/api/admin/orders'),
                    api.get('/api/admin/customers'),
                    api.get('/api/admin/stats')
                ]);

                setProducts(productsData);
                setOrders(ordersData);
                setCustomers(customersData);
                setDashboardStats(statsData);
                previousTotalOrders = statsData.totalOrders;
            } catch (e) { console.error("Admin data fetch failed", e); }
        };

        fetchData();

        // Poll every 30 seconds
        intervalId = setInterval(async () => {
            try {
                const stats = await api.get('/api/admin/stats');

                // If new orders arrived
                if (stats.totalOrders > previousTotalOrders) {
                    const diff = stats.totalOrders - previousTotalOrders;
                    previousTotalOrders = stats.totalOrders;

                    // 1. Play Sound
                    const audio = new Audio('/notification.mp3'); // Ensure this file exists in /public or use base64
                    audio.play().catch(e => console.warn("Audio play failed (user interaction needed first)", e));

                    // 2. Show Toast (using simple alert for now if ToastContext isn't available here, but we should import it)
                    // Since we are inside ScentsmithsAdmin, let's assume we can use a local state or just refresh data
                    setDashboardStats(stats);

                    // Refresh orders list silently
                    const newOrders = await api.get('/api/admin/orders');
                    setOrders(newOrders);

                    // Add to notifications
                    setAdminNotifications(prev => [{
                        id: Date.now(),
                        title: 'New Order Received',
                        message: `${diff} new order(s) placed just now.`,
                        type: 'order',
                        created_at: new Date().toISOString(),
                        is_read: false
                    }, ...prev]);

                    // Update Notification Badge
                    setShowNotifications(true);
                }
            } catch (e) { console.warn("Polling failed", e); }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, user]);

    // --- ACTIONS ---

    const deleteProduct = (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
            api.delete(`/api/products/${id}`).catch(() => { });
        }
    };

    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const productData = {
            name: formData.get('name') as string,
            brand: formData.get('brand') as string || '',
            category: formData.get('category') as string,
            image_url: formData.get('image_url') as string || '',
            price: parseFloat(formData.get('price_50ml') as string),
            price_50ml: parseFloat(formData.get('price_50ml') as string) || 0,
            price_100ml: parseFloat(formData.get('price_100ml') as string) || 0,
            stock: parseInt(formData.get('stock_50ml') as string),
            stock_50ml: parseInt(formData.get('stock_50ml') as string) || 0,
            stock_100ml: parseInt(formData.get('stock_100ml') as string) || 0,
        };

        try {
            if (editingProduct === 'new') {
                const created = await api.post('/api/products', productData);
                setProducts([...products, created]);
            } else {
                const updated = await api.put(`/api/products/${editingProduct.id}`, productData);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
            }
        } catch (err: any) {
            alert("Failed to save product: " + err.message);
        }
        setEditingProduct(null);
    };

    const saveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string
        };

        try {
            const updated = await api.put(`/api/admin/users/${editingCustomer.id}`, updates);
            setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...updated } : c));
            alert("User updated successfully");
            setEditingCustomer(null);
        } catch (err: any) {
            alert("Failed to update user: " + err.message);
        }
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (viewingOrder && viewingOrder.id === id) setViewingOrder({ ...viewingOrder, status: newStatus });
        try {
            await api.patch(`/api/admin/orders/${id}/status`, { status: newStatus });
        } catch { /* local state already updated */ }
    };

    const toggleUserRole = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        try {
            await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            setCustomers(customers.map(c => c.id === userId ? { ...c, role: newRole } : c));
        } catch (err: any) {
            alert(err?.message || 'Failed to update role');
        }
    };

    const handleSettingsSave = () => {
        alert("Store settings saved (simulated).");
    };

    // --- RENDER HELPERS ---

    if (isLoading) return <div className="p-20 text-center">Loading Admin Panel...</div>;
    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldX size={32} className="text-[#961E20]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-8">This page is restricted to administrators only.</p>
                    <a href="/" className="inline-block bg-gray-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Back to Store</a>
                </div>
            </div>
        );
    }

    const tabTitle: Record<string, string> = {
        dashboard: 'Dashboard Overview',
        products: 'Product Inventory',
        orders: 'Orders Management',
        customers: 'Customer Base',
        notifications: 'All Notifications',
        settings: 'Settings',
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Header */}
            <header className="bg-[#1A1A1A] text-white sticky top-0 z-30">
                <div className="flex items-center justify-between px-4 lg:px-8 h-14">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <span className="font-serif tracking-widest font-bold text-sm">SCENTSMITHS</span>
                        </a>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                            <Bell size={18} className="text-gray-400 hover:text-white" />
                            {adminNotifications.some(n => !n.is_read) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
                        </button>
                        {showNotifications && (
                            <div className="absolute top-12 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-gray-800">
                                <div className="p-3 border-b border-gray-100 font-bold text-sm bg-gray-50">Notifications</div>
                                <div className="max-h-64 overflow-y-auto">
                                    {adminNotifications.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                                    ) : (
                                        adminNotifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${n.is_read ? 'opacity-60' : 'bg-red-50/30'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${n.type === 'stock' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{n.type}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <a href="/" className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><ArrowLeft size={12} /> Store</a>
                    </div>
                </div>
                {/* Tabs */}
                <nav className="border-t border-gray-800 overflow-x-auto no-scrollbar">
                    <div className="flex px-4 lg:px-8 min-w-max">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'text-white border-[#961E20]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                                    <Icon size={16} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </header>

            <main className="p-4 lg:p-8 max-w-7xl mx-auto">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">{tabTitle[activeTab]}</h2>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Sales" value={`$${dashboardStats.totalSales}`} change="" />
                            <StatCard title="Total Orders" value={String(dashboardStats.totalOrders)} change="" />
                            <StatCard title="Customers" value={String(dashboardStats.totalCustomers)} change="" />
                            <StatCard title="Avg. Order" value={`$${dashboardStats.avgOrder}`} change="" />
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold">Inventory</h3>
                            <button onClick={() => setEditingProduct('new')} className="bg-[#961E20] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Plus size={16} /> Add Perfume
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Stock (50/100)</th>
                                        <th className="px-6 py-4">Price (50/100)</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold">{p.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={p.stock_50ml < 10 ? 'text-red-500' : 'text-green-600'}>{p.stock_50ml}</span> /
                                                <span className={p.stock_100ml < 10 ? 'text-red-500' : 'text-green-600'}> {p.stock_100ml}</span>
                                            </td>
                                            <td className="px-6 py-4">${p.price_50ml} / ${p.price_100ml}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => setEditingProduct(p)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={16} /></button>
                                                <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-gray-100 rounded text-red-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100"><h3 className="font-bold">Recent Orders</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map(o => (
                                        <tr key={o.id} onClick={() => setViewingOrder(o)} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 text-[#961E20] font-medium truncate max-w-[100px]">{o.id}</td>
                                            <td className="px-6 py-4 font-bold">{o.users?.name || o.users?.email || 'Guest'}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">${Number(o.total).toFixed(2)}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100"><h3 className="font-bold">Customers</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Spent</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold">{c.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{c.email}</td>
                                            <td className="px-6 py-4 font-bold text-[#961E20]">{c.spent}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleUserRole(c.id, c.role)} className={`px-2 py-1 rounded text-xs font-bold ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{c.role}</button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setEditingCustomer(c)} className="text-gray-500 hover:text-black font-bold text-xs underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold mb-4">Admin Settings</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSettingsSave(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Currency</label>
                                <select className="w-full border rounded p-2"><option>USD ($)</option><option>PHP (₱)</option></select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Passcode</label>
                                <input type="password" placeholder="Change admin password" className="w-full border rounded p-2" />
                            </div>
                            <button className="bg-[#961E20] text-white px-6 py-2 rounded font-bold">Save Changes</button>
                        </form>
                    </div>
                )}
            </main>

            {/* ====== MODALS ====== */}

            {/* PRODUCT EDIT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Edit Product</h3><button onClick={() => setEditingProduct(null)}><X /></button></div>
                        <form onSubmit={saveProduct} className="space-y-3">
                            <input name="name" required placeholder="Name" defaultValue={editingProduct.name} className="w-full border p-2 rounded" />
                            <div className="flex gap-2">
                                <input name="price_50ml" type="number" step="0.01" placeholder="Price 50ml" defaultValue={editingProduct.price_50ml} className="w-1/2 border p-2 rounded" />
                                <input name="price_100ml" type="number" step="0.01" placeholder="Price 100ml" defaultValue={editingProduct.price_100ml} className="w-1/2 border p-2 rounded" />
                            </div>
                            <div className="flex gap-2">
                                <input name="stock_50ml" type="number" placeholder="Stock 50ml" defaultValue={editingProduct.stock_50ml} className="w-1/2 border p-2 rounded" />
                                <input name="stock_100ml" type="number" placeholder="Stock 100ml" defaultValue={editingProduct.stock_100ml} className="w-1/2 border p-2 rounded" />
                            </div>
                            <input name="category" placeholder="Category" defaultValue={editingProduct.category} className="w-full border p-2 rounded" />
                            <input name="image_url" placeholder="Image URL" defaultValue={editingProduct.image_url} className="w-full border p-2 rounded" />
                            <button className="w-full bg-[#961E20] text-white py-3 rounded font-bold mt-2">Save</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
                    <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto animate-slide-left">
                        <div className="flex justify-between mb-6"><h3 className="font-bold text-xl">Order Details</h3><button onClick={() => setViewingOrder(null)}><X /></button></div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-4">
                            <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                            <p className="font-bold text-lg">{viewingOrder.users?.name || viewingOrder.users?.email || 'Global Guest'}</p>
                            <p className="text-sm text-gray-500">{viewingOrder.users?.email}</p>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Items</p>
                            <div className="space-y-2">
                                {viewingOrder.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.size_ml}ml</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${item.price}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between border-t pt-4">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-[#961E20]">${Number(viewingOrder.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT USER MODAL */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Edit User</h3><button onClick={() => setEditingCustomer(null)}><X /></button></div>
                        <form onSubmit={saveCustomer} className="space-y-3">
                            <input name="name" placeholder="Name" defaultValue={editingCustomer.name} className="w-full border p-2 rounded" />
                            <input name="email" placeholder="Email" defaultValue={editingCustomer.email} className="w-full border p-2 rounded" />
                            <input name="phone" placeholder="Phone" defaultValue={editingCustomer.phone || ''} className="w-full border p-2 rounded" />
                            <button className="w-full bg-[#961E20] text-white py-3 rounded font-bold mt-2">Update User</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, change }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {change && <span className="text-xs text-green-600 font-bold bg-green-50 px-1 rounded">{change}</span>}
        </div>
    );
}