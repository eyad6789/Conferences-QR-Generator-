import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, User, Mail, Github, Calendar, MapPin, Ticket as TicketIcon, Users, TrendingUp, Search, Languages, QrCode, CheckCircle, XCircle } from 'lucide-react';

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
    success: "Success!",
    qrCode: "QR Code",
    scanQR: "Scan QR Code",
    verifyTicket: "Verify Ticket",
    ticketValid: "Ticket is valid!",
    ticketInvalid: "Ticket is invalid!",
    downloadQR: "Download QR Code"
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
    success: "نجح!",
    qrCode: "رمز الاستجابة السريعة",
    scanQR: "مسح رمز الاستجابة السريعة",
    verifyTicket: "التحقق من التذكرة",
    ticketValid: "التذكرة صالحة!",
    ticketInvalid: "التذكرة غير صالحة!",
    downloadQR: "تحميل رمز الاستجابة السريعة"
  }
};

// API base URL - update this based on your backend
const API_BASE_URL = 'http://localhost:5000';

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

// Ticket Display Component
const TicketDisplay = ({ participant }) => {
  const { t } = useLanguage();
  
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
              <TicketIcon className="w-6 h-6 text-white" />
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
                src={`${API_BASE_URL}/uploads/${participant.avatar_filename}`}
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
          <div className="mb-4">
            {participant.qr_code_filename ? (
              <img
                src={`${API_BASE_URL}/qr_codes/${participant.qr_code_filename}`}
                alt="QR Code"
                className="w-20 h-20 rounded-lg bg-white p-1"
              />
            ) : (
              <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded opacity-50"></div>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs mb-1">{t('ticketId')}</p>
            <p className="text-white font-mono font-bold text-sm">#{participant.ticket_id}</p>
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
      const response = await fetch(`${API_BASE_URL}/api/register`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <LanguageToggle />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <TicketIcon className="w-8 h-8 text-white" />
          </div>
          
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {t('title')}
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  {t('subtitle')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {t('congratulations')}, {participant?.full_name}!
                </h1>
                <p className="text-xl text-white/80 mb-2">
                  {t('ticketReady')}
                </p>
                <p className="text-white/60">
                  {t('emailSent')} <span className="text-purple-300">{participant?.email}</span><br/>
                  {t('andWillSend')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RegistrationForm onSuccess={handleSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TicketDisplay participant={participant} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/admin')}
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            {t('dashboard')} →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// QR Verification Component
const QRVerification = () => {
  const { t } = useLanguage();
  const [ticketId, setTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const verifyTicket = async (id) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify/${id}`);
      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, error: t('error') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = ticketId.replace('#', '').trim();
    verifyTicket(cleanId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <LanguageToggle />
        
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            {t('verifyTicket')}
          </motion.h1>
          
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
          >
            ← {t('dashboard')}
          </button>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('scanQR')}</h2>
              <p className="text-white/60">Enter ticket ID to verify authenticity</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('ticketId')}
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="#TC123456"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? t('loading') : t('verifyTicket')}
              </button>
            </form>

            <AnimatePresence>
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                    verificationResult.valid 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">{t('ticketValid')}</p>
                        {verificationResult.participant && (
                          <p className="text-green-300 text-sm">
                            {verificationResult.participant.full_name}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-red-400 font-medium">{t('ticketInvalid')}</p>
                        <p className="text-red-300 text-sm">Ticket not found in database</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

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
        fetch(`${API_BASE_URL}/api/participants`),
        fetch(`${API_BASE_URL}/api/stats`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
      {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
       */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <LanguageToggle />
        
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            {t('dashboard')}
          </motion.h1>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/verify')}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {t('verifyTicket')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
            >
              ← Home
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">{t('totalParticipants')}</p>
                <p className="text-white text-2xl font-bold">{stats.total_participants || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">{t('todayRegistrations')}</p>
                <p className="text-white text-2xl font-bold">{stats.today_registrations || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Participants Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Avatar</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">{t('fullName')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">{t('emailAddress')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">GitHub</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">{t('ticketId')}</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">{t('registrationDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <AnimatePresence>
                  {filteredParticipants.map((participant, index) => (
                    <motion.tr
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {participant.avatar_filename ? (
                          <img
                            src={`${API_BASE_URL}/uploads/${participant.avatar_filename}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{participant.full_name}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{participant.email}</td>
                      <td className="px-6 py-4 text-sm text-white/80">@{participant.github_username}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {participant.qr_code_filename && (
                            <a
                              href={`${API_BASE_URL}/qr_codes/${participant.qr_code_filename}`}
                              download={`ticket-${participant.ticket_id}-qr.png`}
                              className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
                              title={t('downloadQR')}
                            >
                              <QrCode className="w-4 h-4 text-white" />
                            </a>
                          )}
                          <span className="text-purple-300 font-mono">#{participant.ticket_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(participant.registration_date).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12 text-white/60">
              {searchTerm ? `No participants found for "${searchTerm}"` : 'No participants yet'}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/verify" element={<QRVerification />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;