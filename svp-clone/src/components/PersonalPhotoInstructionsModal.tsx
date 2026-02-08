import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PersonalPhotoInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const steps = [
    {
        id: 1,
        title: 'General',
        rules: [
            { text: 'The photo must be in color.', bold: ['color'] },
            { text: 'The photo must be in PNG, JPEG or JPG format.', bold: ['PNG, JPEG or JPG'] },
            { text: 'The size of the photo should not exceed 2 MBs', bold: ['size', '2 MBs'] },
            { text: 'The photo must be taken within the last 6 months.', bold: ['last 6 months'] },
        ]
    },
    {
        id: 2,
        title: 'Quality',
        rules: [
            { text: 'The photo must be clear and in focus.', bold: ['clear', 'in focus'] },
            { text: 'No red-eye.', bold: ['No red-eye'] },
            { text: 'No shadows, glare or reflections on the face or background.', bold: ['No shadows, glare or reflections'] },
        ]
    },
    {
        id: 3,
        title: 'Pose',
        rules: [
            { text: 'Face forward and look straight at the camera.', bold: ['Face forward'] },
            { text: 'Shoulders must be straight/squared.', bold: ['Shoulders'] },
            { text: 'Expression should be neutral with both eyes open and mouth closed.', bold: ['neutral', 'eyes open', 'mouth closed'] },
        ]
    },
    {
        id: 4,
        title: 'Glasses',
        rules: [
            { text: 'Do not wear sunglasses or tinted/colored glasses.', bold: ['not wear sunglasses', 'tinted/colored'] },
            { text: 'If you normally wear glasses, your eyes must be clearly visible in the photo.', bold: ['eyes must be clearly visible'] },
        ]
    },
    {
        id: 5,
        title: 'Headdress',
        rules: [
            { text: 'No head covering unless worn for religious reasons.', bold: ['No head covering'] },
            { text: 'Face must be fully visible from chin to forehead.', bold: ['fully visible'] },
        ]
    },
    {
        id: 6,
        title: 'Upload',
        rules: [],
        isConfirmation: true,
    }
];

const PersonalPhotoInstructionsModal: React.FC<PersonalPhotoInstructionsModalProps> = ({ isOpen, onClose, onComplete }) => {
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Personal Photo Standard Requirements</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-8">
                    <div className="flex items-center justify-between relative">
                        {/* Background Line */}
                        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200" />

                        {/* Active Progress Line */}
                        <div
                            className="absolute top-4 left-8 h-0.5 bg-[#0f766e] transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 5) * (100 - 16)}%` }}
                        />

                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center z-10 relative">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all bg-white ${s.id < currentStep
                                            ? 'border-[#0f766e] text-[#0f766e]'
                                            : s.id === currentStep
                                                ? 'border-[#0f766e] text-[#0f766e]'
                                                : 'border-gray-200 text-gray-400'
                                        }`}
                                >
                                    {s.id < currentStep ? <Check size={16} /> : s.id}
                                </div>
                                <span className={`text-[10px] mt-2 font-medium absolute top-8 whitespace-nowrap ${s.id <= currentStep ? 'text-[#0f766e]' : 'text-gray-400'
                                    }`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 min-h-[250px] flex flex-col justify-center">
                    {step.isConfirmation ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="reviewed-photo"
                                    checked={hasReviewed}
                                    onChange={(e) => setHasReviewed(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                                />
                                <label htmlFor="reviewed-photo" className="text-sm text-gray-700">
                                    I acknowledge that all the entered data is correct and is my responsibility
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {step.rules.map((rule, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="text-gray-400 mt-1 min-w-[12px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{renderText(rule)}</p>
                                </div>
                            ))}

                            {/* Example Images */}
                            <div className="mt-8 flex justify-center gap-12">
                                <div className="text-center">
                                    <div className="w-24 h-24 border-2 border-green-500 rounded-lg overflow-hidden mb-2">
                                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Correct" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto">
                                        <Check size={14} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="w-24 h-24 border-2 border-red-500 rounded-lg overflow-hidden mb-2 relative">
                                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Incorrect" className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {step.id === 4 ? (
                                                <div className="w-16 h-6 bg-black opacity-60 rotate-12" />
                                            ) : (
                                                <div className="w-full h-full bg-black/10" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white mx-auto">
                                        <X size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-3 p-6 border-t mt-4">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-sm"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={currentStep === 6 && !hasReviewed}
                        className="px-8 py-2.5 bg-[#0f766e] text-white rounded-lg hover:bg-[#0d6b63] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentStep === 6 ? 'Upload Photo' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalPhotoInstructionsModal;
