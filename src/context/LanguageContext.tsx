"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'kn';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        welcome: "Welcome to Hostel Complaint Management",
        studentLogin: "Student Login",
        wardenLogin: "Manager / Warden Login",
        selectRole: "Select Your Role",
        signup: "Sign Up",
        login: "Login",
        dashboard: "Dashboard",
        newComplaint: "New Complaint",
        complaints: "Complaints",
        status: "Status",
        logout: "Logout",
        // Categories
        Infrastructure: "Infrastructure",
        Plumbing: "Plumbing",
        Electrical: "Electrical",
        Cleanliness: "Cleanliness",
        Security: "Security",
        Internet: "Internet / WiFi",
        // Subcategories
        "Leaking taps or pipes": "Leaking taps or pipes",
        "Clogged drains or sewage backup": "Clogged drains or sewage backup",
        "Broken toilet fittings": "Broken toilet fittings",
        "Lack of hot water": "Lack of hot water",
        "Poor water pressure": "Poor water pressure",
        "Non-functional lights or bulbs": "Non-functional lights or bulbs",
        "Faulty switches and switchboards": "Faulty switches and switchboards",
        "Power outage or irregular supply": "Power outage or irregular supply",
        "Broken or damaged furniture": "Broken or damaged furniture",
        "Pest control problems": "Pest control problems",
        "Cleanliness and hygiene issues": "Cleanliness and hygiene issues",
        "Security and safety concerns": "Security and safety concerns",
        "Infrastructure-related issues": "Infrastructure-related issues",
        "Internet or WiFi connectivity issues": "Internet or WiFi connectivity issues",
        // Status & Notifications
        PENDING: "Pending",
        IN_PROGRESS: "In Progress",
        RESOLVED: "Resolved",
        statusChanged: "Status Updated",
        remarksAdded: "New Remarks",
        yourComplaint: "Your complaint",
        hasBeenUpdated: "has been updated to",
        managerSays: "Manager remarks:",
        notifications: "Notifications",
        noNotifications: "No new notifications",
        markAllRead: "Mark all as read",
        maintenanceUpdate: "Maintenance Update",
        expected: "Expected",
        today: "Today",
        "1h": "In 1 hour",
        "2h": "In 2 hours",
        tomorrow: "Tomorrow",
        "2days": "After 2 days",
        custom: "Custom"
    },
    hi: {
        welcome: "छात्रावास शिकायत प्रबंधन में आपका स्वागत है",
        studentLogin: "छात्र लॉगिन",
        wardenLogin: "प्रबंधक / वार्डन लॉगिन",
        selectRole: "अपनी भूमिका चुनें",
        signup: "साइन अप",
        login: "लॉगिन",
        dashboard: "डैशबोर्ड",
        newComplaint: "नई शिकायत",
        complaints: "शिकायतें",
        status: "स्थिति",
        logout: "लॉग आउट",
        // Categories
        Infrastructure: "बुनियादी ढांचा (Infrastructure)",
        Plumbing: "प्लंबिंग (Plumbing)",
        Electrical: "बिजली (Electrical)",
        Cleanliness: "सफाई (Cleanliness)",
        Security: "सुरक्षा (Security)",
        Internet: "इंटरनेट / वाईफ़ाई",
        // Subcategories
        "Leaking taps or pipes": "नल या पाइप लीक हो रहे हैं",
        "Clogged drains or sewage backup": "नालियां बंद या सीवेज समस्या",
        "Broken toilet fittings": "टूटे हुए शौचालय फिटिंग",
        "Lack of hot water": "गर्म पानी नहीं आ रहा",
        "Poor water pressure": "पानी का दबाव कम है",
        "Non-functional lights or bulbs": "खराब लाइट्स या बल्ब",
        "Faulty switches and switchboards": "खराब स्विच या बोर्ड",
        "Power outage or irregular supply": "बिजली कटौती या अनियमित आपूर्ति",
        "Broken or damaged furniture": "टूटा हुआ फर्नीचर",
        "Pest control problems": "कीट नियंत्रण की समस्या (Pest Control)",
        "Cleanliness and hygiene issues": "सफाई और स्वच्छता के मुद्दे",
        "Security and safety concerns": "सुरक्षा और बचाव की चिंता",
        "Infrastructure-related issues": "ढांचे से संबंधित मुद्दे",
        "Internet or WiFi connectivity issues": "इंटरनेट या वाईफ़ाई की समस्या",
        // Status & Notifications
        PENDING: "लंबित (Pending)",
        IN_PROGRESS: "प्रक्रिया में (In Progress)",
        RESOLVED: "निस्तारित (Resolved)",
        statusChanged: "स्थिति अपडेट",
        remarksAdded: "नई टिप्पणी",
        yourComplaint: "आपकी शिकायत",
        hasBeenUpdated: "अपडेट की गई है:",
        managerSays: "प्रबंधक की टिप्पणी:",
        notifications: "सूचनाएं",
        noNotifications: "कोई नई सूचना नहीं",
        markAllRead: "सभी को पढ़ा हुआ मार्क करें",
        maintenanceUpdate: "रखरखाव अपडेट (Maintenance Update)",
        expected: "अपेक्षित समय",
        today: "आज",
        "1h": "1 घंटे में",
        "2h": "2 घंटे में",
        tomorrow: "कल",
        "2days": "2 दिनों के बाद",
        custom: "कस्टम"
    },
    kn: {
        welcome: "ಹಾಸ್ಟೆಲ್ ದೂರು ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆಗೆ ಸ್ವಾಗತ",
        studentLogin: "ವಿದ್ಯಾರ್ಥಿ ಲಾಗಿನ್",
        wardenLogin: "ವಾರ್ಡನ್ ಲಾಗಿನ್",
        selectRole: "ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        signup: "ಸೈನ್ ಅಪ್",
        login: "ಲಾಗಿನ್",
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        newComplaint: "ಹೊಸ ದೂರು",
        complaints: "ದೂರುಗಳು",
        status: "ಸ್ಥಿತಿ",
        logout: "ಲಾಗ್ ಔಟ್",
        // Categories
        Infrastructure: "ಮೂಲಸೌಕರ್ಯ (Infrastructure)",
        Plumbing: "ಪ್ಲಂಬಿಂಗ್ (Plumbing)",
        Electrical: "ವಿದ್ಯುತ್ (Electrical)",
        Cleanliness: "ಸ್ವಚ್ಛತೆ (Cleanliness)",
        Security: "ಭದ್ರತೆ (Security)",
        Internet: "ಇಂಟರ್ನೆಟ್ / ವೈಫೈ",
        // Subcategories
        "Leaking taps or pipes": "ನಲ್ಲಿ ಅಥವಾ ಪೈಪ್ ಸೋರಿಕೆ",
        "Clogged drains or sewage backup": "ಚರಂಡಿ ಅಥವಾ ಒಳಚರಂಡಿ ಕಟ್ಟುವಿಕೆ",
        "Broken toilet fittings": "ಕೆಟ್ಟ ಶೌಚಾಲಯ ಫಿಟ್ಟಿಂಗ್‌ಗಳು",
        "Lack of hot water": "ಬಿಸಿ ನೀರು ಬರುತ್ತಿಲ್ಲ",
        "Poor water pressure": "ನೀರಿನ ಒತ್ತಡ ಕಡಿಮೆ ಇದೆ",
        "Non-functional lights or bulbs": "ಕೆಟ್ಟ ಲೈಟ್ ಅಥವಾ ಬಲ್ಬ್",
        "Faulty switches and switchboards": "ಕೆಟ್ಟ ಸ್ವಿಚ್ ಅಥವಾ ಬೋರ್ಡ್",
        "Power outage or irregular supply": "ವಿದ್ಯುತ್ ಕಡಿತ ಅಥವಾ ಅನಿಯಮಿತ ಪೂರೈಕೆ",
        "Broken or damaged furniture": "ಮುರಿದ ಅಥವಾ ಹಾಳಾದ ಪೀಠೋಪಕರಣಗಳು",
        "Pest control problems": "ಕೀಟ ಸಮಸ್ಯೆಗಳು",
        "Cleanliness and hygiene issues": "ಸ್ವಚ್ಛತೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ ಸಮಸ್ಯೆಗಳು",
        "Security and safety concerns": "ಭದ್ರತೆ ಮತ್ತು ಸುರಕ್ಷತೆಯ ಚಿಂತೆ",
        "Infrastructure-related issues": "ಮೂಲಸೌಕರ್ಯ ಸಂಬಂಧಿತ ಸಮಸ್ಯೆಗಳು",
        "Internet or WiFi connectivity issues": "ಇಂಟರ್ನೆಟ್ ಅಥವಾ ವೈಫೈ ಸಮಸ್ಯೆಗಳು",
        // Status & Notifications
        PENDING: "ಬಾಕಿ ಇದೆ (Pending)",
        IN_PROGRESS: "ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)",
        RESOLVED: "ಬಗೆಹರಿಸಲಾಗಿದೆ (Resolved)",
        statusChanged: "ಸ್ಥಿತಿ ನವೀಕರಣ",
        remarksAdded: "ಹೊಸ ಟಿಪ್ಪಣಿಗಳು",
        yourComplaint: "ನಿಮ್ಮ ದೂರು",
        hasBeenUpdated: "ನವೀಕರಿಸಲಾಗಿದೆ:",
        managerSays: "ವ್ಯವಸ್ಥಾಪಕರ ಟಿಪ್ಪಣಿ:",
        notifications: "ಸೂಚನೆಗಳು",
        noNotifications: "ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ",
        markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",
        maintenanceUpdate: "ನಿರ್ವಹಣಾ ನವೀಕರಣ (Maintenance Update)",
        expected: "ನಿರೀಕ್ಷಿತ ಸಮಯ",
        today: "ಇಂದು",
        "1h": "1 ಗಂಟೆಯಲ್ಲಿ",
        "2h": "2 ಗಂಟೆಯಲ್ಲಿ",
        tomorrow: "ನಾಳೆ",
        "2days": "2 ದಿನಗಳ ನಂತರ",
        custom: "ಕಸ್ಟಮ್"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        // @ts-ignore
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
