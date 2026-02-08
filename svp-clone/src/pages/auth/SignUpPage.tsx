import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, Check, Loader2, X } from 'lucide-react';
import PassportInstructionsModal from '../../components/PassportInstructionsModal';
import PersonalPhotoInstructionsModal from '../../components/PersonalPhotoInstructionsModal';
import { register, verifyOTP, resendOTP } from '../../services/api';

const API_BASE = 'http://localhost:5000/api';

const SignUpPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [_applicantId, setApplicantId] = useState<number | null>(null);

    const [success, setSuccess] = useState(false);
    const [showPassportInstructions, setShowPassportInstructions] = useState(false);
    const [showPersonalPhotoInstructions, setShowPersonalPhotoInstructions] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1 - Passport Info
        passportFile: null as File | null,
        passportImagePath: '',
        firstName: '',
        lastName: '',
        noFirstName: false,
        noLastName: false,
        passportNumber: '',
        countryOfResidence: '',
        nationality: '',
        dateOfBirth: '',
        sex: 'male',
        passportExpiry: '',
        // Step 2 - Other Details
        occupationKey: '',
        employerName: '',
        workExperienceYears: '',
        // Step 3 - Contact Info
        email: '',
        phone: '',
        countryCode: '+966',
        address: '',
        city: '',
        postalCode: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        // Step 4 - Verification
        verificationCode: '',
        captchaVerified: false,
        password: '',
        confirmPassword: '',
        personalPhotoFile: null as File | null,
    });

    // OTP State
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        setFormData(prev => ({ ...prev, verificationCode: otpDigits.join('') }));
    }, [otpDigits]);

    const steps = [
        { id: 1, label: 'Passport Information' },
        { id: 2, label: 'Other Details' },
        { id: 3, label: 'Contact Information' },
        { id: 4, label: 'Account Verification' }
    ];

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: 'passport' | 'personal') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PNG, JPG, or JPEG image');
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setError('File size must be less than 3MB');
            return;
        }

        if (field === 'passport') {
            setFormData(prev => ({ ...prev, passportFile: file }));
        } else if (field === 'personal') {
            setFormData(prev => ({ ...prev, personalPhotoFile: file }));
        }

        // Upload file immediately
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('passport', file);

            const response = await fetch(`${API_BASE}/upload/passport`, {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, passportImagePath: data.file.path }));
            } else {
                setError('Failed to upload passport image');
            }
        } catch {
            setError('Upload failed. Make sure the backend is running.');
        }
    };

    const validateStep = (step: number): boolean => {
        setError('');

        if (step === 1) {
            if (!formData.passportImagePath) {
                setError('Please upload your passport image');
                return false;
            }
            if (!formData.noFirstName && !formData.firstName) {
                setError('Please enter your first name or check "I do not have a first name"');
                return false;
            }
            if (!formData.noLastName && !formData.lastName) {
                setError('Please enter your last name or check "I do not have a last name"');
                return false;
            }
            if (!formData.passportNumber) {
                setError('Please enter your passport number');
                return false;
            }
            if (!formData.nationality) {
                setError('Please select your nationality');
                return false;
            }
        }

        if (step === 2) {
            if (!formData.occupationKey) {
                setError('Please enter your occupation key');
                return false;
            }
        }

        if (step === 3) {
            if (!formData.email) {
                setError('Please enter your email address');
                return false;
            }
            if (!formData.phone) {
                setError('Please enter your phone number');
                return false;
            }
            if (!formData.password || formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }

        return true;
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const data = await register({
                passportNumber: formData.passportNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                noFirstName: formData.noFirstName,
                noLastName: formData.noLastName,
                nationality: formData.nationality,
                email: formData.email,
                phone: formData.phone,
                countryCode: formData.countryCode,
                passportImagePath: formData.passportImagePath,
                password: formData.password
            });

            if (data.applicantId) {
                setApplicantId(data.applicantId);
                setCurrentStep(4);
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep === 3) {
                handleRegister();
            } else {
                setCurrentStep(prev => Math.min(prev + 1, 4));
            }
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleVerify = async () => {
        if (!formData.captchaVerified) {
            setError('Please verify that you are not a robot');
            return;
        }

        if (formData.verificationCode.length !== 6) {
            setError('Please enter the 6-digit verification code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await verifyOTP(formData.email, formData.verificationCode);
            setSuccess(true);
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError('Verification failed. Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1e293b] mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-8">
                        Your application has been submitted successfully. You will receive a confirmation email shortly.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#0f766e] hover:bg-[#0d6b63] text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 font-sans/50">
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 md:p-12 relative overflow-hidden"
                style={{ boxShadow: '0 20px 60px -2px rgba(27, 33, 58, 0.15)' }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-3">
                        <svg width="40" height="35" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 24.5C12.5 24.5 5 28 2 34C6 28 17 22 24 28C24 28 17 24 15.5 24.5Z" fill="#e3901b" />
                            <path d="M23 29C28 25 45 5 52 2C42 12 30 30 23 38C23 38 24 32 23 29Z" fill="#1a7c56" />
                        </svg>
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold text-[#0a192f]" style={{ fontFamily: 'Cairo, sans-serif' }}>الاعتماد المهني</span>
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">PROFESSIONAL ACCREDITATION</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-[#1e293b] text-center mb-10">Create your account</h1>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-12 relative px-4">
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10 mx-10"></div>
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step.id <= currentStep
                                    ? 'bg-white border-[#0e2a47] text-[#0e2a47]'
                                    : 'bg-white border-gray-300 text-gray-300'
                                    }`}
                            >
                                {step.id < currentStep ? <Check size={16} /> : step.id}
                            </div>
                            <span className={`text-xs font-semibold text-center max-w-[80px] leading-tight ${step.id <= currentStep ? 'text-[#0e2a47]' : 'text-gray-300'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError('')} className="ml-auto">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 1 - Passport Information */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Warning Alert */}
                        <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-xl p-4 flex gap-4 items-start">
                            <AlertCircle className="w-6 h-6 text-[#f97316] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-[#9a3412] text-sm">Important</h4>
                                <p className="text-[#9a3412] text-xs mt-1 leading-relaxed">
                                    Once the account is created, data cannot be modified or changed. Please ensure accurate information is entered for all fields in this form.
                                </p>
                            </div>
                        </div>

                        {/* Upload Passport */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#475569] block">
                                Upload Passport<span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Please upload or take a photo of your passport</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileSelect(e, 'passport')}
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                            />
                            <button
                                onClick={() => setShowPassportInstructions(true)}
                                className={`flex items-center gap-2 px-6 py-3 border font-bold rounded-xl transition-colors ${formData.passportFile
                                    ? 'bg-green-50 border-green-500 text-green-700'
                                    : 'bg-white border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e]/5'
                                    }`}
                            >
                                {formData.passportFile ? <Check size={18} /> : <Upload size={18} />}
                                {formData.passportFile ? formData.passportFile.name : 'Upload Passport'}
                            </button>
                            <p className="text-[10px] text-gray-400 mt-1">Your photo must be in PNG, JPG or JPEG format, not exceeding 3 megabytes.</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid md:grid-cols-1 gap-6">
                            {/* First Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">First Name (Given Names)<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    disabled={formData.noFirstName}
                                    placeholder="Enter your first name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none disabled:bg-gray-100"
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="no-fname"
                                        checked={formData.noFirstName}
                                        onChange={(e) => handleInputChange('noFirstName', e.target.checked)}
                                        className="rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                                    />
                                    <label htmlFor="no-fname" className="text-xs text-gray-500">I do not have a first name</label>
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Last Name (Surname)<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    disabled={formData.noLastName}
                                    placeholder="Enter your last name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none disabled:bg-gray-100"
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="no-lname"
                                        checked={formData.noLastName}
                                        onChange={(e) => handleInputChange('noLastName', e.target.checked)}
                                        className="rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                                    />
                                    <label htmlFor="no-lname" className="text-xs text-gray-500">I do not have a last name</label>
                                </div>
                            </div>

                            {/* Passport No */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Passport No.<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.passportNumber}
                                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                                    placeholder="Enter your passport number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            {/* Nationality */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Nationality<span className="text-red-500">*</span></label>
                                <select
                                    value={formData.nationality}
                                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none bg-white"
                                >
                                    <option value="">Choose nationality</option>
                                    <option value="PK">Pakistan</option>
                                    <option value="IN">India</option>
                                    <option value="BD">Bangladesh</option>
                                    <option value="PH">Philippines</option>
                                    <option value="EG">Egypt</option>
                                    <option value="JO">Jordan</option>
                                    <option value="SY">Syria</option>
                                    <option value="YE">Yemen</option>
                                </select>
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Date of Birth<span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            {/* Sex */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#475569]">Sex<span className="text-red-500">*</span></label>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sex"
                                            id="male"
                                            checked={formData.sex === 'male'}
                                            onChange={() => handleInputChange('sex', 'male')}
                                            className="text-[#0f766e] focus:ring-[#0f766e]"
                                        />
                                        <label htmlFor="male" className="text-sm text-gray-600">Male</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sex"
                                            id="female"
                                            checked={formData.sex === 'female'}
                                            onChange={() => handleInputChange('sex', 'female')}
                                            className="text-[#0f766e] focus:ring-[#0f766e]"
                                        />
                                        <label htmlFor="female" className="text-sm text-gray-600">Female</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 - Other Details */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid md:grid-cols-1 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Occupation Key<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.occupationKey}
                                    onChange={(e) => handleInputChange('occupationKey', e.target.value)}
                                    placeholder="Enter occupation key (e.g., 93110)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Employer Name</label>
                                <input
                                    type="text"
                                    value={formData.employerName}
                                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                                    placeholder="Enter employer name (optional)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Years of Work Experience</label>
                                <input
                                    type="number"
                                    value={formData.workExperienceYears}
                                    onChange={(e) => handleInputChange('workExperienceYears', e.target.value)}
                                    placeholder="Enter years of experience"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 - Contact Information */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid md:grid-cols-1 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Email Address<span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Phone Number<span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.countryCode}
                                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                                        className="px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none bg-white"
                                    >
                                        <option value="+966">🇸🇦 +966</option>
                                        <option value="+971">🇦🇪 +971</option>
                                        <option value="+92">🇵🇰 +92</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+880">🇧🇩 +880</option>
                                        <option value="+63">🇵🇭 +63</option>
                                    </select>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Enter your address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#475569]">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        placeholder="City"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#475569]">Postal Code</label>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                        placeholder="Postal code"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    />
                                </div>
                            </div>

                            {/* Personal Photo */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#475569]">Personal Photo</label>
                                <button
                                    onClick={() => setShowPersonalPhotoInstructions(true)}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 border font-bold rounded-xl transition-colors ${formData.personalPhotoFile
                                        ? 'bg-green-50 border-green-500 text-green-700'
                                        : 'bg-white border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e]/5'
                                        }`}
                                >
                                    {formData.personalPhotoFile ? <Check size={18} /> : <Upload size={18} />}
                                    {formData.personalPhotoFile ? formData.personalPhotoFile.name : 'Upload Personal Photo'}
                                </button>
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#475569]">Password<span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Min 8 chars"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-[#475569]">Confirm Password<span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder="Confirm Password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0f766e] outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 - Account Verification */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white rounded-xl py-6 flex flex-col items-center space-y-6">
                            <h3 className="text-xl font-bold text-[#1e293b]">Email verification</h3>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-500">We just sent your verification code to</p>
                                <p className="font-bold text-[#1e293b]">{formData.email}</p>
                                <button onClick={() => setCurrentStep(3)} className="text-[#0f766e] text-sm hover:underline">
                                    change email
                                </button>
                            </div>

                            <div className="space-y-2 w-full max-w-xs">
                                <label className="text-xs font-bold text-gray-500 ml-1">Verification Code<span className="text-red-500">*</span></label>
                                <div className="flex justify-between gap-2">
                                    {otpDigits.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-10 h-12 border border-gray-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-[#0f766e] outline-none"
                                        />
                                    ))}
                                </div>
                                <div className="text-center text-sm font-bold text-[#1e293b] mt-4">
                                    01:56
                                </div>
                                <button
                                    onClick={() => resendOTP(formData.email)}
                                    className="block mt-2 text-xs text-center text-[#0f766e] hover:underline w-full"
                                >
                                    Resend Code
                                </button>
                            </div>

                            <div className="border border-gray-300 rounded-md p-3 w-fit bg-gray-50 flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.captchaVerified}
                                        onChange={(e) => handleInputChange('captchaVerified', e.target.checked)}
                                        className="w-6 h-6 rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">I'm not a robot</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-8 h-8 opacity-50" />
                                    <span className="text-[10px] text-gray-400">reCAPTCHA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col items-center gap-4 pt-8">
                    <div className="flex gap-4">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-8 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="w-48 bg-[#0f766e] hover:bg-[#0d6b63] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-[#0f766e]/20 disabled:opacity-50"
                            >
                                {loading && currentStep === 3 ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue'}
                            </button>
                        ) : (
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-48 bg-[#0f766e] hover:bg-[#0d6b63] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-[#0f766e]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? 'Verifying...' : 'Verify & Complete'}
                            </button>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        Already have an account? <Link to="/auth/login" className="text-[#0f766e] font-bold hover:underline">Sign in</Link>
                    </div>
                </div>
            </motion.div>

            {/* Back to Home */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
            >
                <Link to="/" className="text-gray-500 text-sm hover:text-[#0f766e] transition-colors flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to home
                </Link>

            </motion.div>

            <PassportInstructionsModal
                isOpen={showPassportInstructions}
                onClose={() => setShowPassportInstructions(false)}
                onComplete={() => {
                    setShowPassportInstructions(false);
                    setTimeout(() => fileInputRef.current?.click(), 100);
                }}
            />

            <input
                type="file"
                id="personal-photo-upload"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => handleFileSelect(e, 'personal')}
            />

            <PersonalPhotoInstructionsModal
                isOpen={showPersonalPhotoInstructions}
                onClose={() => setShowPersonalPhotoInstructions(false)}
                onComplete={() => {
                    setShowPersonalPhotoInstructions(false);
                    setTimeout(() => document.getElementById('personal-photo-upload')?.click(), 100);
                }}
            />
        </div >
    )
}

export default SignUpPage;
