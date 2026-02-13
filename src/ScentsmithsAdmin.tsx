import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings,
    Search, Bell, Plus, MoreVertical, Edit2, Trash2, Filter,
    X, Check, ChevronDown, Mail, Phone, Globe, CreditCard, ArrowLeft, Menu, ShieldX, LogIn
} from 'lucide-react';
import { api } from './api';
import { useAuth } from './contexts/AuthContext';

// --- MOCK DATA (fallback when API unavailable) ---
const INITIAL_ORDERS = [
    { id: '#ORD-2931', customer: 'Nateman', date: 'Jan 24, 2026', total: '$453.00', status: 'Pending', items: ['Rose Goldea (50ml)', 'Happy Hour (50ml)'], address: '6720 Main Street, New York' },
    { id: '#ORD-2930', customer: 'Sarah L.', date: 'Jan 23, 2026', total: '$120.50', status: 'Shipped', items: ['Idôle Nectar (50ml)'], address: '123 Pine Road, CA' },
    { id: '#ORD-2929', customer: 'Mike R.', date: 'Jan 23, 2026', total: '$310.00', status: 'Delivered', items: ['Santal 33 (100ml)'], address: '456 Oak Lane, TX' },
];

const INITIAL_PRODUCTS = [
    { id: 1, name: "BVLGARI Rose Goldea", stock: 45, price: 229.00, price_50ml: 229.00, price_100ml: 366.40, stock_50ml: 45, stock_100ml: 30, category: 'Best Seller' },
    { id: 2, name: "Le Labo Santal 33", stock: 12, price: 310.00, price_50ml: 310.00, price_100ml: 496.00, stock_50ml: 12, stock_100ml: 8, category: 'Luxury' },
    { id: 3, name: "Gucci Bloom", stock: 28, price: 155.00, price_50ml: 155.00, price_100ml: 248.00, stock_50ml: 28, stock_100ml: 20, category: 'Just Arrived' },
    { id: 4, name: "Tom Ford Black Orchid", stock: 5, price: 295.00, price_50ml: 295.00, price_100ml: 472.00, stock_50ml: 5, stock_100ml: 3, category: 'Luxury' },
];

const INITIAL_CUSTOMERS = [
    { id: 1, name: "Nateman", email: "nate@example.com", orders: 12, spent: "$1,240", joined: "Jan 12, 2025", role: 'customer' as string },
    { id: 2, name: "Sarah L.", email: "sarah@example.com", orders: 3, spent: "$320", joined: "Mar 04, 2025", role: 'customer' as string },
    { id: 3, name: "Mike R.", email: "mike@example.com", orders: 8, spent: "$980", joined: "Dec 10, 2024", role: 'customer' as string },
];

