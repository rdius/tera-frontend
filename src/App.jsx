import { useState, useRef, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

const Ico = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const IcoUpload = () => <Ico d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
const IcoSend   = () => <Ico d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
const IcoFile   = () => <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />
const IcoShield = () => <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" s={12} />
const IcoCheck  = () => <Ico d="M20 6L9 17l-5-5" s={13} />

function Typing() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 0', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#10b981',
          animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  )
}

function renderMd(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} style={{ color: '#e2e8f0', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i} style={{ color: '#64748b', fontStyle: 'normal', fontSize: '0.9em' }}>{p.slice(1, -1)}</em>
    return p
  })
}

function SourceBadge({ src }) {
  const score = Math.round(src.score * 100)
  const color = score > 85 ? '#10b981' : score > 65 ? '#f59e0b' : '#94a3b8'
  return (
    <div style={{
      background: '#0c1829', border: `1px solid ${color}30`,
      borderRadius: 7, padding: '8px 11px', marginBottom: 6,
    }}>
      <div style={{ fontSize: 10, color: '#7a9ab0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        📄 {src.filename}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#334155' }}>Page {src.page}</span>
        <span style={{ fontSize: 9, color: '#1a2d3e' }}>·</span>
        <span style={{ fontSize: 9, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {src.section}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, color,
          background: `${color}15`, borderRadius: 4, padding: '1px 6px', flexShrink: 0,
        }}>{score}%</span>
      </div>
    </div>
  )
}

function Message({ msg }) {
  if (msg.role === 'user') return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '18px 18px 4px 18px',
        padding: '11px 16px', maxWidth: '72%',
        fontSize: 13, color: '#e2e8f0', lineHeight: 1.65,
      }}>{msg.content}</div>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 11, marginBottom: 22, alignItems: 'flex-start' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 13, color: '#000', fontFamily: 'Syne, sans-serif',
      }}>T</div>
      <div style={{
        background: '#0c1829', border: '1px solid #1a2d3e',
        borderRadius: '4px 18px 18px 18px',
        padding: '13px 17px', maxWidth: '82%', flex: 1,
      }}>
        {msg.loading ? <Typing />
          : <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
              {renderMd(msg.content)}
            </div>
        }
      </div>
    </div>
  )
}

