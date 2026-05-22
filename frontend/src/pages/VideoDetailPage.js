import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { VideoDetailSkeleton } from '../components/ui/Skeleton';
import CopyButton from '../components/ui/CopyButton';
import ExportMenu from '../components/video/ExportMenu';
import ProgressBar from '../components/ui/ProgressBar';
import VideoChatbot from '../components/video/VideoChatbot';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Star, ExternalLink, Clock, BookOpen,
  FileText, Zap, Brain, HelpCircle,
  CheckCircle, XCircle, Save, AlertCircle,
  BarChart2, Tag,
} from 'lucide-react';

const TABS = [
  { id:'summary',  label:'Summary',    icon: FileText   },
  { id:'bullets',  label:'Key Points', icon: Zap        },
  { id:'concepts', label:'Concepts',   icon: Brain      },
  { id:'mcqs',     label:'Quiz',       icon: HelpCircle },
];

const DIFF_COLOR = {
  beginner:     { bg:'rgba(16,185,129,0.1)',  color:'#10b981', border:'rgba(16,185,129,0.3)'  },
  intermediate: { bg:'rgba(6,182,212,0.1)',   color:'#06b6d4', border:'rgba(6,182,212,0.3)'   },
  advanced:     { bg:'rgba(124,58,237,0.1)',  color:'#a78bfa', border:'rgba(124,58,237,0.3)'  },
};

const IMPORTANCE_COLOR = {
  high:   'var(--amber)',
  medium: 'var(--cyan)',
  low:    'var(--text-muted)',
};

