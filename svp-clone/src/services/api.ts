// API Configuration
const API_BASE_URL = 'https://anlash-backend.onrender.com/api';

// Certificate Verification API
export const verifyCertificate = async (passportNumber: string, certificateSerial: string) => {
    const response = await fetch(
        `${API_BASE_URL}/certificates/verify?passportNumber=${encodeURIComponent(passportNumber)}&certificateSerial=${encodeURIComponent(certificateSerial)}`
    );
    return response.json();
};

// Labor Result Check API
export const checkLaborResult = async (passportNumber: string, occupationKey: string, nationalityCode: string) => {
    const response = await fetch(
        `${API_BASE_URL}/labor-results/check?passportNumber=${encodeURIComponent(passportNumber)}&occupationKey=${encodeURIComponent(occupationKey)}&nationalityCode=${encodeURIComponent(nationalityCode)}`
    );
    return response.json();
};

// Submit Support Ticket API
export const submitSupportTicket = async (data: { name: string; email: string; subject: string; description: string }) => {
    const response = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

// Auth API
export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

export const register = async (data: {
    passportNumber: string;
    firstName: string;
    lastName: string;
    noFirstName: boolean;
    noLastName: boolean;
    nationality: string;
    email: string;
    phone: string;
    countryCode: string;
    passportImagePath: string;
    password?: string;
}) => {
    const response = await fetch(`${API_BASE_URL}/applicants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const verifyOTP = async (email: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/applicants/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
    });
    return response.json();
};

export const resendOTP = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/applicants/resend-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    return response.json();
};
