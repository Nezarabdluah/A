import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animation Variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};



const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 667 664" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M333.333 0C150 0 0 149.667 0 334.001C0 500.667 122 639.001 281.333 664.001V430.667H196.667V334.001H281.333V260.333C281.333 176.667 331 130.667 407.333 130.667C443.667 130.667 481.667 137 481.667 137V219.333H439.667C398.333 219.333 385.333 245 385.333 271.334V334.001H478L463 430.667H385.333V664.001C463.88 651.594 535.407 611.517 586.997 551.001C638.587 490.487 666.847 413.521 666.667 334.001C666.667 149.667 516.667 0 333.333 0Z" fill="currentColor"></path>
    </svg>
);

const TwitterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.53901 0L6.71643 8.2598L0.5 14.9754H1.89907L7.34154 9.09579L11.7389 14.9754H16.5L9.97501 6.25096L15.7612 0H14.3621L9.3499 5.41498L5.3001 0H0.53901Z" fill="currentColor"></path>
    </svg>
);

const LinkedInIcon = () => (
    <svg width="24" height="24" viewBox="0 0 750 750" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M694.325 0H55.325C55.125 0 54.9 0 54.65 0C24.675 0 0.35 24.1 0 53.975V695.775C0.35 725.675 24.675 749.8 54.65 749.8C54.9 749.8 55.125 749.8 55.375 749.8H694.25C694.45 749.8 694.7 749.8 694.95 749.8C724.95 749.8 749.325 725.725 749.8 695.825V695.775V54.025C749.325 24.1 724.95 0 694.925 0C694.675 0 694.45 0 694.2 0H694.325ZM222.375 638.95H111.025V281.175H222.375V638.95ZM166.725 232.225C131.1 232.225 102.25 203.35 102.25 167.75C102.25 132.15 131.125 103.275 166.725 103.275C202.325 103.275 231.2 132.125 231.2 167.725C231.2 167.75 231.2 167.775 231.2 167.825C231.2 203.4 202.35 232.25 166.775 232.25C166.75 232.25 166.725 232.25 166.7 232.25L166.725 232.225ZM638.775 638.95H527.75V464.975C527.75 423.475 526.9 370.1 469.9 370.1C412 370.1 403.175 415.25 403.175 461.925V638.975H292.15V281.2H398.8V329.975H400.25C420.95 295.1 458.4 272.1 501.225 272.1C502.75 272.1 504.25 272.125 505.75 272.175H505.525C618.025 272.175 638.825 346.225 638.825 442.6V638.975L638.775 638.95Z" fill="currentColor"></path>
    </svg>
);

const YoutubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.9 8L11.052 5.6L6.9 3.2V8ZM16.148 1.736C16.252 2.112 16.324 2.616 16.372 3.256C16.428 3.896 16.452 4.448 16.452 4.928L16.5 5.6C16.5 7.352 16.372 8.64 16.148 9.464C15.948 10.184 15.484 10.648 14.764 10.848C14.388 10.952 13.7 11.024 12.644 11.072C11.604 11.128 10.652 11.152 9.772 11.152L8.5 11.2C5.148 11.2 3.06 11.072 2.236 10.848C1.516 10.648 1.052 10.184 0.852 9.464C0.748 9.088 0.676 8.584 0.628 7.944C0.572 7.304 0.548 6.752 0.548 6.272L0.5 5.6C0.5 3.848 0.628 2.56 0.852 1.736C1.052 1.016 1.516 0.552 2.236 0.352C2.612 0.248 3.3 0.176 4.356 0.128C5.396 0.0719999 6.348 0.048 7.228 0.048L8.5 0C11.852 0 13.94 0.128 14.764 0.352C15.484 0.552 15.948 1.016 16.148 1.736Z" fill="currentColor"></path>
    </svg>
);

