import React, { useState } from 'react';
import {
    Search as SearchIcon,
    Upload,
    Loader2,
    AlertCircle,
    User,
    MapPin,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    ShieldCheck,
    Phone,
    Mail,
    Calendar,
    Activity,
    ShieldAlert,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Search = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [expandedCaseId, setExpandedCaseId] = useState(null);
    const { user } = useAuth();

    const [finderName, setFinderName] = useState('');
    const [finderPhone, setFinderPhone] = useState('');
    const [finderEmail, setFinderEmail] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleDeleteCase = async (childId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to resolve and permanently delete this case?")) return;
        
        try {
            await api.delete(`register/${childId}`);
            toast.success("Case successfully resolved and deleted.");
            setResults(prev => ({
                ...prev,
                matches: prev.matches.filter(m => m.child.id !== childId)
            }));
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to delete case.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSearch = async () => {
        if (!image) return;

        // Validate name
        if (/\d/.test(finderName)) {
            setNameError('Name must contain only letters — no numbers allowed.');
            return;
        } else {
            setNameError('');
        }

        // Validate email
        if (finderEmail && !isValidEmail(finderEmail)) {
            setEmailError('Please enter a valid email address (e.g. john@example.com).');
            return;
        } else {
            setEmailError('');
        }

        setIsSearching(true);
        setResults(null);
        setError(null);
        setExpandedCaseId(null);

        const data = new FormData();
        data.append('image', image);
        data.append('finder_name', finderName);
        data.append('finder_phone', finderPhone);
        data.append('finder_email', finderEmail);

        try {
            const response = await api.post('search/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred during identification.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900">AI Identity Verification</h1>
                <p className="text-slate-500 mt-1">Instantly match a child's photo against our global missing database</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Search Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card p-6 bg-white shadow-xl shadow-slate-200/50 text-center">
                        <h3 className="font-bold text-slate-900 mb-4 ">Identity Scanner</h3>

                        <div className={`
              border-2 border-dashed rounded-2xl p-6 mb-6 transition-all duration-300
              ${imagePreview ? 'border-primary-500 bg-primary-50/30' : 'border-slate-300 bg-slate-50'}
            `}>
                            {imagePreview ? (
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Query"
                                        className="w-full aspect-square object-cover rounded-xl shadow-md ring-4 ring-white"
                                    />
                                    <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                        <label className="bg-white text-primary-600 px-4 py-2 rounded-lg font-bold cursor-pointer shadow-lg">
                                            Change Photo
                                            <input type="file" className="sr-only" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                        <Upload className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <span className="font-bold text-slate-700">Upload Image</span>
                                    <span className="text-xs text-slate-500 mt-1">Drag & drop or browse</span>
                                    <input type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>

                        <div className="space-y-4 mb-6 text-left">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    value={finderName}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
                                        setFinderName(val);
                                        setNameError('');
                                    }}
                                    onKeyDown={e => { if (/^\d$/.test(e.key)) e.preventDefault(); }}
                                    required
                                    className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none ${nameError ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="John Doe"
                                />
                                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Phone</label>
                                <input type="tel" value={finderPhone} onChange={e => setFinderPhone(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none" placeholder="+1234567890" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Email</label>
                                <input
                                    type="text"
                                    value={finderEmail}
                                    onChange={e => {
                                        setFinderEmail(e.target.value);
                                        setEmailError('');
                                    }}
                                    required
                                    className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none ${emailError ? 'border-red-400' : 'border-slate-200'}`}
                                    placeholder="john@example.com"
                                />
                                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={!image || !finderName || !finderPhone || !finderEmail || isSearching}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Analyzing Bio-metrics...
                                </>
                            ) : (
                                <>
                                    <SearchIcon className="w-5 h-5 mr-2" />
                                    Run AI Match
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 animate-in fade-in zoom-in-95 duration-300">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {!results && !isSearching ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card border-dashed border-2 bg-slate-50/50 p-20 text-center flex flex-col items-center justify-center"
                            >
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400">Ready to Match</h3>
                                <p className="text-slate-400 mt-2 max-w-xs">Upload a photograph to scan our database using deep identity verification.</p>
                            </motion.div>
                        ) : isSearching ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="card p-6 animate-pulse flex gap-6">
                                        <div className="w-32 h-32 bg-slate-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                            <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : results?.match_found ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span className="font-bold text-slate-900">{results?.matches?.length || 0} Match(es) Identified</span>
                                    </div>
                                    <span className="text-sm text-slate-500">Processed</span>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {results?.matches?.map((match, idx) => (
                                        <motion.div
                                            key={match.child.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="card p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg hover:border-primary-200 transition-all group"
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={match.child.image_path ? match.child.image_path.replace(/^\/?(app\/)?/, '/') : "https://via.placeholder.com/300"}
                                                    alt={match.child.name}
                                                    className="w-full sm:w-40 h-48 sm:h-40 object-cover rounded-xl shadow-md"
                                                />
                                                <div className="absolute -top-3 -left-3 bg-white px-3 py-1 rounded-full shadow-md border text-xs font-bold text-slate-700">
                                                    #{idx + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                                            {match.child.name}
                                                        </h3>
                                                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Registry Record</span>
                                                    </div>
                                                    <div className="text-left sm:text-right bg-slate-50 p-2 px-4 rounded-xl border border-slate-100 shadow-sm ring-1 ring-slate-200/50">
                                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Confidence</p>
                                                        <p className={cn(
                                                            "text-xl font-black",
                                                            match.confidence > 80 ? "text-emerald-600" : "text-amber-600"
                                                        )}>
                                                            {match.confidence.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm mb-6 flex-1">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <User className="w-4 h-4 text-primary-500" />
                                                        <span>{match.child.age} Years • <span className="capitalize">{match.child.gender}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <MapPin className="w-4 h-4 text-primary-500" />
                                                        <span className="truncate">{match.child.last_seen_location}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-4">
                                                    <button 
                                                        onClick={() => setExpandedCaseId(expandedCaseId === match.child.id ? null : match.child.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 py-3 rounded-xl transition-all"
                                                    >
                                                        {expandedCaseId === match.child.id ? 'Close Case File' : 'View Full Case File'}
                                                        {expandedCaseId === match.child.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>

                                                    {user && (
                                                        <button
                                                            onClick={(e) => handleDeleteCase(match.child.id, e)}
                                                            className="flex items-center justify-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-xl transition-all"
                                                            title="Resolve and permanently delete case"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Resolve
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <AnimatePresence>
                                                    {expandedCaseId === match.child.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden mt-4"
                                                        >
                                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                                    <span className="font-semibold text-slate-700">Contact: {match.child.contact_number || 'N/A'}</span>
                                                                </div>
                                                                {match.child.contact_email && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                                        <span className="font-semibold text-slate-700">Email: {match.child.contact_email}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-slate-600">Reported on: {new Date(match.child.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-sm">
                                                                    <Activity className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-slate-600">Case Status: <span className="uppercase font-bold text-amber-600">{match.child.status}</span></span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : results?.message && results.message.includes("No face detected") ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card p-12 text-center flex flex-col items-center justify-center bg-blue-50 border-blue-200"
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-900">Face Not Detected</h3>
                                <p className="text-blue-700 mt-2 max-w-sm mx-auto font-medium">
                                    {results.message}
                                    <br /><br />
                                    Tips for a better photo:
                                </p>
                                <ul className="text-sm text-blue-600 text-left mt-4 space-y-1 inline-block">
                                    <li>• Ensure the face is well-lit and clearly visible</li>
                                    <li>• Avoid sharp angles; use a front-facing photo</li>
                                    <li>• Remove sunglasses or hats if possible</li>
                                </ul>
                                <button
                                    onClick={() => { setImagePreview(null); setResults(null); }}
                                    className="mt-8 text-blue-600 font-bold hover:underline"
                                >
                                    Try another photo
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card p-12 text-center flex flex-col items-center justify-center bg-amber-50 border-amber-200"
                            >
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-amber-900">No Identity Found</h3>
                                <p className="text-amber-700 mt-2 max-w-sm mx-auto font-medium">
                                    {results?.message || "The biometric analysis could not find a high-confidence match in the current registry."}
                                </p>

                                <div className="mt-8 bg-red-50 border-2 border-red-200 p-5 rounded-2xl max-w-md w-full shadow-inner text-left mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-200/50 p-2.5 rounded-full shrink-0 shadow-sm mt-1">
                                            <ShieldAlert className="w-6 h-6 text-red-700" />
                                        </div>
                                        <div>
                                            <h4 className="text-red-900 font-extrabold text-lg uppercase tracking-tight mb-1">
                                                Urgent Action Required
                                            </h4>
                                            <p className="text-red-800 text-sm font-medium leading-relaxed">
                                                No matches were found in our database. It is critical that you immediately contact your nearby police station and report this to the national Childline at <strong className="font-black text-red-900 text-lg bg-white px-2 py-0.5 rounded border border-red-100 shadow-sm inline-block mt-1">1098</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setImagePreview(null); setResults(null); }}
                                    className="mt-8 text-amber-600 font-bold hover:underline"
                                >
                                    Clear search and try another photo
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Search;
