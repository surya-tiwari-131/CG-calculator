
import React, { useState, useMemo } from 'react';
import { FIRST_SEM_SUBJECTS, TOTAL_CREDITS, THEME } from './constants';
import { Grade, GradePoints } from './types';
import { GoogleGenAI } from '@google/genai';

// Icons
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LeafIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const GradeSelector: React.FC<{
  value: Grade;
  onChange: (val: Grade) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Grade)}
        className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
      >
        {Object.values(Grade).map((g) => (
          <option key={g} value={g}>
            Grade {g} — {GradePoints[g]} Points
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
};

const SubjectCard: React.FC<{
  subject: typeof FIRST_SEM_SUBJECTS[0];
  grade: Grade;
  onGradeChange: (grade: Grade) => void;
}> = ({ subject, grade, onGradeChange }) => {
  const getGradeColor = (g: Grade) => {
    if (g === Grade.AA || g === Grade.AB) return 'border-emerald-500 bg-emerald-50/30';
    if (g === Grade.FF) return 'border-red-500 bg-red-50/30';
    return 'border-slate-200';
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${getGradeColor(grade)}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-900 text-white mb-2">
            <span className="text-emerald-400">⚡</span> {subject.code}
          </span>
          <h3 className="text-slate-900 font-bold leading-tight text-lg pr-2">{subject.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Credits</div>
          <div className="text-2xl font-black text-emerald-600 leading-none">{subject.credits}</div>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grade Earned</label>
        <GradeSelector value={grade} onChange={onGradeChange} />
      </div>
    </div>
  );
};

export default function App() {
  const [grades, setGrades] = useState<Record<string, Grade>>(() => {
    const initial: Record<string, Grade> = {};
    FIRST_SEM_SUBJECTS.forEach((s) => (initial[s.code] = Grade.AA));
    return initial;
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { sgpa, earnedCredits } = useMemo(() => {
    let totalPoints = 0;
    let earned = 0;
    FIRST_SEM_SUBJECTS.forEach((sub) => {
      const g = grades[sub.code];
      const points = GradePoints[g];
      totalPoints += points * sub.credits;
      if (g !== Grade.FF && g !== Grade.NA) {
        earned += sub.credits;
      }
    });
    return {
      sgpa: Number((totalPoints / TOTAL_CREDITS).toFixed(2)),
      earnedCredits: earned
    };
  }, [grades]);

  const handleGradeChange = (code: string, newGrade: Grade) => {
    setGrades((prev) => ({ ...prev, [code]: newGrade }));
  };

  const getAiAdvice = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Context: 1st Semester Electrical Engineering student at SVNIT Surat.
        Grades: ${FIRST_SEM_SUBJECTS.map(s => `${s.name}: ${grades[s.code]}`).join(', ')}.
        SGPA: ${sgpa}.
        Persona: A helpful senior or professor.
        Goal: Provide encouraging advice using metaphors related to power systems or nature. Focus on potential for the 2nd semester (Electrical Circuits, Physics-II). Max 80 words.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiAnalysis(response.text || "Your academic grid is looking strong! Continue to sustain this voltage through the next semester.");
    } catch (error) {
      setAiAnalysis("Excellent work! You've successfully cleared the first stage. Keep your circuit grounded and your goals high for the next semester.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 circuit-pattern pointer-events-none opacity-40"></div>
      
      {/* Header Section */}
      <header className="relative pt-16 pb-32 px-4 overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,#10b981,transparent)]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md animate-pulse">
            <span className="text-emerald-400">⚡</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Designed by Surya</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            SVNIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">CGPA</span> Hub
          </h1>
          <p className="text-emerald-100/70 max-w-xl mx-auto text-lg md:text-xl font-medium">
            Precisely calculate your first semester academic standing with high-voltage accuracy.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 -mt-20 relative z-20 flex-grow w-full">
        
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Score */}
          <div className="lg:col-span-5 glass-card rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center border border-emerald-100 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Current SGPA</span>
            <div className="relative">
              <div className="text-8xl md:text-9xl font-black text-slate-900 tabular-nums leading-none">
                {sgpa.toFixed(2)}
              </div>
              <div className="absolute -right-6 -top-2 text-emerald-500 animate-pulse">
                <BoltIcon />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 bg-emerald-100/50 px-4 py-2 rounded-full border border-emerald-200">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
               <span className="text-emerald-800 text-sm font-bold">{earnedCredits} / {TOTAL_CREDITS} Credits Cleared</span>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="lg:col-span-7 glass-card rounded-[2.5rem] shadow-2xl p-8 border border-emerald-100 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Academic Pulse</h2>
                <p className="text-slate-500 text-sm font-medium">AI-driven analysis of your performance</p>
              </div>
              <button 
                onClick={getAiAdvice}
                disabled={isAnalyzing}
                className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-200"
              >
                {isAnalyzing ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <BoltIcon />}
              </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              {aiAnalysis ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <p className="text-slate-700 leading-relaxed font-medium italic text-lg">
                    "{aiAnalysis}"
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-2">
                  <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center opacity-50">
                    <LeafIcon />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Click the bolt for insights</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              Curriculum Grid
            </h2>
            <button 
              onClick={() => {
                const reset: Record<string, Grade> = {};
                FIRST_SEM_SUBJECTS.forEach((s) => (reset[s.code] = Grade.AA));
                setGrades(reset);
                setAiAnalysis(null);
              }}
              className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest px-3 py-1 border border-slate-200 rounded-lg hover:border-red-200"
            >
              Flush Memory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIRST_SEM_SUBJECTS.map((subject) => (
              <SubjectCard
                key={subject.code}
                subject={subject}
                grade={grades[subject.code]}
                onGradeChange={(newGrade) => handleGradeChange(subject.code, newGrade)}
              />
            ))}
          </div>
        </div>

        {/* Reference Guide */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest">Grading Scale</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(GradePoints).slice(0, 4).map(([g, p]) => (
                  <div key={g} className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{g}</span>
                    <span className="text-emerald-600">{p}.0</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-white opacity-0 text-sm uppercase tracking-widest">.</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(GradePoints).slice(4, 8).map(([g, p]) => (
                  <div key={g} className="flex justify-between text-xs font-bold text-slate-500">
                    <span>{g}</span>
                    <span className="text-emerald-600">{p}.0</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center border-l border-slate-100 pl-8">
               <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                 Reference: SVNIT Academic Senate Rule 58.1 <br/>
                 Electrical B.Tech Structure 2023-24
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Credit - Updated to Surya Prakash Tiwari */}
      <footer className="w-full py-12 px-4 border-t border-slate-200 bg-white/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-white shadow-lg rotate-3">
              <span className="text-xl font-black">S</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-1 leading-none">Academic Architect</p>
              <h3 className="text-slate-900 font-black text-2xl tracking-tight">Surya Prakash Tiwari</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Engineering</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Design</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Nature</span>
          </div>
          <p className="text-slate-300 text-[10px] italic">Crafted with precision for the SVNIT Electrical community.</p>
        </div>
      </footer>

      {/* Floating Action Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
