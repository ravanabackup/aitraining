
import React, { useState, useEffect } from 'react';
import AdvisorVoiceInterface from './components/AdvisorVoiceInterface';
import { SAJIN_CODE, STRATEGIC_TIMELINE } from './constants';
import { Shield, Clock, Zap, BookOpen, Crown, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentDate] = useState(new Date('2026-02-13T09:00:00')); // Simulating Feb 13 morning

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="serif text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Strategic Command Center
          </h1>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 status-pulse"></span>
            Operation: High-Value Pivot | Agent: Sajin
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-4">
          <Clock className="text-purple-400 w-5 h-5" />
          <div className="text-sm">
            <p className="text-slate-500 font-medium">Timeline Position</p>
            <p className="text-slate-200 font-bold">Feb 13, 2026 | 09:00 AM</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* Left Column: Guardrails & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Alert */}
          <section className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-red-500 w-5 h-5" />
              <h2 className="text-red-400 font-bold text-sm uppercase">Current Directive: The Cold Day</h2>
            </div>
            <p className="text-sm text-slate-300">
              Silence is absolute. Avoid digital footprints. Prepare for social proof at 14:00 hours. 
              Do not initiate contact.
            </p>
          </section>

          {/* The Sajin Code */}
          <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h2 className="serif text-xl mb-4 flex items-center gap-2">
              <Shield className="text-indigo-400 w-5 h-5" />
              The Sajin Code
            </h2>
            <div className="space-y-4">
              {SAJIN_CODE.map(rule => (
                <div key={rule.id} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                    {rule.title}
                    <Lock className="w-3 h-3 text-slate-500" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Psychological Intelligence */}
          <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h2 className="serif text-xl mb-4 flex items-center gap-2">
              <BookOpen className="text-purple-400 w-5 h-5" />
              Subject: Chris (Aries)
            </h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p><span className="text-purple-400 font-medium">The Hunter:</span> Respects scarcity. Despises availability.</p>
              <p><span className="text-purple-400 font-medium">The Mirror:</span> Currently mimicking your silence. Let her feel the vacuum.</p>
              <p><span className="text-purple-400 font-medium">The Ego:</span> If she feels ignored, she will stall. Hold the line.</p>
            </div>
          </section>
        </div>

        {/* Middle Column: Voice Interface */}
        <div className="lg:col-span-5 flex flex-col">
          <AdvisorVoiceInterface />
        </div>

        {/* Right Column: Timeline & Progress */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-full">
            <h2 className="serif text-xl mb-4 flex items-center gap-2">
              <Crown className="text-amber-400 w-5 h-5" />
              Strategic Roadmap
            </h2>
            <div className="space-y-6">
              {STRATEGIC_TIMELINE.map((phase, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-800 last:border-0 pb-2">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                    phase.status === 'COMPLETED' ? 'bg-green-500' : 
                    phase.status === 'ACTIVE' ? 'bg-indigo-500 status-pulse' : 'bg-slate-700'
                  }`} />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{phase.date}</p>
                  <h3 className={`text-sm font-bold ${phase.status === 'ACTIVE' ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {phase.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{phase.instruction}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      <footer className="text-center py-4 border-t border-slate-900 mt-auto">
        <p className="text-xs text-slate-600 font-medium uppercase tracking-[0.2em]">
          Classified Strategic Asset • Strictly for Sajin's Eyes Only • v1.0.26
        </p>
      </footer>
    </div>
  );
};

export default App;
