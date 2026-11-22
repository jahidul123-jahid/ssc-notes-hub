import React, { useState, useEffect } from 'react';
import { SubjectCard } from '../components/SubjectCard';
import { Subject, SubjectGroup } from '../types';
import { dataService } from '../services/dataService';
import { dataEvents } from '../services/dataEvents';
import { Search, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SubjectsPage: React.FC = () => {
  const { t, isBn } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const subList = await dataService.getSubjects();
        if (!isMounted) return;
        setSubjects(subList);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    const unsubscribe = dataEvents.subscribe((event) => {
      if (event.type === 'subjects') {
        load(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  const groupTabs: { id: SubjectGroup | 'all'; label: string }[] = isBn
    ? [
        { id: 'all', label: 'সকল বিষয়' },
        { id: 'compulsory', label: 'আবশ্যিক' },
        { id: 'science', label: 'বিজ্ঞান' },
        { id: 'humanities', label: 'মানবিক' },
        { id: 'business', label: 'ব্যবসায় শিক্ষা' },
        { id: 'optional', label: 'ঐচ্ছিক' },
      ]
    : [
        { id: 'all', label: 'All Subjects' },
        { id: 'compulsory', label: 'Compulsory' },
        { id: 'science', label: 'Science' },
        { id: 'humanities', label: 'Humanities' },
        { id: 'business', label: 'Business Studies' },
        { id: 'optional', label: 'Optional' },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-primaryText">
            {t('subjects_page_title')}
          </h1>
          <p className="text-sm text-secondaryText mt-1">
            {t('subjects_page_subtitle')}
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-secondaryText absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_subject_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-cardBorder focus:outline-none focus:border-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Group Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none touch-pan-x overscroll-x-contain select-none">
        {groupTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedGroup(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all min-h-[40px] touch-manipulation active:scale-95 ${
              selectedGroup === tab.id
                ? 'bg-gradient-to-r from-brand-500 to-violetAccent text-white shadow-soft'
                : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Subjects - 2 per row on mobile */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 sm:h-64 bg-slate-100 rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cardBorder p-12 text-center shadow-soft">
          <BookOpen className="w-12 h-12 text-secondaryText mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-primaryText">{t('no_subjects_found')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={sub.subjectId}
              subject={sub}
            />
          ))}
        </div>
      )}
    </div>
  );
};
