import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Executive Management Portal": "Executive Management Portal",
      "Sales Executive Portal": "Sales Executive Portal",
      "Home & Strategy Hub": "Home & Strategy Hub",
      "Executive Insights": "Executive Insights",
      "Property Visualization": "Property Visualization",
      "3D Township Explorer": "3D Township Explorer",
      "Compare Properties": "Compare Properties",
      "Sales Intelligence": "Sales Intelligence",
      "Lead Scoring CRM": "Lead Scoring CRM",
      "Inventory Vacancy Map": "Inventory Vacancy Map",
      "Welcome back,": "Welcome back,"
    }
  },
  hi: {
    translation: {
      "Executive Management Portal": "कार्यकारी प्रबंधन पोर्टल",
      "Sales Executive Portal": "बिक्री कार्यकारी पोर्टल",
      "Home & Strategy Hub": "होम और रणनीति हब",
      "Executive Insights": "कार्यकारी अंतर्दृष्टि",
      "Property Visualization": "संपत्ति दृश्य",
      "3D Township Explorer": "3D टाउनशिप एक्सप्लोरर",
      "Compare Properties": "संपत्तियों की तुलना करें",
      "Sales Intelligence": "बिक्री इंटेलिजेंस",
      "Lead Scoring CRM": "लीड स्कोरिंग CRM",
      "Inventory Vacancy Map": "इन्वेंटरी रिक्ति मानचित्र",
      "Welcome back,": "वापसी पर स्वागत है,"
    }
  },
  gu: {
    translation: {
      "Executive Management Portal": "એક્ઝિક્યુટિવ મેનેજમેન્ટ પોર્ટલ",
      "Sales Executive Portal": "સેલ્સ એક્ઝિક્યુટિવ પોર્ટલ",
      "Home & Strategy Hub": "હોમ અને સ્ટ્રેટેજી હબ",
      "Executive Insights": "એક્ઝિક્યુટિવ આંતરદૃષ્ટિ",
      "Property Visualization": "પ્રોપર્ટી વિઝ્યુલાઇઝેશન",
      "3D Township Explorer": "3D ટાઉનશિપ એક્સપ્લોરર",
      "Compare Properties": "પ્રોપર્ટીઝની સરખામણી કરો",
      "Sales Intelligence": "સેલ્સ ઇન્ટેલિજન્સ",
      "Lead Scoring CRM": "લીડ સ્કોરિંગ CRM",
      "Inventory Vacancy Map": "ઇન્વેન્ટરી ખાલી નકશો",
      "Welcome back,": "ફરીથી સ્વાગત છે,"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
