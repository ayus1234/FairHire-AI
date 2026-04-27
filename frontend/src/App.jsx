import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Atom, 
  Terminal, 
  BarChart2, 
  FileText,
  History,
  ArrowRightLeft,
  X,
  HelpCircle,
  FileDown,
  PieChart as PieIcon,
  FileSearch,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Activity,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { jsPDF } from 'jspdf';

const Tooltip = ({ title, content }) => (
  <div className="tooltip-trigger">
    <HelpCircle size={14} color="var(--text-muted)" style={{ cursor: 'help' }} />
    <div className="tooltip-content">
      <strong>{title}</strong>
      <p>{content}</p>
    </div>
  </div>
);

const BASE_URL = 'https://fairhire-backend-15593284604.asia-south1.run.app';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [compHistory, setCompHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState('audits'); 
  const [showHistory, setShowHistory] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compFiles, setCompFiles] = useState({ a: null, b: null });
  const [compResult, setCompResult] = useState(null);
  const [compError, setCompError] = useState(null);
  const [viewMode, setViewMode] = useState('audit'); // 'audit', 'comparison', 'individual'
  const [candidateData, setCandidateData] = useState({});
  const [individualResult, setIndividualResult] = useState(null);

  useEffect(() => {
    fetchHistory();
    fetchCompHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  const fetchCompHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/history/comparisons`);
      setCompHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch comp history");
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setResult(null);
    setError(null);
    setViewMode('audit'); // Switch to audit view on new upload

    try {
      const response = await axios.post(`${BASE_URL}/analyze`, formData);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResult(response.data);
        fetchHistory();
      }
    } catch (err) {
      setError("Audit Engine Offline: Could not reach the backend server.");
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleCompare = async () => {
    if (!compFiles.a || !compFiles.b) return;
    if (compFiles.a.name === compFiles.b.name && compFiles.a.size === compFiles.b.size) {
      setCompError("Invalid Comparison: Identical datasets selected.");
      return;
    }

    setLoading(true);
    setCompResult(null);
    setCompError(null);
    const formData = new FormData();
    formData.append('file1', compFiles.a);
    formData.append('file2', compFiles.b);

    try {
      const response = await axios.post(`${BASE_URL}/compare`, formData);
      if (response.data.error) {
        setCompError(response.data.error);
      } else {
        setCompResult(response.data);
        fetchCompHistory();
      }
    } catch (err) {
      setCompError("Comparison Engine Offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualAudit = async () => {
    if (!result) return;
    const requiredFields = ['gender', 'outcome', 'experience', 'location'];
    const emptyFields = requiredFields.filter(f => !candidateData[f] || candidateData[f].trim() === '');
    if (emptyFields.length > 0) {
      setIndividualResult(`⚠️ All fields are mandatory. Please fill in: ${emptyFields.join(', ')}.`);
      return;
    }
    setLoading(true);
    setIndividualResult(null);
    try {
      const response = await axios.post(`${BASE_URL}/audit-individual`, {
        candidate_data: candidateData,
        global_metrics: result.metrics,
        filename: result.filename
      });
      if (response.data.error) {
        setIndividualResult(`❌ ERROR: ${response.data.error}`);
      } else {
        setIndividualResult(response.data.explanation);
      }
    } catch (err) {
      setIndividualResult("❌ API OFFLINE: Could not reach the audit engine.");
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = (doc, pageNumber) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(3, 7, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(11, 15, 26);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setDrawColor(139, 92, 246);
    doc.circle(25, 22, 6, 'D');
    doc.setTextColor(139, 92, 246); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text("F", 23.5, 24);
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("FAIRHIRE AI", 38, 22);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text("Enterprise Quantum Compliance Suite", 38, 27);
    doc.setFontSize(6); doc.text(`PAGE: ${pageNumber}`, 175, 22);
    doc.line(20, pageHeight - 15, 190, pageHeight - 15);
    doc.text("© 2026 FairHire AI. Confidential. EEOC Compliance Verified.", 20, pageHeight - 10);
  };

  const smartRenderText = (doc, title, text, initialY) => {
    let y = initialY;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = 170;
    const BODY_FONT_SIZE = 9.5;
    const HEADING_FONT_SIZE = 11.5;
    const LINE_HEIGHT = 7;
    let pageNum = 1;

    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(title, margin, y - 10);

    const lines = text.split('\n');
    lines.forEach(line => {
      let rawLine = line.trim();
      if (rawLine.includes('|') || rawLine.includes('---|') || rawLine.startsWith(':-')) return;
      
      const isBullet = rawLine.startsWith('*') || rawLine.startsWith('-') || rawLine.startsWith('•');
      const isNumbered = /^\d+\.\s/.test(rawLine);
      
      if (isBullet || isNumbered) y += 4;

      let cleanLine = rawLine.replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '').replace(/---/g, '').replace(/^[*•-]\s*/, '').trim();
      if (!cleanLine) { y += 4; return; }

      const isHeading = line.includes('###') || (line.includes('**') && line.length < 80);
      if (isHeading) {
        doc.setFontSize(HEADING_FONT_SIZE); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 92, 246); y += 2;
      } else {
        doc.setFontSize(BODY_FONT_SIZE); doc.setFont('helvetica', 'normal'); doc.setTextColor(230, 230, 230);
      }

      const currentX = isBullet ? margin + 6 : margin;
      const currentMaxWidth = isBullet ? maxWidth - 6 : maxWidth;
      const wrappedLines = doc.splitTextToSize(cleanLine, currentMaxWidth);

      wrappedLines.forEach((wLine, idx) => {
        if (y > pageHeight - 30) {
          pageNum++; doc.addPage(); applyBranding(doc, pageNum); y = 55;
          if (isHeading) { doc.setFontSize(HEADING_FONT_SIZE); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 92, 246); }
          else { doc.setFontSize(BODY_FONT_SIZE); doc.setFont('helvetica', 'normal'); doc.setTextColor(230, 230, 230); }
        }
        if (isBullet && idx === 0) {
          doc.setTextColor(139, 92, 246); doc.text("•", margin + 1, y); doc.setTextColor(230, 230, 230);
        }
        doc.text(wLine, currentX, y);
        y += LINE_HEIGHT;
      });
      if (isHeading) y += 2;
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF(); applyBranding(doc, 1);
    doc.setFillColor(17, 24, 39); doc.roundedRect(20, 55, 170, 35, 2, 2, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text("AUDIT PROFILE", 28, 65);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(148, 163, 184);
    doc.text(`SOURCE: ${result.filename}`, 28, 73);
    doc.text(`BASELINE: ${result.privileged_group}`, 28, 79);
    doc.setFontSize(14); doc.setTextColor(139, 92, 246);
    doc.text(`${(result.overall_bias * 100).toFixed(1)}% FAIRNESS`, 140, 75);
    smartRenderText(doc, "ETHICAL ANALYSIS REPORT", result.ai_explanation, 110);
    doc.save(`FairHire_Audit_${result.filename}.pdf`);
  };

  const exportComparisonPDF = () => {
    const doc = new jsPDF(); applyBranding(doc, 1);
    doc.setFillColor(17, 24, 39); doc.roundedRect(20, 55, 80, 40, 2, 2, 'F'); doc.roundedRect(110, 55, 80, 40, 2, 2, 'F');
    doc.setTextColor(139, 92, 246); doc.setFontSize(9); doc.text("AUDIT A (BASE)", 28, 65); doc.text("AUDIT B (NEW)", 118, 65);
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text(`${(compResult.audit_a.overall_bias * 100).toFixed(1)}%`, 28, 78);
    doc.text(`${(compResult.audit_b.overall_bias * 100).toFixed(1)}%`, 118, 78);
    doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(compResult.audit_a.filename.substring(0, 22), 28, 88);
    doc.text(compResult.audit_b.filename.substring(0, 22), 118, 88);
    smartRenderText(doc, "COMPARATIVE TREND ANALYSIS", compResult.ai_comparison, 115);
    doc.save(`FairHire_Comparison_${compResult.audit_b.filename}.pdf`);
  };

  const exportIndividualPDF = () => {
    if (!individualResult) return;
    const doc = new jsPDF(); 
    applyBranding(doc, 1);
    
    // Header for Individual Audit
    doc.setFillColor(17, 24, 39); doc.roundedRect(20, 55, 170, 45, 2, 2, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 92, 246);
    doc.text("INDIVIDUAL CASE PROFILE", 28, 65);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    
    let yAttr = 73;
    Object.entries(candidateData).forEach(([key, val]) => {
      doc.text(`${key.toUpperCase()}: ${val}`, 28, yAttr);
      yAttr += 6;
    });

    smartRenderText(doc, "XAI DECISION TRACE", individualResult, 115);
    doc.save(`FairHire_XAI_Audit_${candidateData.gender || 'Case'}.pdf`);
  };

  const getRiskLevel = (score) => {
    if (score < 0.6) return { label: 'CRITICAL', color: 'var(--error)' };
    if (score < 0.8) return { label: 'WARNING', color: 'var(--warning)' };
    return { label: 'STABLE', color: 'var(--success)' };
  };

  return (
    <div className="app-container">
      <div className="floating-actions">
        <button className="icon-btn" onClick={() => setViewMode(viewMode === 'individual' ? 'audit' : 'individual')} title="Individual Case Audit">
          <FileSearch size={20} color={viewMode === 'individual' ? 'var(--primary)' : 'white'} />
        </button>
        <button className="icon-btn" onClick={() => setViewMode(viewMode === 'comparison' ? 'audit' : 'comparison')} title="Toggle Comparison Mode">
          <ArrowRightLeft size={20} color={viewMode === 'comparison' ? 'var(--primary)' : 'white'} />
        </button>
        <button className="icon-btn" onClick={() => setShowHistory(true)} title="View Audit Archive">
          <History size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="history-panel">
            <div className="history-header">
              <h3>{historyTab === 'audits' ? 'Audit Archive' : 'Trend Archive'}</h3>
              <X onClick={() => setShowHistory(false)} cursor="pointer" />
            </div>
            
            <div className="history-tabs">
              <button 
                className={`tab-btn ${historyTab === 'audits' ? 'active' : ''}`} 
                onClick={() => setHistoryTab('audits')}
              >
                <Activity size={14} /> Audits
              </button>
              <button 
                className={`tab-btn ${historyTab === 'comparisons' ? 'active' : ''}`} 
                onClick={() => setHistoryTab('comparisons')}
              >
                <ArrowRightLeft size={14} /> Trends
              </button>
            </div>

            <div className="history-list">
              {historyTab === 'audits' ? (
                history.length === 0 ? <p className="empty-msg">No audits recorded yet.</p> :
                history.map(item => (
                  <div key={item.id} className="history-item" onClick={() => { setResult(item); setShowHistory(false); setViewMode('audit'); }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{item.filename}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="history-item-badge" style={{ color: getRiskLevel(item.overall_bias).color }}>
                      {(item.overall_bias * 100).toFixed(0)}%
                    </div>
                  </div>
                ))
              ) : (
                compHistory.length === 0 ? <p className="empty-msg">No trend comparisons recorded.</p> :
                compHistory.map(item => (
                  <div key={item.id} className="history-item" onClick={() => { 
                    setCompResult({ audit_a: item.raw_data_a, audit_b: item.raw_data_b, ai_comparison: item.ai_comparison }); 
                    setViewMode('comparison'); 
                    setShowHistory(false); 
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.75rem' }}>{item.filename_a} vs</strong>
                      <strong style={{ fontSize: '0.75rem' }}>{item.filename_b}</strong>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="history-item-badge" style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>
                      TREND
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.8rem', borderRadius: '1rem' }}>
            <Atom size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 800 }}>FAIRHIRE AI</h1>
        </motion.div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Quantum Bias Audit Engine for Modern Hiring Systems</p>
      </header>

      <main>
        {viewMode === 'comparison' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem' }}>Dataset Comparison View</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              <div style={{ border: '1px dashed var(--border)', padding: '2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Base Audit (A)</p>
                <label className="btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1.2rem', gap: '0.5rem', cursor: 'pointer' }}>
                  <FileSearch size={18} /> {compFiles.a ? 'Change File' : 'Select File'}
                  <input type="file" onChange={(e) => setCompFiles({...compFiles, a: e.target.files[0]})} style={{ display: 'none' }} />
                </label>
                {compFiles.a && <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--primary)' }}>{compFiles.a.name}</div>}
              </div>
              <div style={{ border: '1px dashed var(--border)', padding: '2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>New Audit (B)</p>
                <label className="btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1.2rem', gap: '0.5rem', cursor: 'pointer' }}>
                  <FileSearch size={18} /> {compFiles.b ? 'Change File' : 'Select File'}
                  <input type="file" onChange={(e) => setCompFiles({...compFiles, b: e.target.files[0]})} style={{ display: 'none' }} />
                </label>
                {compFiles.b && <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--primary)' }}>{compFiles.b.name}</div>}
              </div>
            </div>
            
            {compError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-alert">
                <AlertTriangle size={16} /> {compError}
              </motion.div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={handleCompare} className="btn-primary" disabled={loading || !compFiles.a || !compFiles.b}>
                {loading ? "Calculating..." : <><ClipboardCheck size={20} /> Run Comparison</>}
              </button>
              {compResult && (
                <button onClick={exportComparisonPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileDown size={18} /> Export Comparison
                </button>
              )}
            </div>

            {compResult && !compError && (
              <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
                  <div className="stat-item" style={{ textAlign: 'center' }}>
                    <span className="stat-label">Audit A Score</span>
                    <span className="stat-value">{(compResult.audit_a.overall_bias * 100).toFixed(1)}%</span>
                  </div>
                  <div className="stat-item" style={{ textAlign: 'center' }}>
                    <span className="stat-label">Audit B Score</span>
                    <span className="stat-value">{(compResult.audit_b.overall_bias * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="terminal-container">
                  <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>AI Delta Analysis:</div>
                  <div style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: '0.9rem', lineHeight: '1.6' }}>{compResult.ai_comparison}</div>
                </div>
              </div>
            )}
          </motion.div>
        ) : viewMode === 'individual' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 className="gradient-text" style={{ fontSize: '1.5rem' }}>Individual Decision Explainer (XAI)</h3>
                <button onClick={() => setViewMode('audit')} className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Back to Audit</button>
              </div>
              
              {!result ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <AlertTriangle size={32} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                  <p>Please upload a dataset in the **Audit** view before running an individual case audit.</p>
                </div>
              ) : (
                <>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Analyze how specific traits contributed to a decision within the context of **{result.filename}**.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <input type="text" placeholder="Candidate Gender" className="icon-btn" style={{ width: '100%', textAlign: 'left' }} onChange={(e) => setCandidateData({...candidateData, gender: e.target.value})} />
                  <input type="text" placeholder="Outcome (e.g. Rejected)" className="icon-btn" style={{ width: '100%', textAlign: 'left' }} onChange={(e) => setCandidateData({...candidateData, outcome: e.target.value})} />
                  <input type="text" placeholder="Experience" className="icon-btn" style={{ width: '100%', textAlign: 'left' }} onChange={(e) => setCandidateData({...candidateData, experience: e.target.value})} />
                  <input type="text" placeholder="Location" className="icon-btn" style={{ width: '100%', textAlign: 'left' }} onChange={(e) => setCandidateData({...candidateData, location: e.target.value})} />
                </div>
                <button onClick={handleIndividualAudit} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Consulting Audit Trace...' : <><ShieldCheck size={18} /> Run Individual Audit</>}
                </button>

                {individualResult && (
                  <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button onClick={exportIndividualPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      <FileDown size={16} /> Export Individual Audit
                    </button>
                  </div>
                  <div className="terminal-container" style={{ marginTop: '1rem', height: 'auto', minHeight: '150px' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 800 }}>AI AUDIT TRACE SUMMARY:</div>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#fff', fontSize: '0.85rem' }}>{individualResult}</div>
                  </div>
                  </>
                )}
                </>
              )}
            </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem' }}>
                <div className="loader" style={{ animation: 'none', border: 'none', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={40} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Initiate Quantum Audit</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Upload your hiring dataset (CSV) to analyze demographic fairness.</p>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-alert" style={{ marginBottom: '2rem' }}>
                    <AlertTriangle size={18} /> {error}
                  </motion.div>
                )}
                <label className="btn-primary" style={{ cursor: 'pointer' }}>
                  <FileText size={20} /> Select Dataset
                  <input type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} />
                </label>
              </motion.div>
            )}
            {loading && (
              <div style={{ textAlign: 'center', padding: '5rem' }}>
                <div className="loader"></div>
                <h2 style={{ color: 'var(--text-muted)' }}>Decrypting Selection Patterns...</h2>
              </div>
            )}
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem' }}>Audit Summary</h2>
                    <div className="risk-badge" style={{ background: getRiskLevel(result.overall_bias).color }}>
                      <ShieldCheck size={14} style={{ marginRight: '4px' }} />
                      {getRiskLevel(result.overall_bias).label} RISK DETECTED
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setResult(null)} className="btn-outline">New Audit</button>
                    <button onClick={exportPDF} className="btn-primary"><FileDown size={18} /> Export PDF</button>
                  </div>
                </div>
                <div className="dashboard-grid">
                  <div className="glass-card">
                    <div className="stat-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="stat-label">Global Bias Score</span>
                        <Tooltip title="Disparate Impact" content="The ratio of selection rates. Scores below 80% (4/5ths rule) indicate significant adverse impact." />
                      </div>
                      <span className="stat-value" style={{ color: getRiskLevel(result.overall_bias).color }}>
                        {(result.overall_bias * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '1.5rem' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.overall_bias * 100}%` }}
                        transition={{ duration: 1 }}
                        style={{ height: '100%', background: getRiskLevel(result.overall_bias).color }} 
                      />
                    </div>
                  </div>

                  <div className="glass-card">
                    <div className="stat-item">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                         <span className="stat-label">Demographic Split</span>
                         <Tooltip title="Pool Distribution" content="Visual breakdown of how many candidates from each group are in the dataset." />
                      </div>
                      <div style={{ height: '120px', marginTop: '1rem' }}>
                        <ResponsiveContainer>
                          <RePieChart>
                            <Pie
                              data={[
                                { name: result.privileged_group, value: result.privileged_selection_rate },
                                ...Object.entries(result.metrics).map(([name, data]) => ({ name, value: data.selection_rate }))
                              ]}
                              innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value"
                            >
                              <Cell fill="var(--secondary)" />
                              <Cell fill="var(--primary)" />
                              <Cell fill="#a855f7" />
                            </Pie>
                            <RechartsTooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <div className="stat-item" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="stat-label">Baseline Reference: <span style={{ color: 'var(--secondary)' }}>{result.privileged_group}</span></span>
                        <Tooltip title="Statistical Parity" content="The standard group against which all other demographic selection rates are compared." />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Selection Rate: {(result.privileged_selection_rate * 100).toFixed(1)}%</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <BarChart2 size={20} color="var(--primary)" />
                      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selection Distribution</h3>
                    </div>
                    <div style={{ height: '250px' }}>
                      <ResponsiveContainer>
                        <BarChart data={[
                          { name: result.privileged_group, rate: result.privileged_selection_rate * 100, isPriv: true },
                          ...Object.entries(result.metrics).map(([name, data]) => ({ name, rate: data.selection_rate * 100, isPriv: false }))
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="var(--text-muted)" />
                          <YAxis stroke="var(--text-muted)" />
                          <RechartsTooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '1rem' }} />
                          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                            {['', ...Object.keys(result.metrics)].map((_, i) => (
                              <Cell key={i} fill={i === 0 ? 'var(--secondary)' : 'var(--primary)'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                    <div className="glass-card" style={{ gridColumn: 'span 2', background: '#000' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Layers size={20} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', fontWeight: 600 }}>Decision Driver Analysis (ML)</span>
                      </div>
                      <div style={{ height: '220px', padding: '10px' }}>
                        <ResponsiveContainer>
                          <BarChart layout="vertical" data={Object.entries(result.correlations || {}).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name, value }))}>
                            <XAxis type="number" hide domain={[0, 'auto']} />
                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={80} />
                            <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card" style={{ gridColumn: 'span 2', background: '#000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Terminal size={20} color="var(--primary)" />
                      <span style={{ fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', fontWeight: 600 }}>Ethical Audit Logs</span>
                    </div>
                    <div className="terminal-container">
                      {result.ai_explanation.split('\n').map((line, i) => (
                        <div key={i} className="log-line" style={{ color: line.startsWith('*') || line.includes('**') ? 'var(--primary)' : '#fff' }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default App;