const MOCK_NOTIFICATIONS = [
    { id: 1, text: "New order #ORD-2932 placed by John Doe", type: "order", time: "5m ago", read: false },
    { id: 2, text: "Low stock alert: Tom Ford Black Orchid (5 left)", type: "alert", time: "1h ago", read: false },
    { id: 3, text: "New customer registered: Emily Clark", type: "user", time: "2h ago", read: false },
];

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

    // --- AUTH GATE ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-[#961E20] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LogIn size={32} className="text-[#961E20]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h1>
                    <p className="text-gray-500 mb-8">You need to be logged in as an administrator to access this page.</p>
                    <a href="/" className="inline-block bg-[#961E20] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#7a181a] transition-colors">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldX size={32} className="text-[#961E20]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-2">This page is restricted to administrators only.</p>
                    <p className="text-xs text-gray-400 mb-8">Logged in as <strong>{user?.email}</strong> ({user?.role || 'customer'})</p>
                    <a href="/" className="inline-block bg-gray-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-colors">
                        Back to Store
                    </a>
                </div>
            </div>
        );
    }
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

    // UI State
    const [showNotifications, setShowNotifications] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);
    const [viewingCustomer, setViewingCustomer] = useState<any>(null);
    const [adminNotifications, setAdminNotifications] = useState(MOCK_NOTIFICATIONS);
    const [dashboardStats, setDashboardStats] = useState({ totalSales: '24,500', totalOrders: 156, totalCustomers: 89, avgOrder: '157.05' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // --- API DATA FETCHING ---
    useEffect(() => {
        api.get('/api/products').then(data => { if (data?.length) setProducts(data); }).catch(() => { });
        api.get('/api/admin/orders').then(data => { if (data?.length) setOrders(data); }).catch(() => { });
        api.get('/api/admin/customers').then(data => { if (data?.length) setCustomers(data); }).catch(() => { });
        api.get('/api/admin/stats').then(data => { if (data) setDashboardStats(data); }).catch(() => { });
    }, []);

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
        } catch {
            const newProd = { id: editingProduct?.id || Date.now(), ...productData };
            if (editingProduct === 'new') {
                setProducts([...products, newProd]);
            } else {
                setProducts(products.map(p => p.id === newProd.id ? newProd : p));
            }
        }
        setEditingProduct(null);
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (viewingOrder && viewingOrder.id === id) setViewingOrder({ ...viewingOrder, status: newStatus });
        try {
            await api.patch(`/api/admin/orders/${id}`, { status: newStatus });
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
            {/* ===== TOP HEADER BAR ===== */}
            <header className="bg-[#1A1A1A] text-white sticky top-0 z-30">
                {/* Top row: Logo + search + notifications */}
                <div className="flex items-center justify-between px-4 lg:px-8 h-14">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img src="/logo-white.png" alt="Scentsmiths Admin" className="h-8 w-auto object-contain" />
                            <span className="font-serif tracking-widest font-bold text-sm hidden sm:inline">SCENTSMITHS</span>
                        </a>
                        <span className="text-gray-500 hidden sm:inline">|</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">Admin Panel</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 bg-gray-800 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-[#961E20] w-48 placeholder-gray-500" />
                        </div>

                        <div className="relative">
                            <button
                                className="p-1.5 relative hover:bg-gray-800 rounded-full transition-colors"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={18} className="text-gray-400" />
                                {adminNotifications.some(n => !n.read) && (
                                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-gray-800">
                                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <span className="text-sm font-bold">Notifications</span>
                                        <button onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }} className="text-xs text-[#961E20] font-bold hover:underline">View All</button>
                                    </div>
                                    {adminNotifications.slice(0, 3).map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                setShowNotifications(false);
                                                if (n.type === 'order') {
                                                    const order = orders.find(o => n.text.includes(o.id.replace('#', '')));
                                                    if (order) { setViewingOrder(order); setActiveTab('orders'); }
                                                } else if (n.type === 'user') setActiveTab('customers');
                                                else if (n.type === 'alert') setActiveTab('products');
                                            }}
                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <p className="text-sm text-gray-800">{n.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <a href="/" className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:flex items-center gap-1">
                            <ArrowLeft size={12} /> Store
                        </a>
                    </div>
                </div>

                {/* Navigation tabs row */}
                <nav className="border-t border-gray-800">
                    {/* Desktop: horizontal tabs */}
                    <div className="hidden md:flex px-4 lg:px-8">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'text-white border-[#961E20]'
                                        : 'text-gray-500 border-transparent hover:text-gray-300'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile: current tab + hamburger */}
                    <div className="md:hidden flex items-center justify-between px-4 py-2">
                        <span className="text-sm font-bold">{tabTitle[activeTab]}</span>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Mobile dropdown menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-gray-900 border-t border-gray-800 pb-2">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${activeTab === tab.id ? 'text-white bg-[#961E20]/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                            <a href="/" className="w-full flex items-center gap-3 px-6 py-3 text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors border-t border-gray-800 mt-1">
                                <ArrowLeft size={16} /> Back to Store
                            </a>
                        </div>
                    )}
                </nav>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="p-4 lg:p-8 max-w-7xl mx-auto">
                {/* Page title */}
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">{tabTitle[activeTab]}</h2>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <StatCard title="Total Sales" value={`$${dashboardStats.totalSales}`} change="+12%" />
                            <StatCard title="Total Orders" value={String(dashboardStats.totalOrders)} change="+5%" />
                            <StatCard title="Customers" value={String(dashboardStats.totalCustomers)} change="+3%" />
                            <StatCard title="Avg. Order" value={`$${dashboardStats.avgOrder}`} change="+8%" />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} onClick={() => { setViewingOrder(o); setActiveTab('orders'); }} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{o.id} — {o.customer}</p>
                                            <p className="text-xs text-gray-400">{o.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{o.total}</p>
                                            <StatusBadge status={o.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                        <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Product Inventory</h3>
                            <button
                                onClick={() => setEditingProduct('new')}
                                className="bg-[#961E20] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#7a181a]"
                            >
                                <Plus size={16} /> Add Perfume
                            </button>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {products.map(product => (
                                <div key={product.id} className="border border-gray-100 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">{product.name}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{product.category}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setEditingProduct(product)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                                            <button onClick={() => deleteProduct(product.id)} className="p-1.5 hover:bg-gray-100 rounded text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <span className="text-gray-400">50ml</span>
                                            <p className="font-bold text-gray-800">${(product.price_50ml || product.price).toFixed(2)}</p>
                                            <span className={`font-bold ${(product.stock_50ml || product.stock) < 20 ? 'text-red-600' : 'text-green-600'}`}>
                                                Stock: {product.stock_50ml || product.stock}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <span className="text-gray-400">100ml</span>
                                            <p className="font-bold text-gray-800">${(product.price_100ml || 0).toFixed(2)}</p>
                                            <span className={`font-bold ${(product.stock_100ml || 0) < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                Stock: {product.stock_100ml || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Product Name</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">50ml</th>
                                        <th className="px-6 py-4 font-medium">100ml</th>
                                        <th className="px-6 py-4 font-medium">Stock</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{product.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">${(product.price_50ml || product.price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-600">${(product.price_100ml || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(product.stock_50ml || product.stock || 0) < 20 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                                        50ml: {product.stock_50ml || product.stock || 0}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${(product.stock_100ml || 0) < 10 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                                        100ml: {product.stock_100ml || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setEditingProduct(product)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={16} /></button>
                                                    <button onClick={() => deleteProduct(product.id)} className="p-1 hover:bg-gray-100 rounded text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                        <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Orders Management</h3>
                            <button className="text-gray-500 hover:text-gray-900"><Filter size={20} /></button>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {orders.map(order => (
                                <div key={order.id} onClick={() => setViewingOrder(order)} className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-[#961E20]">{order.id}</p>
                                            <p className="text-sm text-gray-600">{order.customer}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>{order.date}</span>
                                        <span className="font-bold text-gray-900">{order.total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Order ID</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Total</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map(order => (
                                        <tr key={order.id} onClick={() => setViewingOrder(order)} className="hover:bg-gray-50/50 cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-[#961E20]">{order.id}</td>
                                            <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                                            <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{order.total}</td>
                                            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                        <div className="p-4 lg:p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Customer Base</h3>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {customers.map(c => (
                                <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">{c.name}</p>
                                            <p className="text-xs text-gray-400">{c.email}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleUserRole(c.id, c.role || 'customer')}
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {c.role || 'customer'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>{c.orders} orders</span>
                                        <span className="font-bold text-[#961E20]">{c.spent}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Joined</th>
                                        <th className="px-6 py-4 font-medium">Orders</th>
                                        <th className="px-6 py-4 font-medium">Spent</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map(c => (
                                        <tr key={c.id} onClick={() => setViewingCustomer(c)} className="hover:bg-gray-50/50 cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{c.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{c.joined}</td>
                                            <td className="px-6 py-4 font-medium">{c.orders}</td>
                                            <td className="px-6 py-4 font-bold text-[#961E20]">{c.spent}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleUserRole(c.id, c.role || 'customer'); }}
                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${c.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {c.role || 'customer'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 animate-fade-in max-w-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800">All Notifications</h3>
                            <button
                                onClick={() => setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                className="text-xs text-[#961E20] font-bold hover:underline"
                            >Mark all as read</button>
                        </div>
                        <div className="space-y-3">
                            {adminNotifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        setAdminNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                                        if (n.type === 'order') {
                                            const order = orders.find(o => n.text.includes(o.id.replace('#', '')));
                                            if (order) { setViewingOrder(order); setActiveTab('orders'); }
                                        } else if (n.type === 'user') setActiveTab('customers');
                                        else if (n.type === 'alert') setActiveTab('products');
                                    }}
                                    className={`flex gap-4 items-start p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100'}`}
                                >
                                    <div className={`p-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-100 text-red-600' : n.type === 'user' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-gray-800 text-sm ${n.read ? 'font-normal' : 'font-bold'}`}>{n.text}</p>
                                        <p className="text-gray-400 text-xs mt-1">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-6 animate-fade-in">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Store Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Store Name</label>
                                    <input type="text" defaultValue="Scentsmiths" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Support Email</label>
                                    <input type="text" defaultValue="support@scentsmiths.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Business Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Currency</label>
                                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none">
                                        <option>USD ($)</option>
                                        <option>PHP (₱)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Tax Rate (%)</label>
                                    <input type="number" defaultValue="12" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                            </div>
                        </div>

                        <button className="bg-[#961E20] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#7a181a]">Save All Changes</button>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Admin Account</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Admin Name</label>
                                    <input type="text" defaultValue="Admin User" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Admin Email</label>
                                    <input type="email" defaultValue="admin@scentsmiths.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-gray-500 mb-1">Change Password</label>
                                    <input type="password" placeholder="New password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#961E20] outline-none" />
                                </div>
                            </div>
                            <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900">Update Account</button>
                        </div>
                    </div>
                )}
            </main>

            {/* ===== MODALS ===== */}

            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingProduct === 'new' ? 'Add New Perfume' : 'Edit Product'}</h3>
                            <button onClick={() => setEditingProduct(null)}><X className="text-gray-400 hover:text-black" /></button>
                        </div>
                        <form onSubmit={saveProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                <input name="name" defaultValue={editingProduct.name} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                                    <input name="brand" defaultValue={editingProduct.brand || ''} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select name="category" defaultValue={editingProduct.category} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none">
                                        <option>Best Seller</option>
                                        <option>Just Arrived</option>
                                        <option>Luxury</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <input name="image_url" defaultValue={editingProduct.image_url || ''} placeholder="https://... or /products/..." className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                <p className="text-xs text-gray-400 mt-1">Use a full URL or a path from the public folder (e.g. /products/my-perfume.png)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (50ml)</label>
                                    <input name="price_50ml" type="number" step="0.01" defaultValue={editingProduct.price_50ml || editingProduct.price} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (100ml)</label>
                                    <input name="price_100ml" type="number" step="0.01" defaultValue={editingProduct.price_100ml || ''} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock (50ml)</label>
                                    <input name="stock_50ml" type="number" defaultValue={editingProduct.stock_50ml || editingProduct.stock} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock (100ml)</label>
                                    <input name="stock_100ml" type="number" defaultValue={editingProduct.stock_100ml || ''} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#961E20] outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#961E20] text-white py-3 rounded-xl font-bold mt-4">Save Product</button>
                        </form>
                    </div>
                </div>
            )}

            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end backdrop-blur-sm">
                    <div className="bg-white h-full w-full max-w-md shadow-2xl p-6 animate-slide-left overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold">Order Details</h3>
                                <p className="text-sm text-gray-500">{viewingOrder.id}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)}><X className="text-gray-400 hover:text-black" /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {['Pending', 'Shipped', 'Delivered'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(viewingOrder.id, status)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${viewingOrder.status === status ? 'bg-[#961E20] text-white border-[#961E20]' : 'bg-white border-gray-200 text-gray-600'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Customer</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">{viewingOrder.customer.charAt(0)}</div>
                                    <p className="font-bold">{viewingOrder.customer}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Shipping Address</label>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewingOrder.address || 'No address provided'}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Items</label>
                                <div className="space-y-2">
                                    {viewingOrder.items && viewingOrder.items.map((item: string, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                                            <span>{item}</span>
                                            <span className="font-medium">1x</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-xl text-[#961E20]">{viewingOrder.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingCustomer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end backdrop-blur-sm">
                    <div className="bg-white h-full w-full max-w-md shadow-2xl p-6 animate-slide-left overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold">Customer Profile</h3>
                            <button onClick={() => setViewingCustomer(null)}><X className="text-gray-400 hover:text-black" /></button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-[#961E20] text-white text-3xl font-serif italic rounded-full flex items-center justify-center mx-auto mb-4">
                                {viewingCustomer.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold">{viewingCustomer.name}</h2>
                            <p className="text-gray-500">{viewingCustomer.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Spent</p>
                                <p className="text-xl font-bold text-[#961E20]">{viewingCustomer.spent}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold">Orders</p>
                                <p className="text-xl font-bold text-gray-800">{viewingCustomer.orders}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 border-b pb-2">Recent Activity</h4>
                            {(() => {
                                const custOrders = orders.filter(o => o.customer === viewingCustomer.name);
                                return custOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {custOrders.map(o => (
                                            <div
                                                key={o.id}
                                                onClick={() => { setViewingCustomer(null); setViewingOrder(o); setActiveTab('orders'); }}
                                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:shadow-sm transition-all"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{o.id}</p>
                                                    <p className="text-xs text-gray-400">{o.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{o.total}</p>
                                                    <StatusBadge status={o.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No recent activity logged.</p>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const StatCard = ({ title, value, change, isNegative = false }: { title: string; value: string; change: string; isNegative?: boolean }) => (
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-xs lg:text-sm mb-2 font-medium">{title}</p>
        <div className="flex justify-between items-end">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{value}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {change}
            </span>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    let styles = "bg-gray-100 text-gray-600";
    if (status === 'Delivered') styles = "bg-green-100 text-green-700";
    if (status === 'Pending') styles = "bg-orange-100 text-orange-700";
    if (status === 'Shipped') styles = "bg-blue-100 text-blue-700";

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles}`}>
            {status}
        </span>
    );
};