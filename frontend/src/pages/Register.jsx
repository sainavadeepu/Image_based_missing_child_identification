import React, { useState } from 'react';
import {
    Camera,
    Upload,
    User,
    MapPin,
    Phone,
    Hash,
    Loader2,
    CheckCircle,
    X,
    ShieldAlert,
    Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { cn } from '../lib/utils';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        location: '',
        phone: '',
        email: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // For name field: strip any digits that may be pasted in
        if (name === 'name') {
            const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, '');
            setFormData(prev => ({ ...prev, name: lettersOnly }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size must be less than 10MB");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (/\d/.test(formData.name)) {
            toast.error('Name must contain only letters — no numbers allowed.');
            return;
        }
        if (formData.email && !isValidEmail(formData.email)) {
            toast.error('Please enter a valid email address (e.g. parent@example.com).');
            return;
        }
        if (!image) {
            toast.error('Please upload a photo of the child');
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        
        // Match backend Form fields exactly
        data.append('name', formData.name);
        data.append('age', formData.age);
        data.append('gender', formData.gender);
        data.append('location', formData.location);
        data.append('phone', formData.phone);
        if (formData.email) {
            data.append('email', formData.email);
        }
        
        // Use "file" key as expected by backend File()
        data.append('file', image);

        try {
            const response = await api.post('register/', data); 
            const result = response.data;

            if (result.warning) {
                toast(result.warning, {
                    icon: '⚠️',
                    duration: 6000,
                    style: {
                        borderRadius: '10px',
                        background: '#fffbeb',
                        color: '#92400e',
                        border: '1px solid #fde68a'
                    },
                });
            } else {
                toast.success('Child successfully registered in the database');
            }
            // Reset form
            setFormData({
                name: '',
                age: '',
                gender: 'male',
                location: '',
                phone: '',
                email: '',
            });
            setImage(null);
            setImagePreview(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Register Missing Child</h1>
                <p className="text-slate-500 mt-1">Upload details and photos for the AI matching registry</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-2">
                    <div className="card p-8">
                        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary-500" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (/^\d$/.test(e.key)) e.preventDefault();
                                        }}
                                        className="input-field"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-primary-500" />
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        required
                                        min="0"
                                        max="18"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['male', 'female', 'other'].map((g) => (
                                        <label
                                            key={g}
                                            className={cn(
                                                "flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all",
                                                formData.gender === g
                                                    ? "bg-primary-50 border-primary-500 text-primary-700 font-bold"
                                                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                className="sr-only"
                                                checked={formData.gender === g}
                                                onChange={handleInputChange}
                                            />
                                            <span className="capitalize">{g}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-500" />
                                    Last Seen Location
                                </label>
                                <textarea
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="input-field resize-none transition-all focus:h-24"
                                    placeholder="Street name, Landmark, City..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary-500" />
                                    Guardian Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="+91-XXXXX-XXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary-500" />
                                    Guardian Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="parent@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary-200"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Complete Registration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Social & Info */}
                <div className="space-y-6">
                    <div className="card p-6 border-dashed border-2 bg-slate-50 border-slate-300 relative group overflow-hidden">
                        {imagePreview ? (
                            <div className="relative aspect-square rounded-lg overflow-hidden ring-4 ring-white shadow-lg">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center aspect-square cursor-pointer">
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Camera className="w-10 h-10 text-primary-600" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">Upload Photo</p>
                                <p className="text-xs text-slate-500 mt-1">Clear, front-facing JPG/PNG</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="sr-only"
                                />
                            </label>
                        )}
                    </div>

                    <div className="card p-6 bg-slate-900 text-white">
                        <h4 className="font-bold flex items-center gap-2 mb-3">
                            <ShieldAlert className="w-5 h-5 text-primary-400" />
                            Guidelines
                        </h4>
                        <ul className="text-sm space-y-3 text-slate-400">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0"></div>
                                Photo must be recent and well-lit.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0"></div>
                                Avoid photos with sunglasses or hats.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0"></div>
                                Max file size: 10MB.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
