import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, User, Mail, Github, Calendar, MapPin, Ticket, Users, TrendingUp, Search, Languages } from 'lucide-react';

// Language Context
const LanguageContext = createContext();
const useLanguage = () => useContext(LanguageContext);

// Translations
const translations = {
  en: {
    title: "Your Journey to Coding Conf 2025 Starts Here!",
    subtitle: "Secure your spot at next year's biggest coding conference.",
    uploadAvatar: "Upload Avatar",
    dragDrop: "Drag and drop or click to upload",
    uploadNote: "Upload your photo (JPG or PNG, max size: 500KB).",
    fullName: "Full Name",
    emailAddress: "Email Address",
    githubUsername: "GitHub Username",
    generateTicket: "Generate My Ticket",
    removeImage: "Remove Image",
    changeImage: "Change Image",
    congratulations: "Congratulations",
    ticketReady: "Your ticket is ready.",
    emailSent: "We've emailed your ticket to",
    andWillSend: "and will send updates in the run up to the event.",
    participants: "Participants",
    dashboard: "Admin Dashboard",
    totalParticipants: "Total Participants",
    todayRegistrations: "Today's Registrations",
    searchPlaceholder: "Search participants...",
    registrationDate: "Registration Date",
    ticketId: "Ticket ID",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success!"
  },
  ar: {
    title: "رحلتك إلى مؤتمر البرمجة 2025 تبدأ هنا!",
    subtitle: "احجز مكانك في أكبر مؤتمر برمجة العام القادم.",
    uploadAvatar: "رفع الصورة الشخصية",
    dragDrop: "اسحب وأفلت أو انقر للرفع",
    uploadNote: "ارفع صورتك (JPG أو PNG، الحد الأقصى: 500 كيلوبايت).",
    fullName: "الاسم الكامل",
    emailAddress: "عنوان البريد الإلكتروني",
    githubUsername: "اسم المستخدم في GitHub",
    generateTicket: "إنشاء تذكرتي",
    removeImage: "إزالة الصورة",
    changeImage: "تغيير الصورة",
    congratulations: "تهانينا",
    ticketReady: "تذكرتك جاهزة.",
    emailSent: "لقد أرسلنا تذكرتك إلى",
    andWillSend: "وسنرسل التحديثات قبل الحدث.",
    participants: "المشاركون",
    dashboard: "لوحة الإدارة",
    totalParticipants: "إجمالي المشاركين",
    todayRegistrations: "تسجيلات اليوم",
    searchPlaceholder: "البحث عن المشاركين...",
    registrationDate: "تاريخ التسجيل",
    ticketId: "رقم التذكرة",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "نجح!"
  }
};

// Language Provider
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(language === 'ar');
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Language Toggle Component
const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
    </button>
  );
};

// Image Upload Component
const ImageUpload = ({ onImageChange, imageUrl, onRemove }) => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleFile(files[0]);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 500000) {
        alert('File size exceeds 500KB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => onImageChange(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <label className="block text-sm font-medium text-white mb-2">
        {t('uploadAvatar')}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-purple-400 bg-purple-500/20' 
            : 'border-white/40 bg-white/5 hover:bg-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('avatar-input').click()}
      >
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                <img
                  src={imageUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                >
                  {t('removeImage')}
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                >
                  {t('changeImage')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
              <Upload className="w-12 h-12 text-white/60" />
              <p className="text-white/80 text-sm">{t('dragDrop')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-xs text-white/60 mt-2">{t('uploadNote')}</p>
    </motion.div>
  );
};

// Ticket Component
const Ticket = ({ participant }) => {
  const { t, isRTL } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto"
    >
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Coding Conf 2025</h3>
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Austin, TX
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {participant.avatar_filename ? (
              <img
                src={`/uploads/${participant.avatar_filename}`}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-white font-bold text-xl">{participant.full_name}</h2>
              <p className="text-white/80">@{participant.github_username}</p>
            </div>
          </div>
        </div>
        
        <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        
        <div className="w-32 flex flex-col items-center justify-center p-4 bg-white/5">
          <div className="transform rotate-90 whitespace-nowrap">
            <p className="text-white/60 text-sm mb-1">{t('ticketId')}</p>
            <p className="text-white font-mono font-bold">#{participant.ticket_id}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Registration Form Component
const RegistrationForm = ({ onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    github_username: '',
    avatar: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        onSuccess(result.participant);
      } else {
        alert(result.error || t('error'));
      }
    } catch (error) {
      alert(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUpload
          onImageChange={(imageData) => setFormData(prev => ({ ...prev, avatar: imageData }))}
          imageUrl={formData.avatar}
          onRemove={() => setFormData(prev => ({ ...prev, avatar: null }))}
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <User className="inline w-4 h-4 mr-2" />
              {t('fullName')}
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              {t('emailAddress')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="example@email.com"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Github className="inline w-4 h-4 mr-2" />
              {t('githubUsername')}
            </label>
            <input
              type="text"
              required
              value={formData.github_username}
              onChange={(e) => setFormData(prev => ({ ...prev, github_username: e.target.value }))}
              placeholder="@yourusername"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('loading') : t('generateTicket')}
        </motion.button>
      </form>
    </motion.div>
  );
};

// Home Page Component
const HomePage = () => {
  const { t } = useLanguage();
  const [participant, setParticipant] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = (participantData) => {
    setParticipant(participantData);
    setShowSuccess(true);
  };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
//       <div className="relative z-10 container mx-auto px-4 py-8">
//         <LanguageToggle />
        
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-12"
//         >
//           <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
//             <Ticket className="w-8 h-8 text-white" />
//           </div>
          
//           <AnimatePresence mode="wait">
//             {!showSuccess ? (
//               <motion.div
//                 key="form-header"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               >
//                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
//                   {t('title')}
//                 </h1>
//                 <p className="text-xl text-white/80 mb-8">
//                   {t('subtitle')}
//                 </p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="success-header"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 className="mb-8"
//               >
//                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
//                   {t('congratulations')}, {participant?.full_name}!
//                 </h1>
//                 <p className="text-xl text-white/80 mb-2">
//                   {t('ticketReady')}
//                 </p>
//                 <p className="text-white/60">
//                   {t('emailSent')} <span className="text-purple-300">{participant?.email}</span><br/>
//                   {t('andWillSend')}
//                 </p>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>

//         <AnimatePresence mode="wait">
//           {!showSuccess ? (
//             <motion.div
//               key="form"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <RegistrationForm onSuccess={handleSuccess} />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="ticket"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//             >
//               <Ticket participant={participant} />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="text-center mt-12"
//         >
//           <button
//             onClick={() => navigate('/admin')}
//             className="text-white/60 hover:text-white/80 transition-colors text-sm"
//           >
//             {t('dashboard')} →
//           </button>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// Admin Dashboard Component
const AdminDashboard = () => {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [participantsRes, statsRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/stats')
      ]);
      
      const participantsData = await participantsRes.json();
      const statsData = await statsRes.json();
      
      setParticipants(participantsData.participants || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.github_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          {t('loading')}
        </motion.div>
      </div>
    );
  }
};
export default function App()
