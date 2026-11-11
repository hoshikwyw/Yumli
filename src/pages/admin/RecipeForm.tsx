import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useRecipes';
import { fonts } from '../../themes/font';
import { Container, Card, Button, Input, Textarea, Select } from '../../components/common';
import * as recipeService from '../../services/recipeService';
import type { RecipeInput } from '../../services/recipeService';

const MAX_IMAGES = 3;

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { isLoggedIn, checking } = useAuth();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [form, setForm] = useState<RecipeInput>({
    title: '',
    description: '',
    image: '',
    images: [],
    prep_time: '',
    cook_time: '',
    servings: 1,
    difficulty: 'Easy',
    ingredients: [''],
    instructions: [''],
    category_id: '',
    is_featured: false,
    youtube_link: '',
  });

  useEffect(() => {
    if (checking) return;
    if (!isLoggedIn) { navigate('/admin/login'); return; }
    if (isEdit && id) {
      recipeService.getRawRecipeById(id).then((data) => {
        if (data) {
          setForm({
            title: data.title,
            description: data.description,
            image: data.image ?? '',
            images: data.images ?? [],
            prep_time: data.prep_time,
            cook_time: data.cook_time,
            servings: data.servings,
            difficulty: data.difficulty,
            ingredients: data.ingredients?.length ? data.ingredients : [''],
            instructions: data.instructions?.length ? data.instructions : [''],
            category_id: data.category_id ?? '',
            is_featured: data.is_featured ?? false,
            youtube_link: data.youtube_link ?? '',
          });
        }
        setLoading(false);
      });
    }
  }, [checking, isLoggedIn, isEdit, id, navigate]);

  const updateField = <K extends keyof RecipeInput>(key: K, value: RecipeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateListItem = (key: 'ingredients' | 'instructions', index: number, value: string) => {
    setForm((prev) => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };

  const addListItem = (key: 'ingredients' | 'instructions') => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeListItem = (key: 'ingredients' | 'instructions', index: number) => {
    setForm((prev) => {
      const list = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: list.length ? list : [''] };
    });
  };

  // ── Image upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError('');

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await recipeService.uploadImage(file);
        urls.push(url);
      }

      setForm((prev) => {
        const newImages = [...prev.images, ...urls];
        return {
          ...prev,
          images: newImages,
          image: newImages[0] ?? prev.image, // first image is cover
        };
      });
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    }

    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const url = form.images[index];
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] ?? '',
      };
    });
    // Deleted from storage only once the recipe is saved: until then the
    // saved recipe still shows it, and Cancel must leave it intact.
    setRemovedImages((prev) => [...prev, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.category_id) {
      setError('Please fill in title, description, and category');
      return;
    }
    if (form.images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    const clean: RecipeInput = {
      ...form,
      image: form.images[0] ?? '',
      youtube_link: form.youtube_link?.trim() || null,
      ingredients: form.ingredients.filter((s) => s.trim()),
      instructions: form.instructions.filter((s) => s.trim()),
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await recipeService.updateRecipe(id, clean);
      } else {
        await recipeService.createRecipe(clean);
      }
      // Now that the recipe no longer uses them, clear removed images out of
      // storage. Best effort: a leftover file costs space, not correctness.
      await Promise.all(
        removedImages
          .filter((url) => !clean.images.includes(url))
          .map((url) => recipeService.deleteImage(url).catch(() => {})),
      );
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.bgPrimary }} className="min-h-screen flex items-center justify-center">
        <p style={{ ...fonts.body, color: colors.textMuted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bgPrimary }} className="min-h-screen">
      {/* Header */}
      <div style={{ backgroundColor: colors.cardBg, borderBottom: `3px solid ${colors.pixelBorder}` }} className="py-3 sm:py-4">
        <Container>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>&lt; BACK</Button>
            <h1 style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }} className="text-[10px] sm:text-sm">
              {isEdit ? 'Edit Recipe' : 'New Recipe'}
            </h1>
          </div>
        </Container>
      </div>

      <Container size="md" className="py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Basic Info */}
          <Card variant="default" className="p-4 sm:p-6 space-y-4">
            <Input label="TITLE" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Recipe name" />
            <Textarea label="DESCRIPTION" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Short description" />
          </Card>

          {/* Image Upload */}
          <Card variant="default" className="p-4 sm:p-6">
            <h3 style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }} className="text-[11px] sm:text-sm mb-4">
              Photos ({form.images.length}/{MAX_IMAGES})
            </h3>

            {/* Image grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {form.images.map((url, i) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt={`Recipe ${i + 1}`}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    style={{ border: i === 0 ? `3px solid ${colors.primary}` : `2px solid ${colors.gray200}` }}
                  />
                  {i === 0 && (
                    <span
                      style={{
                        position: 'absolute', bottom: '4px', left: '4px',
                        fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                        fontSize: '9px', backgroundColor: colors.primary,
                        color: '#fff', padding: '2px 6px', borderRadius: '6px',
                      }}
                    >
                      COVER
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    border: `2px dashed ${colors.gray300}`,
                    borderRadius: '12px',
                    backgroundColor: colors.gray50,
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '4px', transition: 'all 0.15s ease',
                  }}
                  className="h-24 sm:h-32 hover:border-primary"
                >
                  {uploading ? (
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: '12px', color: colors.textMuted }}>
                      Uploading...
                    </span>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: '11px', color: colors.textMuted }}>
                        Add photo
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '11px', color: colors.textMuted }}>
              First image is the cover. Max {MAX_IMAGES} images. JPG, PNG, or WebP.
            </p>
          </Card>

          {/* YouTube Link */}
          <Card variant="default" className="p-4 sm:p-6">
            <Input
              label="YOUTUBE VIDEO LINK (OPTIONAL)"
              value={form.youtube_link ?? ''}
              onChange={(e) => updateField('youtube_link', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {form.youtube_link && getYouTubeId(form.youtube_link) && (
              <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `2px solid ${colors.gray200}` }}>
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(form.youtube_link)}`}
                  className="w-full h-40 sm:h-52"
                  allowFullScreen
                  title="Video preview"
                  style={{ border: 'none' }}
                />
              </div>
            )}
          </Card>

          {/* Details */}
          <Card variant="default" className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="PREP TIME" value={form.prep_time} onChange={(e) => updateField('prep_time', e.target.value)} placeholder="10 min" />
              <Input label="COOK TIME" value={form.cook_time} onChange={(e) => updateField('cook_time', e.target.value)} placeholder="20 min" />
              <Input label="SERVINGS" type="number" value={String(form.servings)} onChange={(e) => updateField('servings', parseInt(e.target.value) || 1)} />
              <Select
                label="DIFFICULTY"
                value={form.difficulty}
                onChange={(val) => updateField('difficulty', val as RecipeInput['difficulty'])}
                options={[
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
              />
            </div>

            <Select
              label="CATEGORY"
              value={form.category_id}
              onChange={(val) => updateField('category_id', val)}
              placeholder="Select category..."
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField('is_featured', e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span style={{ color: colors.textPrimary, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }} className="text-sm">
                Featured recipe (shows on homepage)
              </span>
            </label>
          </Card>

          {/* Ingredients */}
          <Card variant="pastel-pink" className="p-4 sm:p-6">
            <h3 style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }} className="mb-4 text-[11px] sm:text-sm">
              Ingredients
            </h3>
            <div className="space-y-2">
              {form.ingredients.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ ...fonts.tag, color: colors.primary }} className="shrink-0 text-[7px] sm:text-[8px] w-6 text-center">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    value={item}
                    onChange={(e) => updateListItem('ingredients', i, e.target.value)}
                    placeholder="e.g. 1 cup flour"
                    style={{
                      fontFamily: "'Nunito', sans-serif", fontSize: '14px',
                      backgroundColor: colors.cardBg, border: `1.5px solid ${colors.primary}`,
                      padding: '10px 14px', width: '100%', outline: 'none', color: colors.textPrimary,
                    }}
                    className="flex-1"
                  />
                  <button
                    type="button" onClick={() => removeListItem('ingredients', i)}
                    style={{ color: colors.error, fontFamily: "'Nunito', sans-serif", fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}
                    className="text-sm px-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button" onClick={() => addListItem('ingredients')}
              style={{ color: colors.primary, fontFamily: "'Nunito', sans-serif", fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}
              className="mt-3 text-sm"
            >
              + Add ingredient
            </button>
          </Card>

          {/* Instructions */}
          <Card variant="pastel-mint" className="p-4 sm:p-6">
            <h3 style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }} className="mb-4 text-[11px] sm:text-sm">
              Instructions
            </h3>
            <div className="space-y-2">
              {form.instructions.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    style={{
                      ...fonts.tag, color: colors.textLight, backgroundColor: colors.accent,
                      border: `2px solid ${colors.pixelBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                    className="w-6 h-6 sm:w-7 sm:h-7 text-[7px] sm:text-[8px] mt-2"
                  >
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateListItem('instructions', i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                    style={{
                      fontFamily: "'Nunito', sans-serif", fontSize: '14px',
                      backgroundColor: colors.cardBg, border: `1.5px solid ${colors.accent}`,
                      padding: '10px 14px', width: '100%', outline: 'none', color: colors.textPrimary,
                      minHeight: '60px', resize: 'vertical',
                    }}
                    className="flex-1"
                  />
                  <button
                    type="button" onClick={() => removeListItem('instructions', i)}
                    style={{ color: colors.error, fontFamily: "'Nunito', sans-serif", fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}
                    className="text-sm px-1 mt-2"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button" onClick={() => addListItem('instructions')}
              style={{ color: colors.accent, fontFamily: "'Nunito', sans-serif", fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}
              className="mt-3 text-sm"
            >
              + Add step
            </button>
          </Card>

          {/* Error & Submit */}
          {error && (
            <p style={{ color: colors.error, fontFamily: "'Nunito', sans-serif" }} className="text-sm text-center">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="md" type="button" onClick={() => navigate('/admin')}>CANCEL</Button>
            <Button variant="primary" size="md" type="submit" disabled={saving}>
              {saving ? 'SAVING...' : isEdit ? 'UPDATE' : 'CREATE'}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}
