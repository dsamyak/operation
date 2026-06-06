import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSessionStore, { PHASE_XP } from '../../engine/sessionStore'
import useAudio from '../../hooks/useAudio'
import generateQuestions from '../../engine/questionGen'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MODULE_THEMES = {
  A: { icon: '✖️', color: '#E94560', name: 'Multiplication' },
  B: { icon: '➗', color: '#00D4AA', name: 'Division' },
  C: { icon: '🔢', color: '#FFD700', name: 'Order of Operations' },
  D: { icon: '📊', color: '#9B59B6', name: 'Patterns & Expressions' },
}

function generateWorksheetProblems(moduleId, seed) {
  const allQuestions = generateQuestions(moduleId, 20, seed + 5)
  // 1-6 Foundation, 7-16 Core, 17-20 Challenge
  return allQuestions.map((q, i) => {
    let section = 'Core'
    if (i < 6) section = 'Foundation'
    else if (i >= 16) section = 'Challenge'
    return { ...q, id: i, num: i + 1, section }
  })
}

export default function WorksheetPhase() {
  const { moduleId, masteryScore, advancePhase, setWorksheetDownloaded, seed, awardXP } = useSessionStore()
  const { playSFX } = useAudio()
  
  const [downloaded, setDownloaded] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [answers, setAnswers] = useState({}) // { [id]: { text: '', status: 'idle' | 'correct' | 'wrong' } }
  
  const theme = MODULE_THEMES[moduleId] || MODULE_THEMES.A
  const questions = React.useMemo(() => generateWorksheetProblems(moduleId, seed), [moduleId, seed])
  const printRef = useRef(null)

  // Initialize answers state
  useEffect(() => {
    const init = {}
    questions.forEach(q => {
      init[q.id] = { text: '', status: 'idle' }
    })
    setAnswers(init)
  }, [questions])

  const correctCount = Object.values(answers).filter(a => a.status === 'correct').length
  const isAllCorrect = correctCount === questions.length

  const handleCheck = (id, correctAnswer) => {
    const userAns = answers[id].text.trim().toLowerCase()
    const isCorrect = userAns === String(correctAnswer).toLowerCase()
    
    setAnswers(prev => ({
      ...prev,
      [id]: { ...prev[id], status: isCorrect ? 'correct' : 'wrong' }
    }))

    if (isCorrect) {
      playSFX('correct')
      if (correctCount + 1 === questions.length) {
        // Just finished the whole sheet
        playSFX('levelup')
        awardXP(50)
      }
    } else {
      playSFX('wrong')
    }
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const element = printRef.current
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Intellia360_Module${moduleId}_Worksheet.pdf`)
      
      if (!downloaded) {
        setDownloaded(true)
        setWorksheetDownloaded()
        playSFX('levelup')
        awardXP(PHASE_XP.WORKSHEET)
      }
    } catch (err) {
      console.error('PDF Generation failed:', err)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleContinue = () => {
    playSFX('whoosh')
    advancePhase()
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 relative">
      
      {/* Sticky Progress Tracker */}
      <div className="sticky top-4 z-50 w-full max-w-4xl mb-8">
        <motion.div className="glass-card p-4 flex items-center justify-between shadow-2xl"
          style={{ background: 'rgba(26, 26, 46, 0.85)', borderColor: `${theme.color}40` }}
          initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <h2 className="text-white font-bold font-['Space_Grotesk'] leading-tight">Interactive Worksheet</h2>
              <p className="text-xs text-text-secondary">Module {moduleId} • {theme.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-text-secondary mb-1">Completion</p>
              <p className="text-xl font-bold" style={{ color: isAllCorrect ? '#00D4AA' : theme.color }}>
                {correctCount} / {questions.length}
              </p>
            </div>
            
            <div className="hidden sm:flex gap-2">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} 
                className="btn-secondary py-2 text-sm flex items-center gap-2">
                {isGeneratingPDF ? '⏳ Generating...' : '📄 Download PDF'}
              </button>
              <button onClick={handleContinue} className="btn-primary py-2 text-sm">
                Next Phase →
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Progress bar line */}
        <div className="w-full h-1 mt-[-2px] bg-white/10 rounded-b-lg overflow-hidden relative z-40 max-w-4xl mx-auto">
          <motion.div className="h-full" style={{ background: theme.color }}
            initial={{ width: 0 }} animate={{ width: `${(correctCount / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl space-y-12 pb-24">
        
        {/* Foundation */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00D4AA50]" />
            <h3 className="text-xl font-bold text-[#00D4AA] font-['Space_Grotesk'] tracking-wide uppercase">
              🟢 Section A: Foundation
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00D4AA50]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.filter(q => q.section === 'Foundation').map(q => (
              <QuestionCard key={q.id} q={q} theme={theme} ansState={answers[q.id]} 
                onChange={(val) => setAnswers(p => ({...p, [q.id]: {text: val, status: 'idle'}}))}
                onCheck={() => handleCheck(q.id, q.answer)} />
            ))}
          </div>
        </section>

        {/* Core */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#E9456050]" />
            <h3 className="text-xl font-bold text-[#E94560] font-['Space_Grotesk'] tracking-wide uppercase">
              🔴 Section B: Core
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#E9456050]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.filter(q => q.section === 'Core').map(q => (
              <QuestionCard key={q.id} q={q} theme={theme} ansState={answers[q.id]} 
                onChange={(val) => setAnswers(p => ({...p, [q.id]: {text: val, status: 'idle'}}))}
                onCheck={() => handleCheck(q.id, q.answer)} />
            ))}
          </div>
        </section>

        {/* Challenge */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#FFD70050]" />
            <h3 className="text-xl font-bold text-[#FFD700] font-['Space_Grotesk'] tracking-wide uppercase">
              ⭐ Section C: Challenge
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#FFD70050]" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {questions.filter(q => q.section === 'Challenge').map(q => (
              <QuestionCard key={q.id} q={q} theme={theme} ansState={answers[q.id]} 
                onChange={(val) => setAnswers(p => ({...p, [q.id]: {text: val, status: 'idle'}}))}
                onCheck={() => handleCheck(q.id, q.answer)} isChallenge />
            ))}
          </div>
        </section>

        {/* Mobile action buttons (visible only on small screens) */}
        <div className="sm:hidden flex flex-col gap-3 mt-8">
          <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="btn-secondary w-full">
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button onClick={handleContinue} className="btn-primary w-full">
            Continue to Reflect Phase →
          </button>
        </div>

      </div>

      {/* Hidden DOM for PDF generation (must be in DOM but off-screen for html2canvas) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -100 }}>
        <PrintableWorksheet ref={printRef} questions={questions} moduleId={moduleId} theme={theme} masteryScore={masteryScore} userAnswers={answers} />
      </div>

    </div>
  )
}

function QuestionCard({ q, theme, ansState, onChange, onCheck, isChallenge }) {
  if (!ansState) return null;
  const isCorrect = ansState.status === 'correct'
  const isWrong = ansState.status === 'wrong'

  return (
    <motion.div 
      className={`glass-card p-5 relative overflow-hidden transition-all duration-300 ${isCorrect ? 'glow-cyan' : isWrong ? 'shake border-[#E94560]' : 'hover-glow'}`}
      style={{ borderColor: isCorrect ? '#00D4AA' : 'rgba(255,255,255,0.1)' }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    >
      {/* Background icon watermark */}
      <div className="absolute -bottom-4 -right-4 text-7xl opacity-5 pointer-events-none select-none">
        {theme.icon}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
             style={{ background: 'rgba(255,255,255,0.1)', color: theme.color }}>
          {q.num}
        </div>
        <p className="text-white text-sm md:text-base pt-1 leading-relaxed flex-1">
          {q.question}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <input 
          type="text" 
          value={ansState.text}
          onChange={(e) => onChange(e.target.value)}
          disabled={isCorrect}
          placeholder="Your answer..."
          className={`flex-1 bg-black/30 border rounded-lg px-4 py-2 text-white outline-none transition-colors
            ${isCorrect ? 'border-[#00D4AA] text-[#00D4AA] cursor-not-allowed' : isWrong ? 'border-[#E94560]' : 'border-white/20 focus:border-white/60'}`}
          onKeyDown={(e) => { if(e.key === 'Enter' && !isCorrect) onCheck() }}
        />
        
        <AnimatePresence mode="wait">
          {isCorrect ? (
            <motion.div key="correct" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 rounded-full bg-[#00D4AA20] text-[#00D4AA] flex items-center justify-center text-xl">
              ✓
            </motion.div>
          ) : (
            <motion.button key="check" 
              onClick={onCheck}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              style={{ background: theme.color, color: 'white' }}>
              Check
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {isChallenge && !isCorrect && (
        <div className="w-full h-24 mt-4 rounded-lg border border-dashed border-white/20 bg-white/5 p-2 text-text-secondary text-xs">
          Scratchpad / Working area (not graded)
        </div>
      )}
    </motion.div>
  )
}


// --- Printable Component (Hidden) ---
const PrintableWorksheet = React.forwardRef(({ questions, moduleId, theme, masteryScore, userAnswers }, ref) => {
  return (
    <div ref={ref} style={{ width: '800px', padding: '40px', background: 'white', color: 'black', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', borderBottom: `4px solid ${theme.color}`, paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: theme.color }}>Intellia 360: Operation Infinity</h1>
        <h2 style={{ margin: '10px 0 0 0', fontSize: '22px' }}>Module {moduleId}: {theme.name} — Interactive Worksheet</h2>
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
          <span><strong>Name:</strong> ______________________</span>
          <span><strong>Date:</strong> ______________________</span>
          <span><strong>Mastery Check:</strong> {masteryScore}%</span>
        </div>
      </div>

      {['Foundation', 'Core', 'Challenge'].map(section => {
        const sectionQs = questions.filter(q => q.section === section)
        if(sectionQs.length === 0) return null;
        return (
          <div key={section} style={{ marginBottom: '30px' }}>
            <h3 style={{ background: '#f0f0f0', padding: '10px', borderLeft: `5px solid ${theme.color}`, marginTop: 0 }}>
              {section} Section
            </h3>
            {sectionQs.map(q => {
              const ans = userAnswers[q.id]
              const isCorrect = ans && ans.status === 'correct'
              return (
                <div key={q.id} style={{ padding: '10px 0', borderBottom: '1px dashed #ccc' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <strong style={{ color: theme.color }}>{q.num}.</strong>
                    <div style={{ flex: 1 }}>{q.question}</div>
                  </div>
                  <div style={{ marginTop: '10px', marginLeft: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong>Answer:</strong> 
                    <span style={{ 
                      display: 'inline-block', 
                      minWidth: '150px', 
                      borderBottom: '1px solid black',
                      padding: '0 5px',
                      color: isCorrect ? 'green' : (ans?.text ? 'red' : 'black')
                    }}>
                      {ans?.text || ''}
                    </span>
                    {isCorrect && <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  {section === 'Challenge' && (
                    <div style={{ marginTop: '15px', marginLeft: '25px', height: '100px', border: '1px solid #eee' }}>
                      <span style={{ color: '#aaa', fontSize: '12px', padding: '5px' }}>Working space...</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
})
