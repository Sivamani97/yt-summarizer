import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Youtube, Zap, RefreshCw, Info, Sparkles, FileText, Brain } from 'lucide-react';

const EXAMPLE_URLS = [
  'https://www.youtube.com/watch?v=8mAITcNt710',
  'https://www.youtube.com/watch?v=aircAruvnKk',
  'https://www.youtube.com/watch?v=OtcDgMqMEqM',
];

const LENGTH_OPTIONS = [
  { value:'brief',    label:'Brief',    desc:'~150 words, 5 bullets',  icon: Zap      },
  { value:'medium',   label:'Medium',   desc:'~300 words, 8 bullets',  icon: FileText },
  { value:'detailed', label:'Detailed', desc:'~500 words, 12 bullets', icon: Brain    },
];

const STEPS = [
  { icon:'🔗', label:'Validating URL'       },
  { icon:'📡', label:'Fetching video info'  },
  { icon:'📝', label:'Extracting transcript'},
  { icon:'🤖', label:'Running AI analysis'  },
  { icon:'✅', label:'Finalizing results'   },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState('');

  const isValidYT = (u) => /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(u);

  const simulateSteps = () => {
    const delays = [400, 900, 1800, 3000, 4500];
    delays.forEach((d, i) => setTimeout(() => setStep(i), d));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim())          { setError('Please enter a YouTube URL'); return; }
    if (!isValidYT(url.trim())) { setError('Please enter a valid YouTube URL'); return; }
    setError('');
    setLoading(true);
    setStep(0);
    simulateSteps();
    try {
      const { data } = await videoAPI.analyze({ url: url.trim(), summaryLength, forceRefresh });
      if (data.cached) toast.success('Retrieved from your history!');
      else             toast.success('Analysis complete!');
      navigate(`/video/${data.video._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setStep(-1);
    }
  };

  return (
    <main className="main-content">
      <div className="container" style={{ maxWidth:720 }}>

        {/* Header */}
        <div style={{ marginBottom:'clamp(24px,4vw,36px)', textAlign:'center' }}>
          <span className="badge badge-amber" style={{ marginBottom:16 }}>
            <Sparkles size={11}/> AI-Powered Analysis
          </span>
          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:800,
            fontSize:'clamp(24px,4vw,42px)', marginBottom:12,
          }}>
            Analyze a YouTube Video
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'clamp(14px,1.8vw,16px)' }}>
            Paste any YouTube URL below — summaries, concepts &amp; quizzes generated instantly
          </p>
        </div>

        {/* Main form card */}
        <div className="card" style={{ marginBottom:20 }}>
          <form onSubmit={handleAnalyze}>

            {/* URL input */}
            <div className="input-group" style={{ marginBottom:24 }}>
              <label className="input-label">YouTube URL</label>
              <div style={{ position:'relative' }}>
                <Youtube size={17} color="var(--rose)" style={{
                  position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', flexShrink:0,
                }} />
                <input
                  type="url"
                  className={`input ${error ? 'input-error' : ''}`}
                  style={{ paddingLeft:44, height:52 }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={e => { setUrl(e.target.value); setError(''); }}
                  disabled={loading}
                  autoComplete="url"
                />
              </div>
              {error && (
                <span className="error-msg">
                  <Info size={12}/> {error}
                </span>
              )}

              {/* Example URLs */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Try:</span>
                {EXAMPLE_URLS.map((u, i) => (
                  <button key={i} type="button" onClick={() => setUrl(u)} style={{
                    fontSize:11, color:'var(--amber)', background:'var(--amber-glow)',
                    border:'1px solid var(--amber-border)', borderRadius:'var(--radius-sm)',
                    padding:'4px 10px', cursor:'pointer', fontFamily:'var(--font-mono)',
                    minHeight:28,
                  }}>
                    Example {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary length — responsive grid */}
            <div style={{ marginBottom:24 }}>
              <label className="input-label" style={{ display:'block', marginBottom:10 }}>Summary Length</label>
              <div className="length-options-grid">
                {LENGTH_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSummaryLength(value)}
                    disabled={loading}
                    style={{
                      padding:'14px 12px',
                      borderRadius:'var(--radius-md)',
                      border:`1px solid ${summaryLength === value ? 'var(--amber)' : 'var(--border-default)'}`,
                      background: summaryLength === value ? 'var(--amber-glow)' : 'var(--bg-elevated)',
                      cursor:'pointer', textAlign:'center',
                      transition:'all var(--transition-fast)',
                      minHeight:44,
                    }}
                  >
                    <Icon size={18} color={summaryLength === value ? 'var(--amber)' : 'var(--text-muted)'} style={{ margin:'0 auto 6px' }} />
                    <div style={{
                      fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
                      color: summaryLength === value ? 'var(--amber)' : 'var(--text-primary)', marginBottom:2,
                    }}>{label}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Force refresh toggle */}
            <div style={{
              display:'flex', alignItems:'center', gap:12, marginBottom:24,
              padding:'12px 16px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)',
              flexWrap:'wrap',
            }}>
              <button
                type="button"
                onClick={() => setForceRefresh(!forceRefresh)}
                style={{
                  width:40, height:22, borderRadius:11,
                  background: forceRefresh ? 'var(--amber)' : 'var(--bg-hover)',
                  border:'none', cursor:'pointer', position:'relative',
                  transition:'all var(--transition-fast)', flexShrink:0,
                }}
                aria-pressed={forceRefresh}
                aria-label="Force re-analyze"
              >
                <span style={{
                  display:'block', width:16, height:16, borderRadius:'50%',
                  background:'white', position:'absolute', top:3,
                  left: forceRefresh ? 21 : 3,
                  transition:'left var(--transition-fast)',
                }} />
              </button>
              <div>
                <div style={{
                  fontSize:13, fontWeight:600, fontFamily:'var(--font-display)',
                  color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6,
                }}>
                  <RefreshCw size={13}/> Force Re-analyze
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Re-run AI even if already in history</div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
              {loading
                ? <><div className="spinner" style={{ width:20, height:20 }}/> Analyzing...</>
                : <><Zap size={18}/> Analyze Video</>
              }
            </button>
          </form>
        </div>

        {/* Progress steps */}
        {loading && step >= 0 && (
          <div className="card animate-fade-in" style={{ padding:24 }}>
            <div style={{
              fontFamily:'var(--font-display)', fontWeight:700,
              fontSize:14, marginBottom:16, color:'var(--text-secondary)',
            }}>
              Processing your video...
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:12,
                  opacity: i > step ? 0.3 : 1,
                  transition:'opacity var(--transition-base)',
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', flexShrink:0,
                    background: i < step ? 'var(--amber-glow)' : i === step ? 'var(--amber)' : 'var(--bg-elevated)',
                    border:`1px solid ${i <= step ? 'var(--amber)' : 'var(--border-default)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:15, transition:'all var(--transition-base)',
                  }}>
                    {i === step ? <div className="spinner" style={{ width:14, height:14 }}/> : s.icon}
                  </div>
                  <span style={{
                    fontSize:14, fontFamily:'var(--font-display)', fontWeight:600,
                    color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>{s.label}</span>
                  {i < step && <span style={{ marginLeft:'auto', fontSize:11, color:'var(--emerald)' }}>✓ Done</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {!loading && (
          <div className="card animate-fade-in" style={{ padding:20, background:'transparent', borderColor:'var(--border-subtle)' }}>
            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <Info size={15} color="var(--text-muted)" style={{ flexShrink:0, marginTop:1 }} />
              <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
                <strong style={{ color:'var(--text-secondary)' }}>Tips:</strong>{' '}
                Works best with videos that have English captions enabled.
                Processing takes 15–60 seconds depending on video length. Previously analyzed videos load instantly from history.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
