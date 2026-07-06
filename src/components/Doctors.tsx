import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, Calendar, Clock, Phone, Plus, Edit2, Trash2, 
  Send, User, AlertCircle, CheckCircle2, UserPlus, Sparkles, BellRing,
  Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Doctor, AppSettings } from '../types';
import { sendWhatsAppMessage } from '../utils/whatsapp';

interface DoctorsProps {
  doctors: Doctor[];
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor: (doc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  settings: AppSettings;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Doctors({
  doctors,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  settings,
  theme
}: DoctorsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Carousel slider and database UI states
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeSettingsCardId, setActiveSettingsCardId] = useState<string | null>(null);
  const [showRawTable, setShowRawTable] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Dokter Umum');
  const [phone, setPhone] = useState('');
  const [scheduleHours, setScheduleHours] = useState('08:00 - 14:00');
  const [dutyDays, setDutyDays] = useState<string[]>(['Senin']);
  const [status, setStatus] = useState<'Aktif' | 'Istirahat' | 'Libur'>('Aktif');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');

  const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  const SPECIALIZATIONS = [
    'Dokter Umum',
    'Spesialis Anak',
    'Spesialis Penyakit Dalam',
    'Spesialis Kandungan (Obgyn)',
    'Spesialis Kulit & Kelamin',
    'Spesialis Mata',
    'Spesialis Jantung',
    'Spesialis Saraf',
    'Dokter Gigi'
  ];

  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-white shadow-3d-button text-[var(--grad-end)] hover:bg-[var(--color-input-bg)] ',
          accent: 'indigo',
          border: 'border-transparent',
          bgLight: 'bg-[var(--color-input-bg)] shadow-inner/30',
          accentText: 'text-[var(--grad-end)]',
          badge: 'bg-[var(--color-input-bg)] shadow-inner text-[var(--grad-start)] border-transparent'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          bgLight: 'bg-emerald-50/30',
          accentText: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          bgLight: 'bg-sky-50/30',
          accentText: 'text-sky-600',
          badge: 'bg-sky-50 text-sky-700 border-sky-100'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          bgLight: 'bg-orange-50/30',
          accentText: 'text-orange-600',
          badge: 'bg-orange-50 text-orange-700 border-orange-100'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          bgLight: 'bg-rose-50/30',
          accentText: 'text-rose-600',
          badge: 'bg-rose-50 text-rose-700 border-rose-100'
        };
    }
  };

  const style = getThemeStyles();

  // Get current day name in Indonesian
  const getCurrentDayName = () => {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return daysIndo[new Date().getDay()];
  };

  const currentDay = getCurrentDayName();
  const doctorsOnDutyToday = doctors.filter(doc => doc.dutyDays.includes(currentDay));

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setSpecialization('Dokter Umum');
    setPhone('');
    setScheduleHours('08:00 - 14:00');
    setDutyDays(['Senin']);
    setStatus('Aktif');
    setGender('Laki-laki');
    setShowModal(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setSpecialization(doc.specialization);
    setPhone(doc.phone);
    setScheduleHours(doc.scheduleHours);
    setDutyDays(doc.dutyDays);
    setStatus(doc.status);
    setGender(doc.gender || 'Laki-laki');
    setShowModal(true);
  };

  const handleDayToggle = (day: string) => {
    if (dutyDays.includes(day)) {
      setDutyDays(dutyDays.filter(d => d !== day));
    } else {
      setDutyDays([...dutyDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || dutyDays.length === 0) {
      alert('Mohon isi nama, telepon, dan minimal pilih satu hari jaga!');
      return;
    }

    const doctorData: Doctor = {
      id: editingDoctor ? editingDoctor.id : `doc-${Date.now()}`,
      name,
      specialization,
      phone,
      scheduleHours,
      dutyDays,
      status,
      gender
    };

    if (editingDoctor) {
      onUpdateDoctor(doctorData);
      alert('Data dokter berhasil diperbarui!');
    } else {
      onAddDoctor(doctorData);
      alert('Dokter baru berhasil ditambahkan!');
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data dokter ini?')) {
      onDeleteDoctor(id);
    }
  };

  // Kirim WhatsApp pengingat jaga ke dokter
  const handleSendShiftReminder = async (doc: Doctor) => {
    const message = `Halo ${doc.name},\n\nMengingatkan jadwal jaga Anda di *${settings.companyName}* pada hari ini (*${currentDay}*) jam *${doc.scheduleHours}*.\n\nMohon hadir tepat waktu. Terima kasih dan selamat melayani!\n\n-- System Auto-Reminder ApoCute`;
    
    try {
      await sendWhatsAppMessage(settings, doc.phone, doc.name, message, 'shift_jaga');
      alert(`WhatsApp Pengingat Jaga berhasil dikirim ke ${doc.name}!`);
    } catch (e) {
      alert('Gagal mengirim WhatsApp pengingat jaga.');
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans text-[var(--text-primary)]">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Doctors */}
        <div className="bg-[var(--color-card-bg)] p-5 rounded-3xl border border-white/50 shadow-3d-card flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${style.bgLight} ${style.accentText}`}>
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">Total Dokter</span>
            <span className="text-xl font-display font-black text-[var(--text-primary)]">{doctors.length}</span>
            <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">Terdaftar di sistem</span>
          </div>
        </div>

        {/* Doctors Active Today */}
        <div className="bg-[var(--color-card-bg)] p-5 rounded-3xl border border-white/50 shadow-3d-card flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">Dokter Jaga Hari Ini</span>
            <span className="text-xl font-display font-black text-[var(--text-primary)]">{doctorsOnDutyToday.length}</span>
            <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold">Hari: {currentDay}</span>
          </div>
        </div>

        {/* Shift Warning */}
        <div className="bg-[var(--color-card-bg)] p-5 rounded-3xl border border-white/50 shadow-3d-card flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">Pengingat Jadwal Jaga</span>
            <button 
              onClick={() => {
                if (doctorsOnDutyToday.length === 0) {
                  alert('Tidak ada dokter yang bertugas hari ini.');
                  return;
                }
                doctorsOnDutyToday.forEach(doc => handleSendShiftReminder(doc));
                alert('Mengirimkan pengingat massal WhatsApp ke semua dokter jaga hari ini!');
              }}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg ${style.primary} mt-1 inline-block shrink-0 shadow-3xs`}
            >
              Kirim Semua Pengingat Jaga (WA)
            </button>
          </div>
        </div>
      </div>

      {/* 2. ROSTER TODAY PANEL */}
      <div className="bg-[var(--color-card-bg)] p-6 rounded-[2rem] shadow-3d-card border border-white/50 space-y-4">
        <div className="flex justify-between items-center border-b border-transparent pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm">Jadwal Tugas Hari Ini ({currentDay})</h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className={`px-4 py-2 rounded-xl font-display font-bold text-[10px] shadow-sm flex items-center gap-1.5 transition-all ${style.primary}`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Dokter Baru
          </button>
        </div>

        {doctorsOnDutyToday.length === 0 ? (
          <div className="p-8 bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl text-center text-[var(--text-muted)] space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-[11px]">Tidak ada jadwal praktek dokter hari ini ({currentDay})</p>
            <p className="text-[10px]">Silakan edit data dokter untuk mengatur ulang hari tugas mereka.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsOnDutyToday.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 hover:shadow-2xs transition-all relative overflow-hidden group"
              >
                {/* Status indicator badge */}
                <span className={`absolute top-3 right-3 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                  doc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                  doc.status === 'Istirahat' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {doc.status}
                </span>

                <div className="space-y-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md inline-block mb-1">
                      {doc.specialization}
                    </span>
                    <h4 className="font-display font-bold text-[var(--text-primary)] text-xs truncate pr-14">{doc.name}</h4>
                  </div>

                  <div className="space-y-1 font-mono text-[10px] text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{doc.scheduleHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{doc.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-transparent flex justify-between items-center">
                    <button
                      onClick={() => handleSendShiftReminder(doc)}
                      className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50"
                    >
                      <Send className="w-3 h-3" />
                      Pengingat Jaga WA
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-1.5 bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] text-[var(--text-secondary)] rounded-lg transition-all"
                        title="Edit Dokter"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                        title="Hapus Dokter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ALL DOCTORS LIST DATABASE (MODERN SLIDER WITH ID CARDS) */}
      <div className="bg-[var(--color-card-bg)] p-6 rounded-[2rem] shadow-3d-card border border-white/50 space-y-4">
        <div className="flex justify-between items-center border-b border-transparent pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 0" />
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm">
              Slide Showcase & Database Dokter ({doctors.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowRawTable(!showRawTable)}
            className="text-[10px] text-[var(--grad-end)] font-bold hover:underline transition-all cursor-pointer"
          >
            {showRawTable ? 'Sembunyikan Format Tabel' : 'Tampilkan Format Tabel'}
          </button>
        </div>

        {/* MODERN SLIDER SECTION */}
        {doctors.length === 0 ? (
          <div className="p-8 bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl text-center text-[var(--text-muted)] space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-[11px]">Database Dokter Kosong</p>
            <p className="text-[10px]">Silakan klik tombol "Tambah Dokter" untuk mendaftarkan dokter baru.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Slide view container with sliding layout */}
            <div className="overflow-hidden rounded-[32px] p-1">
              <div 
                className="flex gap-5 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${slideIndex * (310 + 20)}px)` }}
              >
                {doctors.map((doc) => {
                  const avatarSeed = (doc.gender === 'Perempuan' || doc.name.toLowerCase().includes('sarah') || doc.name.toLowerCase().includes('amalia') || doc.name.toLowerCase().includes('putri')) ? 'female' : 'male';
                  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}-${encodeURIComponent(doc.name)}&backgroundColor=transparent`;
                  const isSettingsOpen = activeSettingsCardId === doc.id;
                  
                  return (
                    <div 
                      key={doc.id}
                      className="w-[310px] h-[460px] bg-[var(--color-card-bg)] rounded-[2rem] shadow-3d-card border border-white/50 relative overflow-hidden flex flex-col justify-between shrink-0 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Top Bar inside Card */}
                      <div className="p-5 pb-0 flex justify-between items-start z-10">
                        {/* Holographic Logo badge */}
                        <div className="flex items-center gap-1.5 bg-[var(--color-input-bg)] shadow-3d-input border-transparent border-transparent rounded-xl px-2.5 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-mono font-bold tracking-widest text-[var(--text-secondary)] uppercase">APOCUTE CLINIC</span>
                        </div>

                        {/* Settings Button */}
                        <button
                          type="button"
                          onClick={() => setActiveSettingsCardId(isSettingsOpen ? null : doc.id)}
                          className={`p-2 rounded-xl border-transparent transition-all cursor-pointer ${
                            isSettingsOpen 
                              ? 'bg-[var(--grad-end)] text-white border-transparent' 
                              : 'bg-[var(--color-input-bg)] shadow-3d-input border-transparent hover:bg-[var(--color-input-bg)] shadow-inner text-[var(--text-secondary)]'
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Photo / Avatar Section with big overlapping transparent portrait */}
                      <div className="relative flex-1 flex flex-col items-center justify-center -mt-6">
                        {/* Backdrop decorative glowing ring */}
                        <div className="absolute w-36 h-36 rounded-full bg-radial from-indigo-100 to-transparent opacity-80" />
                        
                        {/* Big transparent photo (remove bg) */}
                        <img
                          src={avatarUrl}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-40 h-40 object-contain z-10 drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Card Info details */}
                      <div className="p-5 pt-0 text-center space-y-2.5 z-10">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider ${style.badge}`}>
                            {doc.specialization}
                          </span>
                          <h4 className="font-display font-black text-[var(--text-primary)] text-sm tracking-tight mt-1 truncate">{doc.name}</h4>
                          <span className="text-[8px] font-mono text-[var(--text-muted)] block mt-0.5">SIP. {doc.id.toUpperCase()}/MED-REG/2026</span>
                        </div>

                        {/* Interactive info fields */}
                        <div className="grid grid-cols-2 gap-2 bg-[var(--color-input-bg)] shadow-3d-input border-transparent p-2.5 rounded-2xl border border-transparent text-left">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-[var(--text-muted)] block uppercase font-bold">Jam Praktek</span>
                            <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] truncate block">{doc.scheduleHours}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-[var(--text-muted)] block uppercase font-bold">HP/WhatsApp</span>
                            <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] truncate block">{doc.phone}</span>
                          </div>
                        </div>

                        {/* On-Duty Days and Status indicator */}
                        <div className="flex justify-between items-center text-[8px] pt-1 border-t border-transparent/60">
                          <div className="flex gap-0.5 flex-wrap max-w-[170px]">
                            {doc.dutyDays.map((d) => (
                              <span key={d} className="bg-[var(--color-input-bg)] shadow-inner text-[var(--text-secondary)] font-bold px-1.5 py-0.5 rounded-md">
                                {d.slice(0, 3)}
                              </span>
                            ))}
                          </div>

                          <span className={`font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            doc.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            doc.status === 'Istirahat' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${doc.status === 'Aktif' ? 'bg-emerald-500 animate-pulse' : doc.status === 'Istirahat' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            {doc.status}
                          </span>
                        </div>
                      </div>

                      {/* SETTINGS CARD OVERLAY (Slide out options drawer) */}
                      <AnimatePresence>
                        {isSettingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            className="absolute inset-0 bg-[var(--color-card-bg)]/95 backdrop-blur-md z-20 p-5 flex flex-col justify-between text-[var(--text-primary)]"
                          >
                            <div className="space-y-4">
                              {/* Overlay Header */}
                              <div className="flex justify-between items-center border-b border-transparent pb-2">
                                <div>
                                  <span className="text-[8px] text-[var(--grad-end)] font-mono block uppercase">Kelola ID Card</span>
                                  <h5 className="font-display font-bold text-xs truncate max-w-[200px] text-[var(--text-primary)]">{doc.name}</h5>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveSettingsCardId(null)}
                                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 text-xs cursor-pointer"
                                >
                                  Tutup
                                </button>
                              </div>

                              {/* Action options */}
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    setActiveSettingsCardId(null);
                                    handleOpenEditModal(doc);
                                  }}
                                  className="w-full bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] active:shadow-3d-input text-[var(--text-secondary)] font-bold py-2.5 px-3.5 rounded-xl text-[10px] flex items-center gap-2 transition-all border border-transparent/80 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[var(--grad-end)]" />
                                  Ubah Informasi Dokter
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setActiveSettingsCardId(null);
                                    handleSendShiftReminder(doc);
                                  }}
                                  className="w-full bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] active:shadow-3d-input text-[var(--text-secondary)] font-bold py-2.5 px-3.5 rounded-xl text-[10px] flex items-center gap-2 transition-all border border-transparent/80 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                                  Kirim Pengingat Jadwal (WA)
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveSettingsCardId(null);
                                    handleDelete(doc.id);
                                  }}
                                  className="w-full bg-rose-950/40 hover:bg-rose-900/55 text-rose-300 font-bold py-2.5 px-3.5 rounded-xl text-[10px] flex items-center gap-2 transition-all border border-rose-900/60 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  Hapus Data Dokter
                                </button>
                              </div>

                              {/* Quick status selection inside overlay */}
                              <div className="space-y-1.5 pt-1.5">
                                <span className="text-[8px] text-[var(--text-muted)] font-mono block uppercase">Status Kehadiran</span>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {['Aktif', 'Istirahat', 'Libur'].map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => {
                                        onUpdateDoctor({ ...doc, status: st as any });
                                        setActiveSettingsCardId(null);
                                      }}
                                      className={`py-1 rounded-lg text-[9px] font-bold border transition-all text-center cursor-pointer ${
                                        doc.status === st
                                          ? 'bg-[var(--grad-end)] border-transparent text-white'
                                          : 'bg-[var(--color-input-bg)] shadow-3d-input border-transparent text-[var(--text-secondary)] hover:bg-white'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <p className="text-[8px] text-[var(--text-secondary)] text-center font-mono">
                              APOCUTE SECURE ID • {doc.id.toUpperCase()}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider Controls */}
            {doctors.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                {/* Dots layout */}
                <div className="flex gap-1">
                  {Array.from({ length: doctors.length }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        slideIndex === idx ? 'w-5 bg-[var(--grad-end)]' : 'w-1.5 bg-white shadow-3d-button'
                      }`}
                    />
                  ))}
                </div>

                {/* Left/Right arrows */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSlideIndex((prev) => (prev > 0 ? prev - 1 : doctors.length - 1))}
                    className="w-8 h-8 rounded-xl bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] border-transparent active:shadow-3d-input text-[var(--text-secondary)] border-transparent shadow-3xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideIndex((prev) => (prev < doctors.length - 1 ? prev + 1 : 0))}
                    className="w-8 h-8 rounded-xl bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] border-transparent active:shadow-3d-input text-[var(--text-secondary)] border-transparent shadow-3xs flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RAW DATABASE TABLE FORMAT (EXPANDABLE/COLLAPSIBLE) */}
        {showRawTable && doctors.length > 0 && (
          <div className="overflow-x-auto border-t border-transparent pt-4 mt-4 animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-transparent text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Dokter</th>
                  <th className="py-3 px-4">Spesialisasi</th>
                  <th className="py-3 px-4">Telepon (WA)</th>
                  <th className="py-3 px-4">Hari Jaga</th>
                  <th className="py-3 px-4">Jam Jaga</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--color-input-bg)] shadow-3d-input border-transparent/50 transition-all text-[11px]">
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{doc.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${style.badge}`}>
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{doc.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {doc.dutyDays.map((d) => (
                          <span key={d} className="bg-[var(--color-input-bg)] shadow-inner text-[var(--text-secondary)] text-[8px] font-bold px-1.5 py-0.5 rounded">
                            {d.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{doc.scheduleHours}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                        doc.status === 'Aktif' ? 'bg-emerald-500' :
                        doc.status === 'Istirahat' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`} />
                      <span className="font-bold text-[var(--text-secondary)]">{doc.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleSendShiftReminder(doc)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all cursor-pointer"
                          title="Kirim WA"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] text-[var(--text-secondary)] rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. DIALOG MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/10 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-card-bg)] w-full max-w-lg rounded-[2rem] shadow-3d-card border border-white/50 overflow-hidden relative z-10"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-bg-light)] p-5 mb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  <h4 className="font-display font-bold text-sm">
                    {editingDoctor ? 'Edit Data Dokter Jaga' : 'Tambah Dokter Jaga Baru'}
                  </h4>
                </div>
                <button onClick={() => setShowModal(false)} className="text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] font-bold text-sm">
                  Tutup
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Row 1: Name and Specialty */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Nama Dokter</label>
                    <input
                      type="text"
                      placeholder="dr. Contoh Dokter, Sp.A"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-2 px-3 text-xs focus:outline-none "
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Spesialisasi</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-2 px-3 text-xs focus:outline-none "
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Phone & Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Nomor HP/WA</label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-2 px-3 text-xs focus:outline-none  font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Jam Praktek</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00 - 14:00"
                      required
                      value={scheduleHours}
                      onChange={(e) => setScheduleHours(e.target.value)}
                      className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-2 px-3 text-xs focus:outline-none "
                    />
                  </div>
                </div>

                {/* Row 3: Duty Status & Gender Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Status Kehadiran</label>
                    <div className="flex gap-4 pt-1">
                      {['Aktif', 'Istirahat', 'Libur'].map((st) => (
                        <label key={st} className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="status"
                            value={st}
                            checked={status === st}
                            onChange={() => setStatus(st as any)}
                            className="text-[var(--grad-end)] "
                          />
                          <span className="text-[11px] text-[var(--text-secondary)]">{st}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Jenis Kelamin</label>
                    <div className="flex gap-4 pt-1">
                      {['Laki-laki', 'Perempuan'].map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g as any)}
                            className="text-[var(--grad-end)] "
                          />
                          <span className="text-[11px] text-[var(--text-secondary)]">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 4: Multi Day Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Hari Jaga</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const active = dutyDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all text-center ${
                            active 
                              ? 'bg-[var(--grad-end)] text-[var(--text-primary)] border-transparent shadow-3xs' 
                              : 'bg-[var(--color-input-bg)] shadow-3d-input border-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--color-input-bg)] shadow-inner'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-transparent flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] text-[var(--text-secondary)] rounded-xl font-bold font-display"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl font-bold font-display flex items-center gap-1 shadow-sm ${style.primary}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Dokter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