function Sidebar({ docs, onUpload, project, setProject, uploading, uploadProgress }) {
  const ref = useRef()
  const projects = [
    { id: 'essakane', label: 'Essakane Gold Mine — Burkina' },
    { id: 'bissa',    label: 'Bissa Mine — Burkina' },
    { id: 'taparko',  label: 'Taparko Mine — Burkina' },
    { id: 'custom',   label: 'Nouveau Projet' },
  ]
  return (
    <div style={{ width: 272, minWidth: 272, background: '#070f1b', borderRight: '1px solid #0f1e2e', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #0f1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#000', fontFamily: 'Syne, sans-serif' }}>T</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2.5, color: '#10b981', fontFamily: 'Syne, sans-serif' }}>TERA MINE</div>
            <div style={{ fontSize: 9, color: '#2d4a38', letterSpacing: 1, marginTop: 2 }}>Souveraineté des Données</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '13px 16px 10px', borderBottom: '1px solid #0f1e2e' }}>
        <div style={{ fontSize: 8, color: '#2d4a38', letterSpacing: 2, marginBottom: 7 }}>PROJET ACTIF</div>
        <select value={project} onChange={e => setProject(e.target.value)} style={{ width: '100%', background: '#0c1829', border: '1px solid #1a2d3e', borderRadius: 8, padding: '8px 11px', color: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', outline: 'none' }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '13px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 8, color: '#2d4a38', letterSpacing: 2 }}>BIBLIOTHÈQUE</span>
          <button onClick={() => ref.current?.click()} disabled={uploading} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 5, padding: '3px 10px', cursor: uploading ? 'wait' : 'pointer', fontSize: 11, color: '#10b981', fontFamily: 'inherit' }}>
            {uploading ? '⟳' : '+'}
          </button>
          <input ref={ref} type="file" accept=".pdf" multiple hidden onChange={e => onUpload(Array.from(e.target.files))} />
        </div>

        {uploadProgress && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#10b981', marginBottom: 6 }}>⟳ Indexation…</div>
            <div style={{ fontSize: 9, color: '#2d4a38' }}>{uploadProgress}</div>
            <div style={{ marginTop: 6, height: 2, background: '#1a2d3e', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: '#10b981', animation: 'progress 1.5s infinite' }} />
            </div>
          </div>
        )}

        {docs.length === 0 && !uploadProgress
          ? <div onClick={() => ref.current?.click()} style={{ border: '2px dashed #1a2d3e', borderRadius: 10, padding: '22px 14px', textAlign: 'center', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#10b98160'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2d3e'}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 10, color: '#2d4a38', lineHeight: 1.8 }}>Glissez vos PDF<br /><span style={{ color: '#1a3a28', fontSize: 9 }}>Jusqu'à 50 Mo · multi-fichiers</span></div>
            </div>
          : docs.map(d => (
            <div key={d.filename} style={{ background: '#0c1829', border: '1px solid #1a2d3e', borderRadius: 8, padding: '9px 11px', marginBottom: 5, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}><IcoFile /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#7a9ab0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</div>
                <div style={{ fontSize: 9, color: '#2d4a38', marginTop: 2 }}>{d.total_pages} pages · indexé ✓</div>
              </div>
              <div style={{ color: '#10b981', flexShrink: 0 }}><IcoCheck /></div>
            </div>
          ))
        }
      </div>

      <div style={{ padding: '11px 16px', borderTop: '1px solid #0f1e2e', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ fontSize: 9, color: '#2d4a38' }}>RAG · Qdrant · 100% Souverain</span>
      </div>
    </div>
  )
}

function SourcePanel({ sources, lastScore }) {
  const color = lastScore > 90 ? '#10b981' : lastScore > 70 ? '#f59e0b' : '#94a3b8'
  const level = lastScore > 90 ? 'Très Haute' : lastScore > 70 ? 'Haute' : lastScore > 50 ? 'Moyenne' : 'Faible'
  return (
    <div style={{ width: 290, borderLeft: '1px solid #0f1e2e', background: '#070f1b', display: 'flex', flexDirection: 'column', padding: '18px 14px', overflow: 'hidden' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Preuves et Sources</div>
      <div style={{ fontSize: 9, color: '#2d4a38', letterSpacing: 1, marginBottom: 14 }}>DÉTAILLÉES</div>

      {lastScore > 0 && (
        <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, padding: '11px 13px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 4 }}>Score de fiabilité</div>
          <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: 'Syne, sans-serif' }}>{lastScore}%</div>
          <div style={{ fontSize: 10, color, marginTop: 2 }}>{level}</div>
          <div style={{ width: '100%', height: 3, background: '#0f1e2e', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${lastScore}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s' }} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {sources.length === 0
          ? <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 10, color: '#1e3048', lineHeight: 1.7 }}>Sources apparaîtront<br />après chaque réponse</div>
            </div>
          : sources.map((s, i) => <SourceBadge key={i} src={s} />)
        }
      </div>
    </div>
  )
}

export default function App() {
  const [docs, setDocs]           = useState([])
  const [msgs, setMsgs]           = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [project, setProject]     = useState('essakane')
  const [sources, setSources]     = useState([])
  const [lastScore, setLastScore] = useState(0)
  const endRef  = useRef()
  const areaRef = useRef()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  useEffect(() => {
    setDocs([])
    fetch(`${API_URL}/project/${project}/docs`)
      .then(r => r.json())
      .then(data => { if (data.documents) setDocs(data.documents) })
      .catch(() => {})
  }, [project])

  const handleUpload = async (files) => {
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) return
    setUploading(true)
    for (const file of pdfs) {
      setUploadProgress(`${file.name} (${(file.size/1024/1024).toFixed(1)} Mo)…`)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('project_id', project)
      try {
        const res  = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          setDocs(p => {
            const ex = p.find(d => d.filename === data.filename)
            if (ex) return p.map(d => d.filename === data.filename ? { ...d, total_pages: data.pages } : d)
            return [...p, { filename: data.filename, total_pages: data.pages }]
          })
          setMsgs(p => [...p, { role: 'assistant', content: `✅ **${data.filename}** indexé\n${data.pages} pages · ${data.chunks} extraits · ${data.size_mb} Mo\n\nPosez vos questions.` }])
        } else {
          setMsgs(p => [...p, { role: 'assistant', content: `⚠️ ${data.detail || 'Erreur upload'}` }])
        }
      } catch (e) {
        setMsgs(p => [...p, { role: 'assistant', content: `⚠️ Backend inaccessible : ${e.message}\n\nVérifiez que Railway est déployé et que VITE_API_URL est configuré sur Vercel.` }])
      }
    }
    setUploading(false)
    setUploadProgress(null)
  }

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setMsgs(p => [...p, { role: 'user', content: q }, { role: 'assistant', loading: true, content: '' }])
    setInput('')
    setLoading(true)
    setSources([])
    try {
      const history = msgs.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res  = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, project_id: project, history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`)
      const match = data.answer.match(/Fiabilité\s*:\s*(\d+)%/i)
      const score = match ? parseInt(match[1]) : (data.sources?.[0] ? Math.round(data.sources[0].score * 100) : 0)
      setMsgs(p => p.map((m, i) => i === p.length - 1 ? { role: 'assistant', content: data.answer } : m))
      setSources(data.sources || [])
      setLastScore(score)
    } catch (e) {
      setMsgs(p => p.map((m, i) => i === p.length - 1 ? { role: 'assistant', content: `⚠️ ${e.message}` } : m))
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "Quelle est la concentration d'or dans le sondage ZK01 ?",
    "Résume les conclusions géologiques principales",
    "Quelles sont les mesures HSE prioritaires ?",
    "Liste les coordonnées GPS des sondages",
  ]

  return (
    <>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}
        @keyframes progress{0%{margin-left:-60%}100%{margin-left:100%}}
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#060c16;font-family:'JetBrains Mono',monospace}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a2d3e;border-radius:2px}
        textarea:focus{outline:none} select option{background:#0c1829}
      `}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar docs={docs} onUpload={handleUpload} project={project} setProject={setProject} uploading={uploading} uploadProgress={uploadProgress} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 22px', borderBottom: '1px solid #0f1e2e', background: '#070f1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', fontFamily: 'Syne, sans-serif' }}>Chat</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '5px 13px', fontSize: 10, color: '#10b981' }}>
              <IcoShield /> Local & Sécurisé
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '22px 22px 10px', background: '#060c16' }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: '8vh' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>⛏️</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', fontFamily: 'Syne, sans-serif', marginBottom: 6 }}>TERA MINE-INSIGHTS</div>
                <div style={{ fontSize: 11, color: '#2d4a38', marginBottom: 28, lineHeight: 1.8 }}>
                  {docs.length === 0 ? 'Importez vos PDF pour commencer\nrapports géologiques · analyses · contrats · HSE' : `${docs.length} document(s) indexé(s) — posez vos questions`}
                </div>
                {docs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 400, margin: '0 auto' }}>
                    {suggestions.map(s => (
                      <button key={s} onClick={() => { setInput(s); areaRef.current?.focus() }}
                        style={{ background: '#0c1829', border: '1px solid #1a2d3e', borderRadius: 10, padding: '10px 15px', cursor: 'pointer', fontSize: 11, color: '#4a6a7a', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b98145'; e.currentTarget.style.color = '#94a3b8' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a2d3e'; e.currentTarget.style.color = '#4a6a7a' }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {msgs.map((m, i) => <Message key={i} msg={m} />)}
            <div ref={endRef} />
          </div>

          <div style={{ padding: '14px 22px 18px', borderTop: '1px solid #0f1e2e', background: '#070f1b' }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', background: '#0c1829', border: '1px solid #1a2d3e', borderRadius: 13, padding: '10px 13px' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#1a2d3e'}
            >
              <label style={{ cursor: 'pointer', color: '#2d4a38', flexShrink: 0, display: 'flex', alignItems: 'center', padding: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = '#2d4a38'}
              >
                <IcoUpload />
                <input type="file" accept=".pdf" multiple hidden onChange={e => handleUpload(Array.from(e.target.files))} />
              </label>
              <textarea ref={areaRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Poser une question technique sur les documents..."
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', color: '#e2e8f0', fontSize: 12, fontFamily: 'inherit', resize: 'none', lineHeight: 1.55, padding: '4px 0', maxHeight: 110 }}
              />
              <button onClick={send} disabled={!input.trim() || loading} style={{
                background: input.trim() && !loading ? 'rgba(16,185,129,0.18)' : 'transparent',
                border: `1px solid ${input.trim() && !loading ? 'rgba(16,185,129,0.35)' : 'transparent'}`,
                borderRadius: 8, padding: '7px 9px', flexShrink: 0,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: input.trim() && !loading ? '#10b981' : '#2d4a38', transition: 'all 0.2s',
              }}><IcoSend /></button>
            </div>
            <div style={{ marginTop: 7, textAlign: 'center', fontSize: 9, color: '#1a2d3e', letterSpacing: 1 }}>
              Entrée pour envoyer · {docs.length} doc(s) indexé(s)
            </div>
          </div>
        </div>

        <SourcePanel sources={sources} lastScore={lastScore} />
      </div>
    </>
  )
}
