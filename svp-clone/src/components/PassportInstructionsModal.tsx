import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PassportInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const steps = [
    {
        id: 1,
        title: 'General',
        rules: [
            { text: 'Only PNG, JPEG or JPG images must be used', bold: ['PNG, JPEG or JPG'] },
            { text: 'The size of the photo should not exceed 2 MBs', bold: ['size', '2 MBs'] },
            { text: 'If your last name is blank, please provide your father\'s name as the last name', bold: ['last name is blank', 'father\'s name'] },
            { text: 'The MRZ code should be clearly visible otherwise the request will be rejected', bold: ['MRZ code', 'clearly visible'] },
            { text: 'The MRZ is 2 or 3 lines of letters, symbols, and numbers, at the bottom of the personal details page on your passport', bold: ['MRZ', '2 or 3 lines'] },
        ]
    },
    {
        id: 2,
        title: 'Color',
        rules: [
            { text: 'Please make sure to upload the document in full color.', bold: ['full color'] },
        ]
    },
    {
        id: 3,
        title: 'Quality',
        rules: [
            { text: 'No glare or stain over the scan.', bold: ['No glare'] },
            { text: 'No shadows over the scan.', bold: ['No shadows'] },
        ]
    },
    {
        id: 4,
        title: 'Scan',
        rules: [
            { text: 'Double pages of scanned copies are not allowed.', bold: [] },
            { text: 'Only a single page should be uploaded', bold: ['single page'] },
        ]
    },
    {
        id: 5,
        title: 'Cropping',
        rules: [
            { text: 'Crop the document so that no information is missed', bold: ['no information is missed'] },
        ]
    },
    {
        id: 6,
        title: 'Upload',
        rules: [],
        isConfirmation: true,
    }
];

const PassportInstructionsModal: React.FC<PassportInstructionsModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [hasReviewed, setHasReviewed] = useState(false);

    if (!isOpen) return null;

    const step = steps.find(s => s.id === currentStep)!;

    const handleNext = () => {
        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
        } else if (hasReviewed) {
            onComplete();
            setCurrentStep(1);
            setHasReviewed(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setHasReviewed(false);
        onClose();
    };

    const renderText = (rule: { text: string; bold: string[] }) => {
        let result = rule.text;
        rule.bold.forEach(b => {
            result = result.replace(b, `<strong>${b}</strong>`);
        });
        return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Instructions for uploading Passport</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200" />
                        <div
                            className="absolute top-4 left-8 h-0.5 bg-[#0f766e] transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 5) * (100 - 16)}%` }}
                        />

                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center z-10">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${s.id < currentStep
                                            ? 'bg-[#0f766e] border-[#0f766e] text-white'
                                            : s.id === currentStep
                                                ? 'bg-white border-[#0f766e] text-[#0f766e]'
                                                : 'bg-white border-gray-300 text-gray-300'
                                        }`}
                                >
                                    {s.id < currentStep ? <Check size={14} /> : s.id}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${s.id <= currentStep ? 'text-gray-700' : 'text-gray-400'
                                    }`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 min-h-[300px]">
                    {step.isConfirmation ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="reviewed"
                                    checked={hasReviewed}
                                    onChange={(e) => setHasReviewed(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                                />
                                <label htmlFor="reviewed" className="text-sm text-gray-700">
                                    I have reviewed the instructions on how to upload the photo
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {step.rules.map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <span className="text-gray-400 mt-0.5">☐</span>
                                    <p className="text-sm text-gray-700">{renderText(rule)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Passport Examples */}
                    <div className="mt-8 flex justify-center gap-6">
                        <div className="text-center">
                            <div className="w-40 h-28 border-2 border-green-400 rounded-lg bg-gradient-to-br from-green-50 to-white flex items-center justify-center overflow-hidden">
                                <div className="text-xs text-center p-2">
                                    <div className="font-bold text-green-700 mb-1">INTERNATIONAL PASSPORT</div>
                                    <div className="w-8 h-10 bg-gray-300 rounded mx-auto mb-1" />
                                    <div className="text-[8px] text-gray-500">MRZ CODE HERE</div>
                                </div>
                            </div>
                            <div className="mt-2 text-green-500">✓</div>
                        </div>
                        <div className="text-center">
                            <div className="w-40 h-28 border-2 border-red-400 rounded-lg bg-gradient-to-br from-red-50 to-white flex items-center justify-center overflow-hidden opacity-70">
                                <div className="text-xs text-center p-2">
                                    <div className="font-bold text-red-700 mb-1">BLURRY / DARK</div>
                                    <div className="w-8 h-10 bg-gray-400 rounded mx-auto mb-1 blur-sm" />
                                    <div className="text-[8px] text-gray-400">NOT VISIBLE</div>
                                </div>
                            </div>
                            <div className="mt-2 text-red-500">✗</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-3 p-6 border-t">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={currentStep === 6 && !hasReviewed}
                        className="px-6 py-2.5 bg-[#0f766e] text-white rounded-lg hover:bg-[#0d6b63] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PassportInstructionsModal;
