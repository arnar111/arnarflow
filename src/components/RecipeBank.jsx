import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStore from '../store/useStore'
import {
  ChefHat,
  Plus,
  Search,
  Trash2,
  ArrowLeft,
  Clock,
  Users,
  Tag,
  X,
  Pencil,
  Copy,
  Download,
  Upload,
  MoreVertical,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  Loader2,
  ClipboardPaste,
} from 'lucide-react'

const CATEGORY_COLORS = {
  'Aðalréttur': { bg: '#f59e0b', text: '#fbbf24', muted: 'rgba(245,158,11,0.15)', gradient: 'rgba(245,158,11,0.3)' },
  'Meðlæti':    { bg: '#22c55e', text: '#4ade80', muted: 'rgba(34,197,94,0.15)', gradient: 'rgba(34,197,94,0.3)' },
  'Súpa':       { bg: '#f97316', text: '#fb923c', muted: 'rgba(249,115,22,0.15)', gradient: 'rgba(249,115,22,0.3)' },
  'Bakkelsi':   { bg: '#ec4899', text: '#f472b6', muted: 'rgba(236,72,153,0.15)', gradient: 'rgba(236,72,153,0.3)' },
  'Sósa':       { bg: '#ef4444', text: '#f87171', muted: 'rgba(239,68,68,0.15)', gradient: 'rgba(239,68,68,0.3)' },
  'Annað':      { bg: '#3b82f6', text: '#60a5fa', muted: 'rgba(59,130,246,0.15)', gradient: 'rgba(59,130,246,0.3)' },
}

const CATEGORIES = ['Allt', 'Aðalréttur', 'Meðlæti', 'Súpa', 'Bakkelsi', 'Sósa', 'Annað']

function minutesLabel(n) {
  const x = Number(n || 0)
  if (!x) return '—'
  return `${x} mín`
}

function totalTime(r) {
  return Number(r?.prepTime || 0) + Number(r?.cookTime || 0)
}