export default function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [isFav, setIsFav]         = useState(false);
  const [notes, setNotes]         = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesDirty, setNotesDirty]   = useState(false);

  const [answers, setAnswers]   = useState({});
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    videoAPI.getVideo(id)
      .then(r => {
        setVideo(r.data.video);
        setIsFav(r.data.video.isFavorite);
        setNotes(r.data.video.userNotes || '');
      })
      .catch(() => { toast.error('Video not found'); navigate('/history'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleFav = async () => {
    try {
      const { data } = await videoAPI.toggleFavorite(id);
      setIsFav(data.isFavorite);
      toast.success(data.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites');
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await videoAPI.updateNotes(id, notes);
      setNotesDirty(false);
      toast.success('Notes saved!');
    } catch { toast.error('Failed to save notes'); }
    finally { setSavingNotes(false); }
  };

  const handleMCQ = (qIdx, optIdx) => {
    if (revealed[qIdx]) return;
    setAnswers(a  => ({ ...a,  [qIdx]: optIdx }));
    setRevealed(r => ({ ...r,  [qIdx]: true   }));
  };

  const resetQuiz = () => { setAnswers({}); setRevealed({}); };

  if (loading) return <main className="main-content"><VideoDetailSkeleton /></main>;
  if (!video)  return null;

  const { analysis } = video;
  const diff = DIFF_COLOR[analysis?.difficulty];

  const mcqs          = analysis?.mcqs || [];
  const answeredCount = Object.keys(revealed).length;
  const correctCount  = Object.keys(revealed).filter(qi => answers[qi] === mcqs[qi]?.correctAnswer).length;
  const quizComplete  = answeredCount === mcqs.length && mcqs.length > 0;
  const scorePercent  = mcqs.length > 0 ? Math.round((correctCount / mcqs.length) * 100) : 0;
  const scoreColor    = scorePercent >= 80 ? 'var(--emerald)' : scorePercent >= 50 ? 'var(--amber)' : 'var(--rose)';

  const allText = [
    `# ${video.title}`, '',
    '## Summary', analysis?.summary, '',
    '## Key Points', ...(analysis?.bulletPoints || []).map((b, i) => `${i + 1}. ${b}`), '',
    '## Key Concepts', ...(analysis?.keyConcepts || []).map(c => `${c.term}: ${c.definition}`),
  ].join('\n');

  return (
    <main className="main-content">
      <div className="container" style={{ maxWidth:940 }}>

        {/* ── Back + Actions ── */}
        <div className="video-detail-actions">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ gap:6 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className="video-detail-action-btns">
            <ExportMenu video={video} />
            <CopyButton text={allText} label="Copy All" />
            <button onClick={handleFav} className={`btn btn-sm ${isFav ? 'btn-primary' : 'btn-secondary'}`} style={{ gap:6 }}>
              <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Saved' : 'Save'}
            </button>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap:6 }}>
              <ExternalLink size={14} /> Watch
            </a>
          </div>
        </div>

        {/* ── Video Header Card ── */}
        <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:24 }}>
          {/* .video-header-grid: 2-col on md+, stacks to 1-col on mobile */}
          <div className="video-header-grid">
            {/* Thumbnail */}
            <div style={{ background:'var(--bg-elevated)', overflow:'hidden', aspectRatio:'16/9' }}>
              <img
                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                alt={video.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                onError={e => { e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }}
              />
            </div>

            {/* Info */}
            <div style={{
              padding:'clamp(14px,3vw,24px)',
              display:'flex', flexDirection:'column', justifyContent:'space-between', gap:12,
            }}>
              <div>
                <h1 style={{
                  fontFamily:'var(--font-display)', fontWeight:800,
                  fontSize:'clamp(14px,2.2vw,20px)', lineHeight:1.35, marginBottom:6,
                }}>{video.title}</h1>
                {video.channelName && (
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>{video.channelName}</p>
                )}
              </div>

              {/* Meta badges */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
                {diff && (
                  <span style={{
                    fontSize:11, padding:'3px 10px', borderRadius:'9999px',
                    fontFamily:'var(--font-mono)', fontWeight:600,
                    background:diff.bg, color:diff.color, border:`1px solid ${diff.border}`,
                  }}>{analysis.difficulty}</span>
                )}
                {analysis?.sentiment && (
                  <span style={{
                    fontSize:11, padding:'3px 10px', borderRadius:'9999px',
                    fontFamily:'var(--font-mono)', fontWeight:500,
                    background:'rgba(6,182,212,0.1)', color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.3)',
                  }}>{analysis.sentiment}</span>
                )}
                {analysis?.estimatedReadTime && (
                  <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                    <Clock size={11} /> ~{analysis.estimatedReadTime} min read
                  </span>
                )}
                {video.transcriptWordCount > 0 && (
                  <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                    <FileText size={11} /> {video.transcriptWordCount.toLocaleString()} words
                  </span>
                )}
              </div>

              {/* Tags */}
              {analysis?.tags?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, alignItems:'center' }}>
                  <Tag size={11} color="var(--text-muted)" />
                  {analysis.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize:10, padding:'2px 8px', borderRadius:'9999px',
                      fontFamily:'var(--font-mono)',
                      background:'var(--amber-glow)', color:'var(--amber)', border:'1px solid var(--amber-border)',
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs — scrollable on mobile ── */}
        <div className="tabs" style={{ marginBottom:24 }}>
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              className={`tab ${activeTab === tid ? 'active' : ''}`}
              onClick={() => setActiveTab(tid)}
            >
              <Icon size={14} />
              <span>{label}</span>
              {tid === 'mcqs' && answeredCount > 0 && (
                <span style={{
                  fontSize:10, fontFamily:'var(--font-mono)', fontWeight:700,
                  background: scoreColor + '22', color:scoreColor,
                  border:`1px solid ${scoreColor}44`,
                  borderRadius:'9999px', padding:'1px 7px', marginLeft:2,
                }}>{correctCount}/{mcqs.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div key={activeTab} className="animate-fade-in">

          {/* SUMMARY */}
          {activeTab === 'summary' && (
            <div className="card">
              <div className="section-header">
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', gap:8 }}>
                  <FileText size={18} color="var(--amber)" /> Summary
                </h2>
                <CopyButton text={analysis?.summary || ''} />
              </div>
              <p className="summary-text">
                {analysis?.summary || 'No summary available for this video.'}
              </p>
            </div>
          )}

          {/* BULLET POINTS */}
          {activeTab === 'bullets' && (
            <div className="card">
              <div className="section-header">
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', gap:8 }}>
                  <Zap size={18} color="var(--amber)" /> Key Takeaways
                </h2>
                <CopyButton text={(analysis?.bulletPoints || []).map((b, i) => `${i + 1}. ${b}`).join('\n')} label="Copy All" />
              </div>
              {(analysis?.bulletPoints || []).length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>No bullet points available.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {analysis.bulletPoints.map((point, i) => (
                    <div
                      key={i}
                      style={{
                        display:'flex', gap:'clamp(10px,2vw,14px)', alignItems:'flex-start',
                        padding:'clamp(10px,2vw,14px) clamp(12px,2.5vw,18px)',
                        background:'var(--bg-elevated)',
                        borderRadius:'var(--radius-md)',
                        borderLeft:'3px solid var(--amber)',
                        transition:'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                      <span style={{
                        fontFamily:'var(--font-mono)', fontSize:12,
                        color:'var(--amber)', fontWeight:700,
                        minWidth:24, flexShrink:0, marginTop:2, userSelect:'none',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p style={{ fontSize:'clamp(13px,1.6vw,15px)', lineHeight:1.7, color:'var(--text-secondary)', margin:0 }}>{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KEY CONCEPTS */}
          {activeTab === 'concepts' && (
            <div className="card">
              <div className="section-header">
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', gap:8 }}>
                  <Brain size={18} color="var(--amber)" /> Key Concepts
                </h2>
                <CopyButton
                  text={(analysis?.keyConcepts || []).map(c => `${c.term}: ${c.definition}`).join('\n\n')}
                  label="Copy All"
                />
              </div>
              {(analysis?.keyConcepts || []).length === 0 ? (
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>No key concepts available.</p>
              ) : (
                <div style={{ display:'grid', gap:12 }}>
                  {analysis.keyConcepts.map((concept, i) => {
                    const ic = IMPORTANCE_COLOR[concept.importance] || 'var(--text-muted)';
                    return (
                      <div
                        key={i}
                        style={{
                          padding:'clamp(12px,2vw,16px) clamp(14px,2.5vw,20px)',
                          background:'var(--bg-elevated)',
                          borderRadius:'var(--radius-md)',
                          border:'1px solid var(--border-subtle)',
                          transition:'border-color var(--transition-fast)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${ic}40`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                      >
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
                          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:ic }}>
                            {concept.term}
                          </span>
                          <span style={{
                            fontSize:10, padding:'2px 8px', borderRadius:'9999px',
                            fontFamily:'var(--font-mono)', fontWeight:600, textTransform:'uppercase',
                            background:`${ic}15`, color:ic, border:`1px solid ${ic}30`,
                            flexShrink:0,
                          }}>{concept.importance}</span>
                        </div>
                        <p style={{ fontSize:14, lineHeight:1.7, color:'var(--text-secondary)', margin:0 }}>
                          {concept.definition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MCQ QUIZ */}
          {activeTab === 'mcqs' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {answeredCount > 0 && (
                <div className="card" style={{ padding:'clamp(16px,3vw,24px)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <BarChart2 size={18} color={scoreColor} />
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16 }}>
                        Progress: <span style={{ color:scoreColor }}>{correctCount} correct</span> / {answeredCount} answered
                      </span>
                    </div>
                    {quizComplete && (
                      <button onClick={resetQuiz} className="btn btn-ghost btn-sm" style={{ gap:6 }}>
                        Retry Quiz
                      </button>
                    )}
                  </div>
                  <ProgressBar value={answeredCount} max={mcqs.length} color="var(--amber)" height={6} animated />
                  {quizComplete && (
                    <div style={{
                      marginTop:14, padding:'12px 16px', borderRadius:'var(--radius-md)',
                      background:`${scoreColor}10`, border:`1px solid ${scoreColor}30`,
                      fontFamily:'var(--font-display)', fontWeight:700, fontSize:15,
                      color:scoreColor, textAlign:'center',
                    }}>
                      {scorePercent >= 80
                        ? `🎉 Excellent! ${scorePercent}% — You really know this material!`
                        : scorePercent >= 50
                          ? `👍 Good effort! ${scorePercent}% — Review the concepts and try again.`
                          : `📚 ${scorePercent}% — Watch the video again and retry!`
                      }
                    </div>
                  )}
                </div>
              )}

              {mcqs.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'48px 24px' }}>
                  <HelpCircle size={40} color="var(--text-muted)" style={{ marginBottom:14 }} />
                  <p style={{ color:'var(--text-secondary)', fontSize:14 }}>No quiz questions available for this video.</p>
                </div>
              ) : mcqs.map((mcq, qi) => (
                <div key={qi} className="card">
                  <div style={{
                    fontFamily:'var(--font-display)', fontWeight:700,
                    fontSize:'clamp(13px,1.6vw,15px)', marginBottom:16, lineHeight:1.5,
                    display:'flex', gap:10,
                  }}>
                    <span style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:13, flexShrink:0, marginTop:1 }}>
                      Q{qi + 1}
                    </span>
                    <span>{mcq.question}</span>
                  </div>

                  <div style={{ display:'grid', gap:8 }}>
                    {(mcq.options || []).map((opt, oi) => {
                      const isRevealed = !!revealed[qi];
                      const isSelected = answers[qi] === oi;
                      const isCorrect  = mcq.correctAnswer === oi;

                      let borderColor = 'var(--border-default)';
                      let bg          = 'var(--bg-elevated)';
                      let textColor   = 'var(--text-secondary)';
                      let Icon        = null;

                      if (isRevealed) {
                        if (isCorrect)       { borderColor = 'var(--emerald)'; bg = 'rgba(16,185,129,0.08)'; textColor = 'var(--emerald)'; Icon = CheckCircle; }
                        else if (isSelected) { borderColor = 'var(--rose)';   bg = 'rgba(244,63,94,0.08)';  textColor = 'var(--rose)';    Icon = XCircle; }
                      } else if (isSelected) {
                        borderColor = 'var(--amber)'; bg = 'var(--amber-glow)'; textColor = 'var(--amber)';
                      }

                      return (
                        <button key={oi} onClick={() => handleMCQ(qi, oi)} style={{
                          display:'flex', alignItems:'center', gap:12, width:'100%',
                          padding:'clamp(10px,1.5vw,12px) clamp(12px,2vw,16px)',
                          borderRadius:'var(--radius-md)',
                          background:bg, border:`1px solid ${borderColor}`,
                          cursor: isRevealed ? 'default' : 'pointer',
                          transition:'all var(--transition-fast)', textAlign:'left',
                          minHeight:44,
                        }}
                          onMouseEnter={e => { if (!isRevealed && !isSelected) e.currentTarget.style.borderColor = 'var(--amber)'; }}
                          onMouseLeave={e => { if (!isRevealed && !isSelected) e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                        >
                          <span style={{
                            width:26, height:26, borderRadius:'50%', flexShrink:0,
                            border:`2px solid ${borderColor}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:11, fontFamily:'var(--font-mono)', fontWeight:700, color:textColor,
                          }}>
                            {Icon ? <Icon size={14} /> : String.fromCharCode(65 + oi)}
                          </span>
                          <span style={{
                            fontSize:'clamp(13px,1.5vw,14px)', color:textColor,
                            fontWeight: isRevealed && (isCorrect || isSelected) ? 600 : 400, flex:1,
                          }}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {revealed[qi] && mcq.explanation && (
                    <div style={{
                      marginTop:12, padding:'12px 16px', borderRadius:'var(--radius-md)',
                      background:'rgba(6,182,212,0.07)', border:'1px solid rgba(6,182,212,0.25)',
                      fontSize:13, color:'var(--cyan)', lineHeight:1.65,
                      display:'flex', gap:8, alignItems:'flex-start',
                    }}>
                      <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }} />
                      {mcq.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Personal Notes ── */}
        <div className="card" style={{ marginTop:'clamp(20px,3vw,28px)' }}>
          <h3 style={{
            fontFamily:'var(--font-display)', fontWeight:700, fontSize:16,
            marginBottom:14, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
          }}>
            <BookOpen size={16} color="var(--amber)" /> Personal Notes
            {notesDirty && (
              <span style={{ fontSize:11, color:'var(--amber)', fontFamily:'var(--font-mono)', marginLeft:4 }}>
                (unsaved)
              </span>
            )}
          </h3>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesDirty(true); }}
            className="input"
            rows={5}
            placeholder="Add your notes, thoughts, or reflections about this video…"
            style={{ resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.7, fontSize:14 }}
          />
          <div className="notes-save-row">
            <button
              onClick={handleSaveNotes}
              className="btn btn-primary btn-sm"
              disabled={savingNotes || !notesDirty}
              style={{ gap:6 }}
            >
              {savingNotes
                ? <><div className="spinner" style={{ width:14, height:14 }} /> Saving…</>
                : <><Save size={14} /> Save Notes</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* VidBot Chatbot */}
      <VideoChatbot videoId={id} videoTitle={video.title} />
    </main>
  );
}
