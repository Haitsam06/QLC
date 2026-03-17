'use client';

import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';

export default function Galeri() {
   // Data dummy gambar berdasarkan isi folder public/image/landing/ Anda
   // Properti 'span' digunakan untuk mengatur ukuran bento box di layar medium ke atas
   const galleryItems = [
      // Baris 1 & 2
      {
         id: 1,
         src: '/image/landing/1 (6).png',
         title: 'Halaqah Tahfidz',
         category: 'Akademik',
         span: 'md:col-span-2 md:row-span-2',
      }, // Besar Kiri
      {
         id: 2,
         src: '/image/landing/1 (3).png',
         title: 'Ujian Sertifikasi',
         category: 'Ujian',
         span: 'md:col-span-1 md:row-span-1',
      }, // Kecil Tengah Atas
      {
         id: 3,
         src: '/image/landing/1 (4).png',
         title: 'Kajian & Mabit',
         category: 'Keagamaan',
         span: 'md:col-span-1 md:row-span-2',
      }, // Panjang Kanan
      {
         id: 4,
         src: '/image/landing/1 (5).png',
         title: 'Outbound Santri',
         category: 'Kegiatan',
         span: 'md:col-span-1 md:row-span-1',
      }, // Kecil Tengah Bawah

      // Baris 3
      {
         id: 5,
         src: '/image/landing/1 (1).png',
         title: 'Pelatihan Guru',
         category: 'TFT',
         span: 'md:col-span-2 md:row-span-1',
      }, // Lebar Kiri
      {
         id: 6,
         src: '/image/landing/1 (2).png',
         title: 'Rapat Yayasan',
         category: 'Manajemen',
         span: 'md:col-span-2 md:row-span-1',
      }, // Lebar Kanan

      // Baris 4 & 5
      {
         id: 7,
         src: '/image/landing/1 (7).png',
         title: 'Parenting Class',
         category: 'Kajian',
         span: 'md:col-span-1 md:row-span-2',
      }, // Panjang Kiri
      {
         id: 8,
         src: '/image/landing/1 (8).png',
         title: 'Edukasi Dini',
         category: 'Kids',
         span: 'md:col-span-2 md:row-span-2',
      }, // Besar Tengah
      {
         id: 9,
         src: '/image/landing/1 (9).png',
         title: 'Mentoring Remaja',
         category: 'Teens',
         span: 'md:col-span-1 md:row-span-2',
      }, // Panjang Kanan
   ];

   const [filter, setFilter] = useState('Semua');
   const categories = ['Semua', 'Akademik', 'Keagamaan', 'Kegiatan', 'TFT'];

   return (
      <div className="min-h-screen bg-gradient-to-br from-[#e6f4f1] via-[#ffffff] to-[#e9f1ff] font-sans text-gray-800 selection:bg-[#1B6B3A]/20">
         <Head title="Galeri Kegiatan - QLC" />

         <Navbar />

         <main className="px-4 pt-36 pb-24 max-w-7xl mx-auto">
            {/* --- HEADER GALERI --- */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <span className="inline-flex items-center py-2 px-5 rounded-full bg-white/60 border border-white shadow-sm text-[#1B6B3A] text-sm font-bold tracking-wider mb-4 backdrop-blur-md">
                  <ImageIcon className="w-4 h-4 mr-2" /> DOKUMENTASI
               </span>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
                  Galeri Kegiatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B6B3A] to-[#34ad62]">QLC</span>
               </h1>
               <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                  Jelajahi momen-momen berharga santri dan asatidz dalam berbagai kegiatan belajar, menghafal, dan aktivitas pembentukan karakter.
               </p>

               {/* --- FILTER KATEGORI (Opsional, pemanis UI) --- */}
               <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm border ${
                           filter === cat ? 'bg-[#1B6B3A] text-white border-[#1B6B3A] scale-105' : 'bg-white text-gray-600 border-white hover:border-[#1B6B3A]/30 hover:text-[#1B6B3A]'
                        }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>

            {/* --- GRID BENTO BOX --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4 md:gap-6">
               {galleryItems.map((item, idx) => {
                  // Sembunyikan item jika tidak sesuai filter (logika filter sederhana)
                  if (filter !== 'Semua' && item.category !== filter && filter !== 'Kegiatan') return null;

                  return (
                     <div
                        key={item.id}
                        className={`group relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-xl cursor-pointer border-4 border-white bg-gray-100 animate-in fade-in zoom-in-95 duration-700 ${item.span}`}
                        style={{
                           animationDelay: `${idx * 100}ms`,
                           animationFillMode: 'both',
                        }}
                     >
                        {/* Gambar Utama */}
                        <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                        {/* Overlay Gradient & Teks */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B6B3A]/95 via-[#1B6B3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                           <span className="text-[#D4A017] font-bold text-xs md:text-sm tracking-wider mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              {item.category.toUpperCase()}
                           </span>
                           <h3 className="text-white font-bold text-xl md:text-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{item.title}</h3>
                        </div>
                     </div>
                  );
               })}
            </div>
         </main>

         <Footer />
      </div>
   );
}
