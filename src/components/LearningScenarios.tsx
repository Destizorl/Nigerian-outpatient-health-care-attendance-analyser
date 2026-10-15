/**
 * Interactive Epidemiological & Health Systems Learning Scenarios.
 * Teaches users how to conduct exploratory data analysis and draw meaningful conclusions from real-world hospital data.
 */

import React, { useState } from 'react';
import { LEARNING_SCENARIOS, LearningScenario } from '../data/learningScenarios';
import { CleanOPDRecord } from '../types/hospital';
import { executeOODMQuery } from '../services/oodmEngine';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Play, 
  Lightbulb, 
  FileCheck,
  Building,
  Save
} from 'lucide-react';

interface LearningScenariosProps {
  records: CleanOPDRecord[];
  selectedScenarioId?: string;
  onSelectScenario: (scenarioId: string) => void;
  userNotes: { [scenarioId: string]: string };
  onSaveNote: (scenarioId: string, note: string) => void;
  onOpenReport: () => void;
}

export const LearningScenarios: React.FC<LearningScenariosProps> = ({
  records,
  selectedScenarioId = 'scenario-malaria-surge',
  onSelectScenario,
  userNotes,
  onSaveNote,
  onOpenReport
}) => {
  const activeScenario = LEARNING_SCENARIOS.find(s => s.id === selectedScenarioId) || LEARNING_SCENARIOS[0];

  // Quiz answering state: { [questionIdx]: selectedOptionIdx }
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [executedSteps, setExecutedSteps] = useState<{ [stepIdx: number]: any }>({});
  const [currentNote, setCurrentNote] = useState<string>(userNotes[activeScenario.id] || '');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // When changing scenario, sync current note
  React.useEffect(() => {
    setCurrentNote(userNotes[activeScenario.id] || '');
    setQuizAnswers({});
    setExecutedSteps({});
    setNoteSaved(false);
  }, [activeScenario.id, userNotes]);

  const handleExecuteStep = (stepIdx: number, queryPreset: any) => {
    const res = executeOODMQuery(records, queryPreset);
    setExecutedSteps(prev => ({
      ...prev,
      [stepIdx]: res
    }));
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSaveUserNote = () => {
    onSaveNote(activeScenario.id, currentNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-800 tracking-wide mb-3">
          <span>EPIDEMIOLOGICAL LEARNING LAB</span>
          <span aria-hidden="true">·</span>
          <span>DRAWING MEANINGFUL CONCLUSIONS FROM HEALTH DATA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
          Real-World Nigerian Hospital Case Studies
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Apply Object-Oriented Data Modeling and Exploratory Data Analysis to solve actual clinical, administrative, and public health dilemmas faced by Chief Medical Directors and State Epidemiologists.
        </p>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          {LEARNING_SCENARIOS.map((scen) => {
            const isSelected = scen.id === activeScenario.id;

            return (
              <button
                key={scen.id}
                onClick={() => onSelectScenario(scen.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/40 ring-1 ring-teal-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-teal-800 font-bold mb-1">
                  {scen.number}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {scen.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  {scen.hospitalTarget.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Case Study Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Problem & Step-by-Step Investigation (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Context & Problem Card */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-teal-800 font-semibold">{activeScenario.number}</span>
                <h2 className="text-lg font-bold text-slate-900">{activeScenario.title}</h2>
              </div>
              <div className="text-xs text-slate-500 font-mono text-right">
                {activeScenario.hospitalTarget}
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                <strong className="text-slate-900 block mb-1">Geographic & Ecological Context:</strong>
                {activeScenario.context}
              </div>

              <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200 text-slate-800">
                <strong className="text-rose-900 block mb-1">The Clinical & Administrative Dilemma:</strong>
                {activeScenario.clinicalEpidemiologyProblem}
              </div>
            </div>
          </section>

          {/* Guided Data Investigation Steps */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Guided Data Investigation & Evidence Gathering
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {activeScenario.dataInvestigationSteps.length} VERIFICATION STEPS
              </span>
            </div>

            <div className="space-y-4">
              {activeScenario.dataInvestigationSteps.map((step, sIdx) => {
                const stepResult = executedSteps[sIdx];

                return (
                  <div key={sIdx} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      </div>

                      <button
                        onClick={() => handleExecuteStep(sIdx, step.oodmQueryPreset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run Investigation Query</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600">
                      {step.actionDescription}
                    </p>

                    {/* Investigation Live Output */}
                    {stepResult && (
                      <div className="p-3 bg-white rounded-lg border border-teal-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-bold">
                            Live Database Evidence Found
                          </span>
                          <span className="font-mono text-teal-900 font-semibold">
                            {stepResult.matchedCount} Encounters Verified ({stepResult.percentageOfTotal}%)
                          </span>
                        </div>

                        <div className="p-2 bg-teal-50/50 rounded font-mono text-[11px] text-slate-800">
                          Mean Wait: {stepResult.summaryMetrics.avgWaitMinutes} min · Mean Age: {stepResult.summaryMetrics.avgAge} yrs · NHIA: {stepResult.summaryMetrics.nhiaPercentage}%
                        </div>

                        <div className="text-slate-700 text-[11px]">
                          <strong className="text-teal-900">Empirical Finding:</strong> {step.expectedFinding}
                        </div>

                        <div className="text-slate-500 text-[11px] italic">
                          <strong className="not-italic text-slate-700">Epidemiological Guidance:</strong> {step.interpretationGuidance}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive Multiple Choice Questions */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Epidemiological & Operational Knowledge Check
              </h3>
              <span className="text-xs font-mono text-slate-400">TEST YOUR DEDUCTIONS</span>
            </div>

            <div className="space-y-5">
              {activeScenario.discussionQuestions.map((q, qIdx) => {
                const selectedOpt = quizAnswers[qIdx];
                const hasAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div key={qIdx} className="space-y-2 text-xs">
                    <p className="font-semibold text-slate-900">
                      Q{qIdx + 1}: {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';
                        if (hasAnswered) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'border-teal-500 bg-teal-50 text-teal-900 font-semibold';
                          } else if (selectedOpt === optIdx) {
                            btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                          } else {
                            btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                            className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-mono text-slate-400 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                        isCorrect ? 'bg-teal-50/70 border-teal-200 text-teal-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}>
                        <strong className="block mb-0.5">
                          {isCorrect ? 'Correct Analysis!' : 'Clinical Re-evaluation Required:'}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right: Synthesis & Technical Brief Workspace (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          
          {/* Policy Takeaway Card */}
          <div className="bg-teal-900 text-white p-5 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-teal-300 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Ministerial Policy Takeaway</span>
            </div>
            <p className="text-xs leading-relaxed text-teal-50">
              {activeScenario.policyTakeaway}
            </p>
          </div>

          {/* User Findings Synthesis Notepad */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Analyst Deductions & Notes
                </h3>
                <p className="text-[11px] text-slate-500">Record deductions for the technical brief</p>
              </div>
            </div>

            <textarea
              rows={6}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Record your analytical deductions here (e.g., 'Evidence shows a 2.5x surge in pediatric malaria during June. Recommend frontloading artemisinin procurement in April and staffing 4 additional triage nurses on Monday mornings...')"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-teal-600 resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-teal-700 font-medium">
                {noteSaved ? 'Note Saved to Brief!' : ''}
              </span>
              <button
                onClick={handleSaveUserNote}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={onOpenReport}
                className="w-full py-2 px-3 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-teal-700" />
                <span>Compile Official Technical Brief</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
