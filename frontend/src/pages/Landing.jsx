import React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700 max-w-5xl mx-auto px-4">
            
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                    <ShieldCheck className="w-10 h-10 text-primary-600" />
                </div>
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl mb-4">
                    Missing Child <span className="text-primary-600 block sm:inline">Verification</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                    Our AI-powered registry helps authorities and the public reunite missing children with their families using state-of-the-art facial recognition.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                
                {/* Search Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-8 border-2 border-transparent hover:border-primary-500 transition-all bg-white shadow-xl shadow-slate-200 flex flex-col group relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                            <Search className="w-7 h-7 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Identify a Child</h2>
                        <p className="text-slate-600 mb-8 font-medium">
                            Found a lost child? Upload their photograph to instantly scan our national registry and notify the authorities.
                        </p>
                        <Link 
                            to="/search" 
                            className="inline-flex items-center text-primary-600 font-bold hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-5 py-2.5 rounded-lg transition-colors mt-auto w-fit"
                        >
                            Launch AI Search <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </motion.div>

                {/* Register Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="card p-8 border-2 border-transparent hover:border-amber-500 transition-all bg-white shadow-xl shadow-slate-200 flex flex-col group relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                            <UserPlus className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Missing</h2>
                        <p className="text-slate-600 mb-8 font-medium">
                            Are you a parent or guardian? Register a missing child's profile into the biometric database to activate global alerts.
                        </p>
                        <Link 
                            to="/register" 
                            className="inline-flex items-center text-amber-700 font-bold hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-5 py-2.5 rounded-lg transition-colors mt-auto w-fit"
                        >
                            Register Profile <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </motion.div>

            </div>

        </div>
    );
};

export default Landing;