// Support Modal Component
const SupportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setName('');
        setEmail('');
        setSubject('');
        setDescription('');
        setError('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !subject || !description) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://anlash-backend.onrender.com/api/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, subject, description }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to submit ticket');
            }
        } catch (err) {
            setError('Connection failed. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-end p-4 pt-20">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
                className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden mr-4"
            >
                {/* Header */}
                <div className="bg-[#0f766e] p-4 flex items-center justify-between text-white">
                    <h3 className="font-bold text-lg">Contact us</h3>
                    <button onClick={handleClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {success ? (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Ticket Submitted!</h3>
                            <p className="text-[#64748b] text-sm mb-6">Our team will respond to you soon.</p>
                            <button
                                onClick={handleClose}
                                className="bg-[#0f766e] hover:bg-[#0d6b63] text-white px-6 py-2 rounded font-bold text-sm transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-6 text-sm">How can we help you?</p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Your name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 focus:border-[#0f766e] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 focus:border-[#0f766e] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 focus:border-[#0f766e] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Description</label>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Please enter the details of your request. A member of our support staff will respond as soon as possible.
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 focus:border-[#0f766e] transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#0f766e] hover:bg-[#0d6b63] text-white px-6 py-2 rounded font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        )}
                                        {loading ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Certificate Verification Modal Component
const CertificateVerificationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [passportNumber, setPassportNumber] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{
        valid: boolean;
        status?: string;
        data?: {
            holderName: string;
            occupation: string;
            certificateSerial: string;
            passportNumber: string;
            issueDate: string;
            expiryDate: string;
        };
    } | null>(null);

    // Reset to input step when modal closes
    const handleClose = () => {
        setStep('input');
        setPassportNumber('');
        setSerialNumber('');
        setError('');
        setResult(null);
        onClose();
    };

    const handleVerify = async () => {
        if (!passportNumber || !serialNumber) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://anlash-backend.onrender.com/api/certificates/verify?passportNumber=${encodeURIComponent(passportNumber)}&certificateSerial=${encodeURIComponent(serialNumber)}`
            );
            const data = await response.json();
            setResult(data);
            setStep('result');
        } catch (err) {
            setError('Connection failed. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('input');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5%]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/40"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-[502px] bg-white rounded-lg overflow-hidden"
                style={{
                    boxShadow: '0 20px 60px -2px rgba(27, 33, 58, 0.4)',
                    fontFamily: 'Roboto, sans-serif'
                }}
            >
                {/* Close Icon */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <p className="text-[#1e293b] text-xl font-semibold mb-6">Check certificate validity</p>

                    {step === 'input' ? (
                        /* Input Form */
                        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Passport Number Field */}
                            <div className="mb-5">
                                <label className="block text-sm text-[#8394a8] mb-2 font-medium">
                                    Passport Number
                                </label>
                                <input
                                    type="text"
                                    value={passportNumber}
                                    onChange={(e) => setPassportNumber(e.target.value)}
                                    placeholder="Enter Passport Number"
                                    maxLength={20}
                                    className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all"
                                />
                            </div>

                            {/* Certificate Serial Number Field */}
                            <div className="mb-6">
                                <label className="block text-sm text-[#8394a8] mb-2 font-medium">
                                    Certificate Serial Number
                                </label>
                                <input
                                    type="text"
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    placeholder="Enter Certificate Serial Number"
                                    className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 border border-[#d1d5db] text-[#64748b] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-[#0f766e] text-white rounded-lg font-medium hover:bg-[#0d6b63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Result Screen */
                        <div>
                            {result?.valid ? (
                                <>
                                    {/* Valid Status with Shield Icon */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M7.252 0.0658387C7.32753 0.0226935 7.41301 0 7.5 0C7.58699 0 7.67247 0.0226935 7.748 0.0658387L14.748 4.06584C14.8245 4.10955 14.8881 4.17272 14.9324 4.24893C14.9766 4.32515 15 4.41171 15 4.49984V5.21984C15 7.42581 14.2814 9.57174 12.9528 11.3328C11.6243 13.0938 9.75818 14.3741 7.637 14.9798C7.54745 15.0054 7.45255 15.0054 7.363 14.9798C5.24198 14.3738 3.37607 13.0935 2.04757 11.3325C0.719076 9.5715 0.000300345 7.42573 0 5.21984L0 4.49984C2.8427e-05 4.41171 0.0233513 4.32515 0.0676055 4.24893C0.11186 4.17272 0.175473 4.10955 0.252 4.06584L7.252 0.0658387ZM7.072 10.7108L11.39 5.31184L10.61 4.68784L6.928 9.28884L4.32 7.11584L3.68 7.88384L7.072 10.7108Z" fill="#5F9D3C" />
                                        </svg>
                                        <span className="text-[#5F9D3C] font-medium">{result.status}</span>
                                    </div>

                                    {/* Certificate Serial Number */}
                                    <div className="mb-5">
                                        <div className="text-sm text-[#0f766e] mb-1">Certificate Serial Number:</div>
                                        <div className="text-2xl font-bold text-[#1e293b]">{result.data?.certificateSerial}</div>
                                    </div>

                                    {/* Details Box */}
                                    <div className="bg-[#f8fafc] rounded-lg p-5 mb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Passport Number:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.passportNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Valid Until:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">
                                                    {result.data?.expiryDate ? new Date(result.data.expiryDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Occupation:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.occupation || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Labor Name:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.holderName}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Not Found State */
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Certificate Not Found</h3>
                                    <p className="text-[#64748b] text-sm">No certificate found with the provided details.</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2.5 border border-[#d1d5db] text-[#64748b] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 bg-[#0f766e] text-white rounded-lg font-medium hover:bg-[#0d6b63] transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Check Labor Result Modal Component
const CheckLaborResultModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [passportNumber, setPassportNumber] = useState('');
    const [occupationKey, setOccupationKey] = useState('');
    const [nationalityCode, setNationalityCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{
        found: boolean;
        data?: {
            passportNumber: string;
            occupationKey: string;
            nationalityCode: string;
            examDate: string;
            score: number;
            result: string;
        };
    } | null>(null);

    const handleClose = () => {
        setStep('input');
        setPassportNumber('');
        setOccupationKey('');
        setNationalityCode('');
        setError('');
        setResult(null);
        onClose();
    };

    const handleVerify = async () => {
        if (!passportNumber || !occupationKey || !nationalityCode) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `https://anlash-backend.onrender.com/api/labor-results/check?passportNumber=${encodeURIComponent(passportNumber)}&occupationKey=${encodeURIComponent(occupationKey)}&nationalityCode=${encodeURIComponent(nationalityCode)}`
            );
            const data = await response.json();
            setResult(data);
            setStep('result');
        } catch (err) {
            setError('Connection failed. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('input');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[5%]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/40"
            ></motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-[502px] bg-white rounded-lg overflow-hidden"
                style={{
                    boxShadow: '0 20px 60px -2px rgba(27, 33, 58, 0.4)',
                    fontFamily: 'Roboto, sans-serif'
                }}
            >
                {/* Close Icon */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <p className="text-[#1e293b] text-xl font-semibold mb-6">Check labor result</p>

                    {step === 'input' ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Passport Number Field */}
                            <div className="mb-5">
                                <label className="block text-sm text-[#8394a8] mb-2 font-medium">
                                    Passport Number
                                </label>
                                <input
                                    type="text"
                                    value={passportNumber}
                                    onChange={(e) => setPassportNumber(e.target.value)}
                                    placeholder="Enter Passport Number"
                                    className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all"
                                />
                            </div>

                            {/* Occupation Key Field */}
                            <div className="mb-5">
                                <label className="block text-sm text-[#8394a8] mb-2 font-medium">
                                    Occupation Key
                                </label>
                                <input
                                    type="text"
                                    value={occupationKey}
                                    onChange={(e) => setOccupationKey(e.target.value)}
                                    placeholder="Enter Occupation Key"
                                    className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all"
                                />
                            </div>

                            {/* Nationality Code Field */}
                            <div className="mb-6">
                                <label className="block text-sm text-[#8394a8] mb-2 font-medium">
                                    Nationality Code
                                </label>
                                <input
                                    type="text"
                                    value={nationalityCode}
                                    onChange={(e) => setNationalityCode(e.target.value)}
                                    placeholder="Enter Nationality Code"
                                    className="w-full px-4 py-3.5 border border-[#e2e8f0] rounded-lg text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] transition-all"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 border border-[#d1d5db] text-[#64748b] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-[#0f766e] text-white rounded-lg font-medium hover:bg-[#0d6b63] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            {result?.found ? (
                                <>
                                    {/* Valid Status */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M7.252 0.0658387C7.32753 0.0226935 7.41301 0 7.5 0C7.58699 0 7.67247 0.0226935 7.748 0.0658387L14.748 4.06584C14.8245 4.10955 14.8881 4.17272 14.9324 4.24893C14.9766 4.32515 15 4.41171 15 4.49984V5.21984C15 7.42581 14.2814 9.57174 12.9528 11.3328C11.6243 13.0938 9.75818 14.3741 7.637 14.9798C7.54745 15.0054 7.45255 15.0054 7.363 14.9798C5.24198 14.3738 3.37607 13.0935 2.04757 11.3325C0.719076 9.5715 0.000300345 7.42573 0 5.21984L0 4.49984C2.8427e-05 4.41171 0.0233513 4.32515 0.0676055 4.24893C0.11186 4.17272 0.175473 4.10955 0.252 4.06584L7.252 0.0658387ZM7.072 10.7108L11.39 5.31184L10.61 4.68784L6.928 9.28884L4.32 7.11584L3.68 7.88384L7.072 10.7108Z" fill="#5F9D3C" />
                                        </svg>
                                        <span className="text-[#5F9D3C] font-medium">{result.data?.result}</span>
                                    </div>

                                    {/* Result Title */}
                                    <div className="mb-5">
                                        <div className="text-sm text-[#0f766e] mb-1">Labor Result:</div>
                                        <div className="text-2xl font-bold text-[#1e293b]">Score: {result.data?.score}</div>
                                    </div>

                                    {/* Details Box */}
                                    <div className="bg-[#f8fafc] rounded-lg p-5 mb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Passport Number:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.passportNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Occupation Key:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.occupationKey}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Nationality Code:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">{result.data?.nationalityCode}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-[#8394a8] mb-1">Exam Date:</div>
                                                <div className="text-sm font-medium text-[#1e293b]">
                                                    {result.data?.examDate ? new Date(result.data.examDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Not Found State */
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-[#1e293b] mb-2">Result Not Found</h3>
                                    <p className="text-[#64748b] text-sm">No labor result found with the provided details.</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2.5 border border-[#d1d5db] text-[#64748b] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 bg-[#0f766e] text-white rounded-lg font-medium hover:bg-[#0d6b63] transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};


const VerificationPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { scrollY } = useScroll();
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(true);
    const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    // Hero slides
    const heroSlides = [
        '/images/hero-slide-1.dcd3db55.webp',
        '/images/hero-slide-2.26d88920.webp',
        '/images/hero-slide-3.5a1ddda3.webp',
        '/images/hero-slide-4.080ad8fb.webp',
        '/images/hero-slide-5.754b3630.webp'
    ];

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Advantages data - Using actual icon files from PACC
    const advantages = [
        {
            icon: "/images/icon-person.6b3d6b6c.svg",
            gradient: "from-[#FEF3C7] via-[#FDE68A] to-[#D4E4D0]",
            title: "Enhanced Workforce Competence",
            description: "The program ensures that professional workers have the qualifications and skills necessary to be competent in the Saudi labor market."
        },
        {
            icon: "/images/icon-bag.76f3be78.svg",
            gradient: "from-[#CCFBF1] via-[#A7F3D0] to-[#D4E8E0]",
            title: "Quality Assurance in Job Performance",
            description: "This program contributes to improving job performance and the quality of labor market outcomes by verifying professional qualifications."
        },
        {
            icon: "/images/icon-star.3d8fe108.svg",
            gradient: "from-[#FEF3C7] via-[#FDE68A] to-[#D4E4D0]",
            title: "Increased Productivity",
            description: "The completion of professional accreditation program requirements leads to increased productivity as employees are better equipped to perform their roles effectively."
        },
        {
            icon: "/images/icon-crown.1d8030d5.svg",
            gradient: "from-[#CCFBF1] via-[#A7F3D0] to-[#D4E8E0]",
            title: "Competitive Edge for Saudi Arabia",
            description: "Professional Accreditation Program enhances the competitiveness of the Saudi workforce globally."
        }
    ];

    // Partners data
    const partners = [
        { name: "BMET", logo: "/images/partner-logo-bmet.cbf0ede2.svg", url: "bmet.gov.bd", bgColor: "#FEF3C7" },
        { name: "NAVTTC", logo: "/images/partner-logo-navttc.3710b617.svg", url: "navttc.gov.pk", bgColor: "#D1FAE5" },
        { name: "TVEC", logo: "/images/partner-logo-tvec.6b66474e.svg", url: "tvec.gov.lk", bgColor: "#DBEAFE" },
        { name: "NSDC", logo: "/images/partner-logo-nsdc.61dd5291.svg", url: "nsdcindia.org", bgColor: "#FEF3C7" }
    ];



    return (
        <div className="overflow-x-hidden font-sans bg-white">
            {/* Header - Fixed */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}
            >
                <div className="container mx-auto px-8 md:px-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg width="48" height="42" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5 24.5C12.5 24.5 5 28 2 34C6 28 17 22 24 28C24 28 17 24 15.5 24.5Z" fill={isScrolled ? "#e3901b" : "white"} />
                                <path d="M23 29C28 25 45 5 52 2C42 12 30 30 23 38C23 38 24 32 23 29Z" fill={isScrolled ? "#1a7c56" : "white"} />
                            </svg>
                        </div>
                        <div className={`flex flex-col items-start transition-colors ${isScrolled ? 'text-[#0a192f]' : 'text-white'}`}>
                            <span className="text-lg font-bold leading-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>الاعتماد المهني</span>
                            <span className="text-xs font-semibold tracking-wider uppercase opacity-80">PROFESSIONAL ACCREDITATION</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={`hidden md:flex items-center gap-10 text-base font-medium transition-colors ${isScrolled ? 'text-[#334155]' : 'text-white'}`}>
                        <button onClick={() => setIsCertificateModalOpen(true)} className="hover:text-[#0d7377] transition-colors">Check certificate</button>
                        <button onClick={() => setIsLaborModalOpen(true)} className="hover:text-[#0d7377] transition-colors">Labor result</button>
                        <a href="#partnership" className="hover:text-[#0d7377] transition-colors">Partnership</a>
                    </nav>

                    {/* Right side - Auth Buttons + Language + Hamburger */}
                    <div className="flex items-center gap-3">
                        {/* Sign in & Sign Up - Desktop only, visible when scrolled */}
                        {isScrolled && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="hidden md:flex items-center gap-2"
                            >
                                <Link to="/auth/login" className="text-[#334155] hover:text-[#0d7377] px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/auth/signup" className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all">
                                    Sign Up
                                </Link>
                            </motion.div>
                        )}

                        {/* Language Switcher - Desktop */}
                        <button className={`hidden md:flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm ${isScrolled ? 'text-[#0a192f] hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                            <span className="font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>عربية</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 0 4-10z" />
                            </svg>
                        </button>

                        {/* Hamburger Menu Button - Mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`md:hidden flex flex-col gap-[5px] p-2 ${isScrolled ? 'text-[#0a192f]' : 'text-white'}`}
                            aria-label="Toggle menu"
                        >
                            <span className={`block w-6 h-[2px] ${isScrolled ? 'bg-[#0a192f]' : 'bg-white'} transition-all`}></span>
                            <span className={`block w-6 h-[2px] ${isScrolled ? 'bg-[#0a192f]' : 'bg-white'} transition-all`}></span>
                            <span className={`block w-6 h-[2px] ${isScrolled ? 'bg-[#0a192f]' : 'bg-white'} transition-all`}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-full right-0 w-64 bg-white shadow-xl rounded-bl-lg z-50"
                    >
                        {/* Close button */}
                        <div className="flex justify-end p-3">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex flex-col px-6 pb-6 gap-1">
                            <button
                                onClick={() => { setIsCertificateModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="text-left text-[#334155] hover:text-[#0d7377] py-2.5 text-base font-medium"
                            >Check certificate</button>
                            <button
                                onClick={() => { setIsLaborModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="text-left text-[#334155] hover:text-[#0d7377] py-2.5 text-base font-medium"
                            >Labor result</button>
                            <a href="#partnership" onClick={() => setIsMobileMenuOpen(false)} className="text-[#334155] hover:text-[#0d7377] py-2.5 text-base font-medium">Partnership</a>

                            <div className="border-t border-gray-200 my-3"></div>

                            {/* Sign in & Sign Up */}
                            <div className="flex gap-3">
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 text-center bg-[#0d7377] text-white py-2.5 rounded-lg font-semibold text-sm"
                                >Sign in</Link>
                                <Link
                                    to="/auth/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex-1 text-center border-2 border-[#0d7377] text-[#0d7377] py-2.5 rounded-lg font-semibold text-sm"
                                >Sign Up</Link>
                            </div>

                            <div className="border-t border-gray-200 my-3"></div>

                            {/* Language */}
                            <button className="flex items-center gap-2 text-[#334155] py-2">
                                <span className="font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>العربية</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 0 4-10z" />
                                </svg>
                            </button>
                        </nav>
                    </motion.div>
                )}
            </motion.header>


            {/* Hero Section - LARGER */}
            <section className="relative min-h-screen flex items-center bg-[#0a192f] overflow-hidden">
                {/* Background Slideshow */}
                <div className="absolute inset-0 z-0">
                    {heroSlides.map((slide, index) => (
                        <motion.img
                            key={index}
                            src={slide}
                            alt={`Hero slide ${index + 1}`}
                            className="absolute w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: currentSlide === index ? 1 : 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-[#0a192f]/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/70 via-[#000000]/40 to-transparent"></div>
                </div>

                <div className="container mx-auto px-8 md:px-16 relative z-10 pt-24">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="max-w-3xl"
                    >
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1]"
                        >
                            Elevating Careers,<br />
                            Unlocking New<br />
                            Opportunities
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed"
                        >
                            Professional Accreditation Program helps workers stand out by verifying their skills, opening doors to new and better job opportunities.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                            <Link to="/auth/login" className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white px-8 py-4 rounded-lg font-semibold transition-all text-base flex items-center justify-center">
                                Sign in
                            </Link>
                            <Link to="/auth/signup" className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-all text-base flex items-center justify-center">
                                Sign Up
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

            </section>

            {/* Check certificate & Exam result - LARGER */}
            <section id="certificate" className="py-24 bg-white">
                <div className="container mx-auto px-8 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-12"
                    >
                        Check certificate &<br />Exam result
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 - Check Certificate - LARGER */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            whileHover={{ y: -5 }}
                            className="relative h-[500px] rounded-3xl overflow-hidden group shadow-2xl cursor-pointer"
                        >
                            <img
                                src="/images/check-certificate-desktop.2d33b986.jpg"
                                alt="Certificate"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0d4a4d]/95 via-[#0a3c3e]/90 to-[#062829]/85"></div>

                            <div className="absolute inset-0 p-12 flex flex-col justify-end z-10">
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-5">Check certificate<br />validity</h3>
                                <p className="text-gray-200 text-lg mb-8 max-w-md leading-relaxed">
                                    To check the validity of your certificate, you can visit the official training center or use our online verification tool to confirm authenticity.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsCertificateModalOpen(true)}
                                    className="bg-white text-[#0d4a4d] px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 text-base w-fit flex items-center gap-3"
                                >
                                    Check it out
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.43 5.93L20.5 12L14.43 18.07" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3.5 12H20.33" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Card 2 - Check Labor Result - LARGER with image */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                            className="relative h-[500px] rounded-3xl overflow-hidden group shadow-2xl cursor-pointer"
                        >
                            <img
                                src="/images/check-certificate-desktop.2d33b986.jpg"
                                alt="Labor"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0d4a4d]/95 via-[#0a3c3e]/90 to-[#062829]/85"></div>


                            <div className="absolute inset-0 p-12 flex flex-col justify-end z-10">
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-5">Check labor result</h3>
                                <p className="text-gray-200 text-lg mb-8 max-w-md leading-relaxed">
                                    To check your labor result, you can visit the official labor department website and enter your credentials to access your test scores.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsLaborModalOpen(true)}
                                    className="bg-white text-[#0d4a4d] px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 text-base w-fit flex items-center gap-3"
                                >
                                    Check result
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.43 5.93L20.5 12L14.43 18.07" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3.5 12H20.33" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Advantages - LARGER */}
            <section className="py-36 bg-[#F8FAFC]">
                <div className="container mx-auto px-8 md:px-16">
                    <div className="flex flex-col md:flex-row gap-20 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="w-full md:w-2/5"
                        >
                            <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-10">
                                <span className="text-[#64748b]">Advantages of</span><br />
                                <span className="text-[#0e2a47]">Professional<br />Accreditation<br />Program</span>
                            </h2>
                            <div className="rounded-3xl overflow-hidden shadow-2xl h-[600px] w-full">
                                <img
                                    src="/images/advantages-bg-2x.5b15120c.webp"
                                    alt="Construction"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        <div className="w-full md:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            {advantages.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex flex-col gap-6"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${item.gradient} shadow-sm`}
                                    >
                                        <img src={item.icon} alt={item.title} className="w-10 h-10" />
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-[#0e2a47]">{item.title}</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* Partnership - LARGER */}
            <section id="partnership" className="relative py-40 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/images/partnership-desktop.10c0ff2c.jpg"
                        alt="Partnership"
                        className="w-full h-full object-cover"
                    />
                    {/* Colorful gradient overlay - teal to orange like original */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d3d]/85 via-[#1a4a4a]/70 to-[#8B4513]/50"></div>
                </div>

                <div className="container mx-auto px-8 md:px-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                            Partnership<br />Skills Verification
                        </h2>
                        <p className="text-gray-300 mb-12 text-xl leading-relaxed">
                            Partner with us to get benefits from our services and network with thousands of skilled workers ready to contribute their roles effectively
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white px-10 py-5 rounded-xl font-semibold text-lg flex items-center gap-3 uppercase transition-all"
                            >
                                HOW TO BE A PARTNER
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.43 5.93L20.5 12L14.43 18.07" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.5 12H20.33" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 px-10 py-5 rounded-xl font-semibold text-lg flex items-center gap-3 uppercase transition-all"
                            >
                                HOW TO VERIFY
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.43 5.93L20.5 12L14.43 18.07" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.5 12H20.33" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partners - LARGER */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-8 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-6xl font-bold text-[#64748b] mb-16"
                    >
                        Partners
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {partners.map((partner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Bezier for smooth entrance
                                whileHover={{ y: -10, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08)" }}
                                className="rounded-[3.5rem] p-10 flex flex-col items-center justify-between min-h-[450px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all cursor-pointer relative overflow-hidden"
                                style={{ backgroundColor: partner.bgColor }}
                            >
                                <h3 className="text-3xl font-bold text-[#0e2a47] mb-8 text-center">{partner.name}</h3>
                                <div className="flex-1 flex items-center justify-center w-full mb-8">
                                    <img src={partner.logo} alt={partner.name} className="max-w-[150px] max-h-[150px] w-auto h-auto object-contain drop-shadow-sm" />
                                </div>
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={`https://${partner.url}`}
                                    className="bg-white text-[#0d7377] w-full py-5 rounded-2xl text-lg font-bold text-center shadow-sm hover:shadow-md transition-all"
                                >
                                    Go to website
                                </motion.a>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-6 xl:gap-0">

                        {/* Left: Links */}
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                            <a href="#" className="hover:text-[#0f766e] transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-[#0f766e] transition-colors">Terms Of Use</a>
                            <a href="#" className="hover:text-[#0f766e] transition-colors">Knowledge center</a>
                        </div>

                        {/* Center: Social Icons */}
                        <div className="flex items-center gap-4 text-[#0f766e]">
                            <a href="#" className="hover:opacity-80 transition-opacity bg-[#e0f2f1] p-2 rounded-full"><FacebookIcon /></a>
                            <a href="#" className="hover:opacity-80 transition-opacity bg-[#e0f2f1] p-2 rounded-full"><TwitterIcon /></a>
                            <a href="#" className="hover:opacity-80 transition-opacity bg-[#e0f2f1] p-2 rounded-full"><LinkedInIcon /></a>
                            <a href="#" className="hover:opacity-80 transition-opacity bg-[#e0f2f1] p-2 rounded-full"><YoutubeIcon /></a>
                        </div>

                        {/* Right: Copyright */}
                        <div className="text-gray-500 text-sm">
                            Copyright © 2026 PACC All rights reserved
                        </div>

                        {/* Far Right: Logos */}
                        <div className="flex items-center gap-6">
                            <img src="/images/takamolLogo.9fa6c143.svg" alt="Takamol" className="h-8" />
                            <img src="/images/hrsdLogo.324f4bbf.svg" alt="HRSD" className="h-10" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating Support Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSupportOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-[#0f766e] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#0d6b63] transition-colors"
            >
                <div className="bg-white/20 rounded-full p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>
                Support
            </motion.button>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
            <CertificateVerificationModal isOpen={isCertificateModalOpen} onClose={() => setIsCertificateModalOpen(false)} />
            <CheckLaborResultModal isOpen={isLaborModalOpen} onClose={() => setIsLaborModalOpen(false)} />
        </div >
    );
};

export default VerificationPage;