function normalizeTags(input) {
  if (!input) return []
  return String(input)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function validateRecipe(input) {
  const r = input || {}

  const id = r.id != null ? String(r.id).trim() : ''
  const name = String(r.name || '').trim()
  if (!name) return { ok: false, error: 'Vantar "name".' }

  const category = String(r.category || 'Aðalréttur')
  const servings = Number.isFinite(Number(r.servings)) ? Number(r.servings) : 2
  const prepTime = Number.isFinite(Number(r.prepTime)) ? Number(r.prepTime) : 0
  const cookTime = Number.isFinite(Number(r.cookTime)) ? Number(r.cookTime) : 0

  const ingredients = Array.isArray(r.ingredients)
    ? r.ingredients
      .map(i => ({
        name: String(i?.name || '').trim(),
        amount: String(i?.amount || '').trim(),
        unit: String(i?.unit || '').trim(),
      }))
      .filter(i => i.name)
    : []

  const instructions = Array.isArray(r.instructions)
    ? r.instructions.map(s => String(s || '').trim()).filter(Boolean)
    : []

  const tags = Array.isArray(r.tags)
    ? r.tags.map(t => String(t || '').trim()).filter(Boolean)
    : (typeof r.tags === 'string' ? normalizeTags(r.tags) : [])

  const createdAt = r.createdAt ? String(r.createdAt) : undefined

  return {
    ok: true,
    recipe: {
      id,
      name,
      description: String(r.description || '').trim(),
      image: String(r.image || '').trim(),
      servings,
      prepTime,
      cookTime,
      category,
      ingredients,
      instructions,
      tags,
      ...(createdAt ? { createdAt } : {}),
    }
  }
}

const SMART_PASTE_PROMPT = `Þú ert uppskriftarparser. Greindu eftirfarandi texta og skilaðu JSON hlut.

REGLUR:
- Nafn uppskriftar: dragðu út eða búðu til lýsandi nafn á íslensku
- Lýsing: stutt, 1-2 setningar á íslensku
- Flokkur: veldu úr [Aðalréttur, Meðlæti, Súpa, Bakkelsi, Sósa, Annað]
- Hráefni: greindu nafn, magn (tala eða brot sem strengur), og einingu
  - Ef magn vantar: "1" og "stk"
- Leiðbeiningar: listi af skrefum
- Skammtar: áætla ef ekki gefið (default 4)
- Undirbúningstími og eldunartími í mínútum
- Tags: 2-4 lýsandi tög (t.d. air-fryer, quick, pasta, spicy)
- Nutrition pros: 2-3 jákvæðir kostir (t.d. "Ríkt af C-vítamíni", "Lítil fita")
- Nutrition cons: 1-2 gallar ef einhverjir (t.d. "Hátt natríum", "Mikil fita")

SKILAÐU AÐEINS HREINU JSON:
{
  "name": "string",
  "description": "string",
  "category": "string",
  "servings": number,
  "prepTime": number,
  "cookTime": number,
  "ingredients": [{"name": "string", "amount": "string", "unit": "string"}],
  "instructions": ["string"],
  "tags": ["string"],
  "nutrition": { "pros": ["string"], "cons": ["string"] }
}

Textinn:
`

function SmartPasteModal({ open, onClose, onSave }) {
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) { setRawText(''); setParsed(null); setError('') }
  }, [open])

  if (!open) return null

  const handleParse = async () => {
    if (!rawText.trim()) return
    setLoading(true)
    setError('')
    setParsed(null)
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDl60bNuZodkY8ROXb8hJzJX5SgIp0QOvo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SMART_PASTE_PROMPT + rawText }] }],
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
          }),
        }
      )
      const data = await res.json()
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!raw) throw new Error('Ekkert svar frá Gemini')
      setParsed(JSON.parse(raw))
    } catch (e) {
      setError('Villa: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field, value) => setParsed(p => ({ ...p, [field]: value }))
  const updateIngredient = (idx, field, value) => setParsed(p => {
    const ingredients = [...p.ingredients]
    ingredients[idx] = { ...ingredients[idx], [field]: value }
    return { ...p, ingredients }
  })
  const updateInstruction = (idx, value) => setParsed(p => {
    const instructions = [...p.instructions]
    instructions[idx] = value
    return { ...p, instructions }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Smart Paste</h2>
            <span className="text-2xs text-[var(--text-muted)]">— límdu uppskrift, AI greinir</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"><X size={16} /></button>
        </div>

        <div className="p-4 max-h-[75vh] overflow-auto space-y-4">
          {!parsed ? (
            <>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={'Límdu uppskrift hingað...\n\nT.d.:\nPasta Carbonara\n400g spaghetti\n200g beikon\n4 egg\n\n1. Sjóðaðu pasta...\n2. Steiktu beikon...'}
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                autoFocus
              />
              {error && <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 px-3 py-2 rounded-lg">{error}</div>}
              <button
                onClick={handleParse}
                disabled={loading || !rawText.trim()}
                className="w-full py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Greini...</> : <><Sparkles size={16} /> Greina uppskrift</>}
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                <Sparkles size={14} /> AI greindi uppskriftina — skoðaðu og vistaðu
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs text-[var(--text-muted)]">Nafn</label>
                  <input value={parsed.name || ''} onChange={e => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-[var(--text-muted)]">Flokkur</label>
                  <select value={parsed.category || 'Aðalréttur'} onChange={e => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]">
                    {CATEGORIES.filter(c => c !== 'Allt').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-2xs text-[var(--text-muted)]">Lýsing</label>
                  <textarea value={parsed.description || ''} onChange={e => updateField('description', e.target.value)}
                    rows={2} className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-[var(--text-muted)]">Skammtar</label>
                  <input type="number" value={parsed.servings || 4} onChange={e => updateField('servings', +e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-2xs text-[var(--text-muted)]">Undirbún. (mín)</label>
                    <input type="number" value={parsed.prepTime || 0} onChange={e => updateField('prepTime', +e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs text-[var(--text-muted)]">Eldun (mín)</label>
                    <input type="number" value={parsed.cookTime || 0} onChange={e => updateField('cookTime', +e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]" />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Hráefni ({parsed.ingredients?.length || 0})</h3>
                <div className="space-y-1.5">
                  {(parsed.ingredients || []).map((ing, i) => (
                    <div key={i} className="grid grid-cols-12 gap-1.5">
                      <input value={ing.amount || ''} onChange={e => updateIngredient(i, 'amount', e.target.value)}
                        className="col-span-2 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] text-center" placeholder="Magn" />
                      <input value={ing.unit || ''} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                        className="col-span-2 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] text-center" placeholder="Ein." />
                      <input value={ing.name || ''} onChange={e => updateIngredient(i, 'name', e.target.value)}
                        className="col-span-8 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Leiðbeiningar ({parsed.instructions?.length || 0})</h3>
                <div className="space-y-1.5">
                  {(parsed.instructions || []).map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold shrink-0 mt-1" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{i + 1}</span>
                      <textarea value={step} onChange={e => updateInstruction(i, e.target.value)}
                        rows={2} className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] resize-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setParsed(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center justify-center gap-2">
                  <ClipboardPaste size={14} /> Breyta texta
                </button>
                <button onClick={() => { onSave(parsed); onClose() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
                  <Plus size={14} /> Vista uppskrift
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RecipeModal({ open, mode, initialRecipe, onClose, onSave }) {
  const isEdit = mode === 'edit'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [servings, setServings] = useState(2)
  const [prepTime, setPrepTime] = useState(10)
  const [cookTime, setCookTime] = useState(10)
  const [category, setCategory] = useState('Aðalréttur')
  const [tags, setTags] = useState('')

  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }])
  const [instructions, setInstructions] = useState([''])
  const [nutritionPros, setNutritionPros] = useState(['', '', ''])
  const [nutritionCons, setNutritionCons] = useState(['', '', ''])

  useEffect(() => {
    if (!open) return

    if (isEdit && initialRecipe) {
      setName(initialRecipe?.name || '')
      setDescription(initialRecipe?.description || '')
      setImage(initialRecipe?.image || '')
      setServings(initialRecipe?.servings ?? 2)
      setPrepTime(initialRecipe?.prepTime ?? 0)
      setCookTime(initialRecipe?.cookTime ?? 0)
      setCategory(initialRecipe?.category || 'Aðalréttur')
      setTags(Array.isArray(initialRecipe?.tags) ? initialRecipe.tags.join(', ') : '')
      setIngredients(Array.isArray(initialRecipe?.ingredients) && initialRecipe.ingredients.length
        ? initialRecipe.ingredients.map(i => ({
          name: String(i?.name || ''),
          amount: String(i?.amount || ''),
          unit: String(i?.unit || ''),
        }))
        : [{ name: '', amount: '', unit: '' }]
      )
      setInstructions(Array.isArray(initialRecipe?.instructions) && initialRecipe.instructions.length
        ? initialRecipe.instructions.map(s => String(s || ''))
        : ['']
      )
      const np = initialRecipe?.nutrition?.pros || []
      const nc = initialRecipe?.nutrition?.cons || []
      setNutritionPros([np[0] || '', np[1] || '', np[2] || ''])
      setNutritionCons([nc[0] || '', nc[1] || '', nc[2] || ''])
      return
    }

    // create mode: reset
    setName('')
    setDescription('')
    setImage('')
    setServings(2)
    setPrepTime(10)
    setCookTime(10)
    setCategory('Aðalréttur')
    setTags('')
    setIngredients([{ name: '', amount: '', unit: '' }])
    setInstructions([''])
    setNutritionPros(['', '', ''])
    setNutritionCons(['', '', ''])
  }, [open, isEdit, initialRecipe])

  if (!open) return null

  const updateIngredient = (idx, key, value) => {
    setIngredients(prev => prev.map((x, i) => i === idx ? { ...x, [key]: value } : x))
  }

  const updateInstruction = (idx, value) => {
    setInstructions(prev => prev.map((x, i) => i === idx ? value : x))
  }

  const submit = (e) => {
    e.preventDefault()

    const cleanedIngredients = (ingredients || [])
      .map(i => ({
        name: (i?.name || '').trim(),
        amount: (i?.amount || '').trim(),
        unit: (i?.unit || '').trim(),
      }))
      .filter(i => i.name)

    const cleanedInstructions = (instructions || [])
      .map(s => String(s || '').trim())
      .filter(Boolean)

    const payload = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      servings: Number(servings || 0),
      prepTime: Number(prepTime || 0),
      cookTime: Number(cookTime || 0),
      category,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      tags: normalizeTags(tags),
      nutrition: {
        pros: nutritionPros.map(s => s.trim()).filter(Boolean),
        cons: nutritionCons.map(s => s.trim()).filter(Boolean),
      },
    }

    if (!isEdit) payload.createdAt = new Date().toISOString()

    onSave(payload)

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat size={18} className="text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">{isEdit ? 'Breyta uppskrift' : 'Ný uppskrift'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            title="Loka"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-4 max-h-[75vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-2xs text-[var(--text-muted)]">Nafn</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                placeholder="t.d. Mutti mascarpone pasta"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xs text-[var(--text-muted)]">Flokkur</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
              >
                {CATEGORIES.filter(c => c !== 'Allt').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-2xs text-[var(--text-muted)]">Lýsing</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] min-h-[70px]"
                placeholder="Stutt lýsing..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-2xs text-[var(--text-muted)]">Mynd (URL)</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                placeholder="https://... (má vera tómt)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xs text-[var(--text-muted)]">Skammtar</label>
              <input
                type="number"
                value={servings}
                min={1}
                onChange={(e) => setServings(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xs text-[var(--text-muted)]">Undirbúningur (mín)</label>
              <input
                type="number"
                value={prepTime}
                min={0}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xs text-[var(--text-muted)]">Eldun (mín)</label>
              <input
                type="number"
                value={cookTime}
                min={0}
                onChange={(e) => setCookTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-2xs text-[var(--text-muted)]">Tög (kommuseparað)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                placeholder="air-fryer, quick, pasta"
              />
            </div>
          </div>

          {/* Nutrition Pros/Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-green-400 flex items-center gap-1"><ThumbsUp size={14} /> Kostir</h3>
              {nutritionPros.map((v, i) => (
                <input key={i} value={v} onChange={e => setNutritionPros(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                  placeholder={`Kostur ${i + 1} (t.d. Próteinríkt)`} />
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1"><ThumbsDown size={14} /> Gallar</h3>
              {nutritionCons.map((v, i) => (
                <input key={i} value={v} onChange={e => setNutritionCons(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                  placeholder={`Galli ${i + 1} (t.d. Mikil fita)`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Innihald</h3>
                <button
                  type="button"
                  onClick={() => setIngredients(prev => ([...prev, { name: '', amount: '', unit: '' }]))}
                  className="text-2xs px-2 py-1 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)]/20"
                >
                  + Bæta við
                </button>
              </div>

              <div className="space-y-2">
                {(ingredients || []).map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                      className="col-span-6 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                      placeholder="Hráefni"
                    />
                    <input
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                      className="col-span-3 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                      placeholder="Magn"
                    />
                    <input
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                      className="col-span-2 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
                      placeholder="Eining"
                    />
                    <button
                      type="button"
                      onClick={() => setIngredients(prev => prev.filter((_, i) => i !== idx))}
                      className="col-span-1 p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--error)]"
                      title="Eyða"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Skref</h3>
                <button
                  type="button"
                  onClick={() => setInstructions(prev => ([...prev, '']))}
                  className="text-2xs px-2 py-1 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)]/20"
                >
                  + Bæta við
                </button>
              </div>

              <div className="space-y-2">
                {(instructions || []).map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      value={step}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] min-h-[44px]"
                      placeholder={`Skref ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => setInstructions(prev => prev.filter((_, i) => i !== idx))}
                      className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--error)]"
                      title="Eyða"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              Hætta við
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              {isEdit ? 'Vista breytingar' : 'Vista uppskrift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onOpen, onToggleFavorite }) {
  const time = totalTime(recipe)
  const cc = CATEGORY_COLORS[recipe?.category] || CATEGORY_COLORS['Annað']
  return (
    <button
      onClick={onOpen}
      className="text-left group bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/20 transition-all relative"
      style={{ borderTopColor: cc.bg, borderTopWidth: '2px' }}
    >
      <div className="h-28 bg-[var(--bg-primary)] relative">
        {recipe?.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: cc.text }}>
            <ChefHat size={22} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-14" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.6), ${cc.gradient}, transparent)` }} />
        {/* Favorite heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
          title={recipe?.favorite ? 'Fjarlægja úr uppáhaldi' : 'Bæta í uppáhald'}
        >
          <Heart size={14} className={recipe?.favorite ? 'fill-red-500 text-red-500' : 'text-white/70'} />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-white">
            {recipe?.name}
          </h3>
          <div className="text-2xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: cc.muted, color: cc.text }}>
            {recipe?.category}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-2xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1"><Clock size={12} /> {time ? `${time} mín` : '—'}</span>
          <span className="inline-flex items-center gap-1"><Users size={12} /> {recipe?.servings || '—'}</span>
        </div>

        {Array.isArray(recipe?.tags) && recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map(t => (
              <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function RecipeDetail({ recipe, onBack, onEdit, onDuplicate, onDelete, onToggleFavorite }) {
  const [adjustedServings, setAdjustedServings] = useState(null)

  useEffect(() => { setAdjustedServings(null) }, [recipe?.id])

  if (!recipe) return null

  const cc = CATEGORY_COLORS[recipe.category] || CATEGORY_COLORS['Annað']
  const origServings = recipe.servings || 1
  const displayServings = adjustedServings ?? origServings
  const ratio = displayServings / origServings

  const scaleAmount = (amt) => {
    if (!amt) return amt
    // Handle fractions like "1/2"
    const num = amt.includes('/') ? amt.split('/').reduce((a, b) => Number(a) / Number(b)) : Number(amt)
    if (!Number.isFinite(num)) return amt
    const scaled = num * ratio
    // Clean display
    return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, '')
  }

  const hasPros = recipe.nutrition?.pros?.length > 0
  const hasCons = recipe.nutrition?.cons?.length > 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} /> Til baka
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-[var(--border)] hover:bg-[var(--bg-hover)]"
            title={recipe.favorite ? 'Fjarlægja úr uppáhaldi' : 'Bæta í uppáhald'}
          >
            <Heart size={16} className={recipe.favorite ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]'} />
          </button>
          <button
            onClick={onDuplicate}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            title="Afrita"
          >
            <Copy size={16} /> Afrita
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25"
            title="Breyta"
          >
            <Pencil size={16} /> Breyta
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--error)]/15 text-[var(--error)] hover:bg-[var(--error)]/25"
            title="Eyða"
          >
            <Trash2 size={16} /> Eyða
          </button>
        </div>
      </div>

      <div className="mt-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden" style={{ borderTopColor: cc.bg, borderTopWidth: '2px' }}>
        {recipe.image ? (
          <div className="h-56 bg-[var(--bg-primary)] relative">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.5), ${cc.gradient}, transparent)` }} />
          </div>
        ) : (
          <div className="h-56 bg-[var(--bg-primary)] flex items-center justify-center" style={{ color: cc.text }}>
            <ChefHat size={28} />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{recipe.name}</h1>
              {recipe.description ? (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{recipe.description}</p>
              ) : null}
            </div>
            <div className="text-2xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: cc.muted, color: cc.text }}>
              {recipe.category}
            </div>
          </div>

          {/* Servings slider */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
              <Users size={14} />
              <button onClick={() => setAdjustedServings(Math.max(1, displayServings - 1))} className="p-0.5 rounded hover:bg-white/10"><Minus size={12} /></button>
              <span className="font-semibold text-[var(--text-primary)] min-w-[2ch] text-center">{displayServings}</span>
              <button onClick={() => setAdjustedServings(displayServings + 1)} className="p-0.5 rounded hover:bg-white/10"><Plus size={12} /></button>
              <span>skammtar</span>
              {adjustedServings !== null && adjustedServings !== origServings && (
                <button onClick={() => setAdjustedServings(null)} className="text-2xs text-[var(--accent)] hover:underline ml-1">Endurstilla</button>
              )}
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
              <Clock size={14} /> Undirb.: {minutesLabel(recipe.prepTime)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
              <Clock size={14} /> Eldun: {minutesLabel(recipe.cookTime)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
              <Clock size={14} /> Samtals: {minutesLabel(totalTime(recipe))}
            </span>
          </div>

          {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {recipe.tags.map(t => (
                <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)] inline-flex items-center gap-1">
                  <Tag size={12} /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Nutrition Pros/Cons */}
          {(hasPros || hasCons) && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasPros && (
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <h3 className="text-sm font-semibold text-green-400 flex items-center gap-1 mb-2"><ThumbsUp size={14} /> Kostir</h3>
                  <ul className="space-y-1">
                    {recipe.nutrition.pros.map((p, i) => (
                      <li key={i} className="text-sm text-green-300/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasCons && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1 mb-2"><ThumbsDown size={14} /> Gallar</h3>
                  <ul className="space-y-1">
                    {recipe.nutrition.cons.map((c, i) => (
                      <li key={i} className="text-sm text-red-300/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Innihald {ratio !== 1 ? <span className="text-2xs text-[var(--text-muted)] font-normal ml-1">(aðlagað)</span> : ''}</h2>
              <ul className="mt-2 space-y-2">
                {(recipe.ingredients || []).map((i, idx) => (
                  <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-baseline justify-between gap-4">
                    <span className="text-[var(--text-primary)]">{i.name}</span>
                    <span className="text-[var(--text-muted)] whitespace-nowrap">
                      {scaleAmount(i.amount || '')} {(i.unit || '')}
                    </span>
                  </li>
                ))}
                {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                  <li className="text-sm text-[var(--text-muted)]">Ekkert innihald skráð.</li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Leiðbeiningar</h2>
              <ol className="mt-2 space-y-2 list-decimal list-inside">
                {(recipe.instructions || []).map((s, idx) => (
                  <li key={idx} className="text-sm text-[var(--text-secondary)]">
                    {s}
                  </li>
                ))}
                {(!recipe.instructions || recipe.instructions.length === 0) && (
                  <li className="text-sm text-[var(--text-muted)]">Engin skref skráð.</li>
                )}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecipeBank() {
  const recipes = useStore(s => s.recipes) || []
  const addRecipe = useStore(s => s.addRecipe)
  const updateRecipe = useStore(s => s.updateRecipe)
  const removeRecipe = useStore(s => s.removeRecipe)
  const importRecipes = useStore(s => s.importRecipes)
  const toggleFavoriteRecipe = useStore(s => s.toggleFavoriteRecipe)

  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [tagQuery, setTagQuery] = useState('')
  const [category, setCategory] = useState('Allt')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [modalInitialRecipe, setModalInitialRecipe] = useState(null)

  const [smartPasteOpen, setSmartPasteOpen] = useState(false)
  const [ioOpen, setIoOpen] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!ioOpen) return
    const onMouseDown = (e) => {
      const el = e.target
      if (el?.closest?.('[data-io-menu]')) return
      setIoOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [ioOpen])

  const selectedRecipe = useMemo(() => {
    return recipes.find(r => r.id === selectedId) || null
  }, [recipes, selectedId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const tags = normalizeTags(tagQuery).map(t => t.toLowerCase())

    return (recipes || [])
      .filter(r => {
        if (showFavoritesOnly && !r.favorite) return false
        if (category !== 'Allt' && r.category !== category) return false
        if (q) {
          const hay = `${r.name || ''} ${r.description || ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        if (tags.length) {
          const rt = (r.tags || []).map(t => String(t).toLowerCase())
          const ok = tags.every(t => rt.includes(t))
          if (!ok) return false
        }
        return true
      })
      .sort((a, b) => {
        // Favorites first
        if (a.favorite && !b.favorite) return -1
        if (!a.favorite && b.favorite) return 1
        const ta = new Date(a.createdAt || 0).getTime()
        const tb = new Date(b.createdAt || 0).getTime()
        return tb - ta
      })
  }, [recipes, search, category, tagQuery, showFavoritesOnly])

  const deleteSelected = () => {
    if (!selectedRecipe) return
    const ok = window.confirm('Ertu viss um að þú viljir eyða þessari uppskrift?')
    if (!ok) return
    removeRecipe(selectedRecipe.id)
    setSelectedId(null)
  }

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedId(null)}
        onToggleFavorite={() => toggleFavoriteRecipe(selectedRecipe.id)}
        onEdit={() => {
          setModalMode('edit')
          setModalInitialRecipe(selectedRecipe)
          setModalOpen(true)
        }}
        onDuplicate={() => {
          const ok = window.confirm('Afrita þessa uppskrift?')
          if (!ok) return
          addRecipe({
            ...selectedRecipe,
            id: undefined,
            name: `${selectedRecipe.name} (afrit)`,
            createdAt: new Date().toISOString(),
          })
        }}
        onDelete={deleteSelected}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Uppskriftabanki</h1>
            <p className="text-sm text-[var(--text-muted)]">Leita, sía og vista uppáhalds pastarétti.</p>
          </div>

          <div className="relative flex items-center gap-2" data-io-menu>
            <button
              onClick={() => setSmartPasteOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              title="Límdu uppskrift — AI greinir"
            >
              <Sparkles size={16} /> Smart Paste
            </button>
            <button
              onClick={() => {
                setModalMode('create')
                setModalInitialRecipe(null)
                setModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            >
              <Plus size={16} /> Ný uppskrift
            </button>

            <button
              onClick={() => setIoOpen(v => !v)}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              title="Flytja inn / út"
            >
              <MoreVertical size={16} />
            </button>

            {ioOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-20">
                <button
                  onClick={() => {
                    setIoOpen(false)
                    const json = JSON.stringify(recipes || [], null, 2)
                    const blob = new Blob([json], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'arnarflow-recipes.json'
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    setTimeout(() => URL.revokeObjectURL(url), 1000)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                >
                  <Download size={16} className="text-[var(--text-muted)]" /> Flytja út (JSON)
                </button>
                <button
                  onClick={() => {
                    setIoOpen(false)
                    fileInputRef.current?.click()
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                >
                  <Upload size={16} className="text-[var(--text-muted)]" /> Flytja inn (JSON)
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                try {
                  const file = e.target.files?.[0]
                  if (!file) return
                  e.target.value = ''

                  const text = await file.text()
                  const parsed = JSON.parse(text)
                  const arr = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.recipes) ? parsed.recipes : null)
                  if (!Array.isArray(arr)) throw new Error('JSON þarf að vera array af uppskriftum.')

                  const cleaned = []
                  let invalid = 0
                  for (const x of arr) {
                    const v = validateRecipe(x)
                    if (!v.ok) { invalid++; continue }
                    cleaned.push(v.recipe)
                  }

                  if (!cleaned.length) throw new Error('Engar gildar uppskriftir fundust í skránni.')

                  const existingIds = new Set((recipes || []).map(r => r.id))
                  const collisions = cleaned.filter(r => r.id && existingIds.has(r.id)).length

                  let onCollision = 'update'
                  if (collisions > 0) {
                    const ok = window.confirm(`Fundust ${collisions} id-árekstrar. OK = uppfæra núverandi. Hætta við = búa til nýjar afrit (ný id).`)
                    onCollision = ok ? 'update' : 'newId'
                  }

                  const summary = importRecipes(cleaned, { onCollision })

                  window.alert(`Innflutningur kláraður.\nNýjar: ${summary.imported}\nUppfærðar: ${summary.updated}\nSleppt: ${summary.skipped}\nÓgildar færslur: ${invalid}`)
                } catch (err) {
                  window.alert(err?.message || 'Villa við innflutning.')
                }
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                placeholder="Leita eftir nafni..."
              />
            </div>

            <div className="md:w-72 relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                placeholder="tög: air-fryer, quick"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const active = category === c
              const catColor = CATEGORY_COLORS[c]
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    active
                      ? 'border-transparent'
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                  style={active && catColor ? { backgroundColor: catColor.muted, color: catColor.text, borderColor: catColor.bg + '44' } : active ? { backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' } : undefined}
                >
                  {c}
                </button>
              )
            })}
            <button
              onClick={() => setShowFavoritesOnly(v => !v)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all inline-flex items-center gap-1 ${
                showFavoritesOnly
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Heart size={12} className={showFavoritesOnly ? 'fill-red-400' : ''} /> Uppáhald
            </button>
          </div>
        </div>

        <div className="mt-5">
          {filtered.length === 0 ? (
            <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <ChefHat size={18} className="text-[var(--accent)]" />
                <div>
                  <div className="text-sm text-[var(--text-primary)] font-semibold">Engar uppskriftir fundust</div>
                  <div className="text-sm text-[var(--text-muted)]">Prófaðu að breyta leit/síum eða bættu við nýrri uppskrift.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onOpen={() => setSelectedId(r.id)}
                  onToggleFavorite={() => toggleFavoriteRecipe(r.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RecipeModal
        open={modalOpen}
        mode={modalMode}
        initialRecipe={modalInitialRecipe}
        onClose={() => setModalOpen(false)}
        onSave={(payload) => {
          if (modalMode === 'edit' && modalInitialRecipe?.id) {
            updateRecipe(modalInitialRecipe.id, payload)
            return
          }
          addRecipe(payload)
        }}
      />

      <SmartPasteModal
        open={smartPasteOpen}
        onClose={() => setSmartPasteOpen(false)}
        onSave={(parsed) => {
          addRecipe({
            ...parsed,
            createdAt: new Date().toISOString(),
          })
        }}
      />
    </div>
  )
}
