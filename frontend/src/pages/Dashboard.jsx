import React, { useState, useEffect } from 'react';
import {
    Users, Search, Clock, CheckCircle, TrendingUp,
    ArrowRight, UserPlus, FileText, MapPin, Activity, Zap, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GeocodedMap = ({ childrenData }) => {
    const [markers, setMarkers] = useState([]);
    useEffect(() => {
        const run = async () => {
            if (!childrenData?.length) return;
            const locs = [...new Set(childrenData.map(c => c.last_seen_location).filter(Boolean))];
            const out = [];
            for (const loc of locs) {
                try {
                    await new Promise(r => setTimeout(r, 600));
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`);
                    const data = await res.json();
                    if (data?.length > 0) out.push({ location: loc, lat: +data[0].lat, lon: +data[0].lon, count: childrenData.filter(c => c.last_seen_location === loc).length });
                } catch (_) {}
            }
            setMarkers(out);
        };
        run();
    }, [childrenData]);

    return (
        <div className="h-[340px] rounded-xl overflow-hidden border border-slate-200">
            <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markers.map((m, i) => (
                    <Marker key={i} position={[m.lat, m.lon]}>
                        <Popup><strong>{m.location}</strong><br />{m.count} case(s)</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, bg, iconColor, description, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 90, damping: 14 }}
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
        className="bg-white rounded-2xl p-5 border border-slate-200 flex items-start gap-4 cursor-default"
    >
        <div className={`p-3 rounded-xl ${bg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('reports')
            .then(r => setStats(r.data || {}))
            .catch(() => setStats({}));
    }, []);

    const handleDeleteCase = async (childId) => {
        if (!window.confirm("Are you sure you want to permanently delete this case?")) return;
        try {
            await api.delete(`register/${childId}`);
            setStats(prev => ({
                ...prev,
                children: prev.children.filter(c => c.id !== childId),
                total_children: prev.total_children - 1,
            }));
            toast.success("Case successfully deleted.");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete case.");
        }
    };

    if (!stats) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 rounded-full border-t-2 border-b-2 border-blue-500"
                />
                <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                    className="text-slate-500 text-sm font-medium">Loading Dashboard...</motion.p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Real-time status of the Missing Child Identification System</p>
                </div>
                <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"
                >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    LIVE
                </motion.div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users}       label="Total Registered" value={stats?.total_children || 0}  bg="bg-blue-50"   iconColor="text-blue-600"   description="+12% from last month"    delay={0}   />
                <StatCard icon={Clock}       label="Active Missing"   value={stats?.missing_count || 0}    bg="bg-amber-50"  iconColor="text-amber-600" description="Requires urgent attention" delay={0.1} />
                <StatCard icon={CheckCircle} label="AI Matches Found" value={stats?.matches_found || 0}   bg="bg-green-50"  iconColor="text-green-600" description="Successful search hits"   delay={0.2} />
                <StatCard icon={Search}      label="Total Searches"   value={stats?.total_searches || 0}  bg="bg-indigo-50" iconColor="text-indigo-600" description="All time searches"       delay={0.3} />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Hero Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="relative rounded-2xl p-7 overflow-hidden text-white"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)' }}
                    >
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Search className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-yellow-300" />
                                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">AI Engine Active</span>
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">AI Search Engine is Ready</h2>
                            <p className="text-blue-100 text-sm mb-5">
                                Upload a photo to instantly search the national missing children registry using facial recognition.
                            </p>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/search"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-blue-800 bg-white hover:bg-blue-50 transition-colors text-sm shadow"
                                >
                                    Launch AI Search <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Platform Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold text-slate-800 text-sm">Platform Status</h3>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Enterprise</span>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Cloud Matching', status: 'Optimal' },
                                { label: 'Data Encryption', status: 'AES-256' },
                                { label: 'API Status', status: 'Live' },
                                { label: 'Model Version', status: 'InsightFace' }
                            ].map((item, i) => (
                                <motion.div key={item.label}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.55 + i * 0.07 }}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                    <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{item.status}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <h3 className="font-bold text-slate-800 text-sm">Geospatial Incident Map</h3>
                            </div>
                            <motion.span
                                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                                className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"
                            >● Live</motion.span>
                        </div>
                        <div className="p-4">
                            <GeocodedMap childrenData={stats?.children} />
                        </div>
                    </motion.div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-5">
                    {/* Quick Tools */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-sm">Quick Tools</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {[
                                { to: '/register', icon: UserPlus, label: 'New Registration', sub: 'Register a child', bg: 'bg-blue-50', color: 'text-blue-600' },
                                { to: '/reports', icon: FileText, label: 'Export Statistics', sub: 'Download reports', bg: 'bg-indigo-50', color: 'text-indigo-600' },
                            ].map(tool => (
                                <motion.div key={tool.to} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                                    <Link to={tool.to}
                                        className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className={`p-2 rounded-lg ${tool.bg}`}>
                                            <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{tool.label}</p>
                                            <p className="text-xs text-slate-400">{tool.sub}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Model Confidence */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <h3 className="font-bold text-slate-800 text-sm">Model Confidence</h3>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-sm text-slate-500">Average Accuracy</span>
                            <span className="text-2xl font-black text-blue-600">98.4%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full mb-4">
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: '98%' }}
                                transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                                className="h-2.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-center italic">Powered by InsightFace (ArcFace) & pgvector</p>
                    </motion.div>

                    {/* System Health */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5"
                    >
                        <h3 className="font-bold text-slate-800 text-sm mb-4">System Health</h3>
                        <div className="space-y-3.5">
                            {[
                                { label: 'Face Detection', pct: 92 },
                                { label: 'Match Pipeline', pct: 87 },
                                { label: 'DB Query Speed', pct: 99 },
                            ].map((item, i) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-600 font-medium">{item.label}</span>
                                        <span className="text-slate-700 font-bold">{item.pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                                            transition={{ delay: 0.9 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                                            className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Registered Cases List */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Active Mobile Registry</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{stats?.children?.length || 0} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-bold">
                                <th className="px-5 py-3">Child Name</th>
                                <th className="px-5 py-3">Age / Gender</th>
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Reported On</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats?.children?.length > 0 ? (
                                stats.children.map(child => (
                                    <tr key={child.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={child.image_path ? child.image_path.replace(/^\/?(app\/)?/, '/') : "https://via.placeholder.com/40"} alt={child.name} className="w-8 h-8 rounded-full object-cover shadow-sm bg-slate-200" />
                                                <span className="font-bold text-slate-800 uppercase tracking-tight">{child.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-600">
                                            {child.age} yrs • <span className="capitalize">{child.gender}</span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-600 max-w-xs truncate">
                                            {child.last_seen_location}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-500">
                                            {new Date(child.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button 
                                                onClick={() => handleDeleteCase(child.id)}
                                                className="inline-flex items-center gap-2 p-1.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Resolve & Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-medium">
                                        No active cases in the registry.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
