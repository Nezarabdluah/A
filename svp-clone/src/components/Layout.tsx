import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

// SVGs extracted from source
const LanguageIcon = ({ className = "text-[#1a202c]" }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4.8 12H27.2M4.8 20H27.2M4 16C4 17.5759 4.31039 19.1363 4.91345 20.5922C5.5165 22.0481 6.40042 23.371 7.51472 24.4853C8.62902 25.5996 9.95189 26.4835 11.4078 27.0866C12.8637 27.6896 14.4241 28 16 28C17.5759 28 19.1363 27.6896 20.5922 27.0866C22.0481 26.4835 23.371 25.5996 24.4853 24.4853C25.5996 23.371 26.4835 22.0481 27.0866 20.5922C27.6896 19.1363 28 17.5759 28 16C28 12.8174 26.7357 9.76516 24.4853 7.51472C22.2348 5.26428 19.1826 4 16 4C12.8174 4 9.76516 5.26428 7.51472 7.51472C5.26428 9.76516 4 12.8174 4 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M15.3334 4C13.0871 7.59948 11.8963 11.7572 11.8963 16C11.8963 20.2428 13.0871 24.4005 15.3334 28M16.6667 4C18.9129 7.59948 20.1038 11.7572 20.1038 16C20.1038 20.2428 18.9129 24.4005 16.6667 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

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


interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-[#1a202c]">
            {/* Header - Adaptive Sticky */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
                    }`}
            >
                <div className="container mx-auto px-8 md:px-16 flex items-center justify-between">
                    {/* Left Logo - Adaptive Color */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {/* Logomark - Exact Bird/Check Mark Shape */}
                            <div className="relative w-12 h-10 flex items-center justify-center">
                                <svg width="48" height="40" viewBox="0 0 54 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Adaptive Fill: White on Transparent, Colored on White Background */}
                                    <path d="M15.5 24.5C12.5 24.5 5 28 2 34C6 28 17 22 24 28C24 28 17 24 15.5 24.5Z" fill={isScrolled ? "#e3901b" : "white"} /> {/* Wing */}
                                    <path d="M23 29C28 25 45 5 52 2C42 12 30 30 23 38C23 38 24 32 23 29Z" fill={isScrolled ? "#1a7c56" : "white"} /> {/* Tick */}
                                </svg>
                            </div>
                            {/* Text - Adaptive Color */}
                            <div className={`flex flex-col items-end pt-1 transition-colors ${isScrolled ? 'text-[#0a192f]' : 'text-white'}`}>
                                <span className="text-xl font-bold leading-[0.8] tracking-wide mb-1" style={{ fontFamily: "sans-serif" }}>الاعتماد المهني</span>
                                <span className="text-[11px] font-medium tracking-wide uppercase leading-none">Professional Accreditation</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation / Actions */}
                    <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${isScrolled ? 'text-[#555]' : 'text-white'}`}>
                        <a href="#" className="hover:text-[#148287] transition-colors relative group">
                            Check certificate
                            <span
                                className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${isScrolled ? 'bg-[#148287]' : 'bg-[#2bc4cb]'}`}
                            ></span>
                        </a>
                        <a href="#" className="hover:text-[#148287] transition-colors relative group">
                            Labor result
                            <span
                                className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${isScrolled ? 'bg-[#148287]' : 'bg-[#2bc4cb]'}`}
                            ></span>
                        </a>
                        <a href="#" className="hover:text-[#148287] transition-colors relative group">
                            Partnership
                            <span
                                className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${isScrolled ? 'bg-[#148287]' : 'bg-[#2bc4cb]'}`}
                            ></span>
                        </a>

                        {/* Auth Buttons - Visible ONLY when Scrolled (White Header) based on screenshot */}
                        {isScrolled && (
                            <div className="flex items-center gap-3 ml-4">
                                <a href="https://svp-international.pacc.sa/auth/login" className="bg-[#148287] hover:bg-[#106a6e] text-white px-6 py-2 rounded-md font-bold transition-all shadow-sm">
                                    Sign in
                                </a>
                                <a href="https://svp-international.pacc.sa/auth/register" className="bg-[#e0f2f1] text-[#148287] hover:bg-[#b2dfdb] px-6 py-2 rounded-md font-bold transition-all shadow-sm">
                                    Sign Up
                                </a>
                            </div>
                        )}

                        <div className={`flex items-center gap-2 cursor-pointer hover:opacity-80 ml-2 ${isScrolled ? 'text-[#0a192f]' : 'text-white'}`}>
                            <span className="font-bold text-lg" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>العربية</span>
                            <div>
                                <LanguageIcon className={isScrolled ? "text-[#0a192f]" : "text-white"} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

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
        </div>
    );
};

export default Layout;
