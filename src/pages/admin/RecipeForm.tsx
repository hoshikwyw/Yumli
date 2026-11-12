import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useRecipes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button, Card, Container, Input, RecipeImage, Select, Skeleton, StateMessage, Textarea } from '../../components/common';
import { fieldClasses } from '../../components/common/Input';
import { ArrowLeftIcon, CloseIcon } from '../../components/icons';
import * as recipeService from '../../services/recipeService';
import type { RecipeInput } from '../../services/recipeService';
import { getYouTubeId, youTubeEmbedUrl } from '../../utils/youtube';
import { errorMessage } from '../../utils/errors';

const MAX_IMAGES = 3;

const EMPTY_FORM: RecipeInput = {
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
};

type FieldErrors = Partial<Record<'title' | 'description' | 'category_id' | 'images', string>>;

/** What must be filled in before a recipe can be saved, with the message for each gap. */
function validate(form: RecipeInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Give the recipe a name.';
  if (!form.description.trim()) errors.description = 'Add a short description.';
  if (!form.category_id) errors.category_id = 'Choose a category.';
  if (form.images.length === 0) errors.images = 'Add at least one photo.';
  return errors;
}

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useDocumentTitle(isEdit ? 'Edit recipe' : 'New recipe');

  const [form, setForm] = useState<RecipeInput>(EMPTY_FORM);
  /** Edit mode only: 'loading' until the recipe arrives, 'missing' if it does not exist. */
  const [loadState, setLoadState] = useState<'ready' | 'loading' | 'missing' | 'failed'>(isEdit ? 'loading' : 'ready');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    recipeService.getRawRecipeById(id)
      .then((data) => {
        if (stale) return;
        if (!data) { setLoadState('missing'); return; }
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
        setLoadState('ready');
      })
      .catch(() => { if (!stale) setLoadState('failed'); });
    return () => { stale = true; };
  }, [id]);

  // Closing the tab or reloading with unsaved work asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const updateField = <K extends keyof RecipeInput>(key: K, value: RecipeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    // The field is being fixed: stop showing its error.
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /** The first image is the cover; `image` mirrors it for older code that reads a single picture. */
  const setImages = (images: string[]) => {
    setForm((prev) => ({ ...prev, images, image: images[0] ?? '' }));
    setDirty(true);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - form.images.length);
    if (files.length === 0) return;

    setUploading(true);
    setFormError('');
    const uploaded: string[] = [];
    try {
      for (const file of files) uploaded.push(await recipeService.uploadImage(file));
    } catch (error) {
      setFormError(`Upload failed: ${errorMessage(error)}`);
    }
    // Keep whatever did upload, even if a later file failed.
    if (uploaded.length > 0) setImages([...form.images, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    // Deleted from storage only once the recipe is saved: until then the
    // saved recipe still shows it, and Cancel must leave it intact.
    setRemovedImages((prev) => [...prev, form.images[index]]);
    setImages(form.images.filter((_, i) => i !== index));
  };

  const handleMakeCover = (index: number) => {
    setImages([form.images[index], ...form.images.filter((_, i) => i !== index)]);
  };

  const handleCancel = () => {
    if (dirty && !confirm('Discard your changes?')) return;
    navigate('/admin');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError('');

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Some things are missing. Check the fields marked above.');
      return;
    }

    const clean: RecipeInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.images[0] ?? '',
      youtube_link: form.youtube_link?.trim() || null,
      ingredients: form.ingredients.map((s) => s.trim()).filter(Boolean),
      instructions: form.instructions.map((s) => s.trim()).filter(Boolean),
    };

    setSaving(true);
    try {
      if (id) await recipeService.updateRecipe(id, clean);
      else await recipeService.createRecipe(clean);
      // Now that the recipe no longer uses them, clear removed images out of
      // storage. Best effort: a leftover file costs space, not correctness.
      await Promise.all(
        removedImages
          .filter((url) => !clean.images.includes(url))
          .map((url) => recipeService.deleteImage(url).catch(() => {})),
      );
      navigate('/admin');
    } catch (error) {
      setFormError(errorMessage(error));
      setSaving(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <Container size="md" className="py-6 sm:py-10">
        <div aria-busy="true" className="space-y-5">
          <Skeleton height="40px" width="50%" />
          <Skeleton height="220px" className="!rounded-none" />
          <Skeleton height="180px" className="!rounded-none" />
        </div>
      </Container>
    );
  }

  if (loadState !== 'ready') {
    return (
      <Container size="md">
        <StateMessage
          alert={loadState === 'failed'}
          emoji={loadState === 'missing' ? '🔍' : '😕'}
          title={loadState === 'missing' ? 'This recipe no longer exists' : 'Could not load this recipe'}
          action={<Button to="/admin" variant="primary">Back to dashboard</Button>}
        />
      </Container>
    );
  }

  const videoId = form.youtube_link ? getYouTubeId(form.youtube_link) : null;

  return (
    <Container size="md" className="py-4 sm:py-8">
      <Link
        to="/admin"
        onClick={(e) => { if (dirty && !confirm('Discard your changes?')) e.preventDefault(); }}
        className="inline-flex items-center gap-1.5 min-h-11 text-base font-extrabold text-ink-soft no-underline hover:text-primary-ink"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Dashboard
      </Link>
      <h1 className="text-title text-ink mt-1 mb-5">{isEdit ? 'Edit recipe' : 'New recipe'}</h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Basics */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Recipe name"
            error={errors.title}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="One or two sentences about the dish"
            error={errors.description}
          />
        </Card>

        {/* Photos */}
        <Card variant="default" className="p-4 sm:p-6">
          <h2 className="text-subheading text-ink">Photos ({form.images.length}/{MAX_IMAGES})</h2>
          <p className="text-sm text-ink-muted mb-3">
            The first photo is the cover. Photos are shrunk automatically before upload.
          </p>

          <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            {form.images.map((url, i) => (
              <li key={url} className={`relative aspect-square overflow-hidden border-[3px] ${i === 0 ? 'border-primary' : 'border-line-soft'}`}>
                <RecipeImage src={url} alt={`Photo ${i + 1}`} />
                {/* Always visible: a hover-only button cannot be found on a touch screen */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-0 right-0 flex items-center justify-center w-11 h-11"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2B2B3D]/85 text-white">
                    <CloseIcon className="w-4 h-4" strokeWidth={3} />
                  </span>
                </button>
                {i === 0 ? (
                  <span className="absolute bottom-1 left-1 bg-primary text-on-fill text-[0.8125rem] font-extrabold px-2 py-0.5">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(i)}
                    className="absolute bottom-0 inset-x-0 min-h-9 bg-surface/95 text-ink text-[0.8125rem] font-extrabold"
                  >
                    Make cover
                  </button>
                )}
              </li>
            ))}

            {form.images.length < MAX_IMAGES && (
              <li className="aspect-square">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full h-full flex flex-col items-center justify-center gap-1 border-2 border-dashed bg-surface-alt text-sm font-bold text-ink-soft hover:border-primary disabled:cursor-wait ${
                    errors.images ? 'border-primary-ink' : 'border-line'
                  }`}
                >
                  <span className="text-2xl leading-none" aria-hidden="true">{uploading ? '⏳' : '📷'}</span>
                  {uploading ? 'Uploading…' : 'Add photo'}
                </button>
              </li>
            )}
          </ul>
          {errors.images && (
            <p role="alert" className="mt-2 text-sm font-semibold text-primary-ink">{errors.images}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </Card>

        {/* Details */}
        <Card variant="default" className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Prep time"
              value={form.prep_time}
              onChange={(e) => updateField('prep_time', e.target.value)}
              placeholder="10 min"
            />
            <Input
              label="Cook time"
              value={form.cook_time}
              onChange={(e) => updateField('cook_time', e.target.value)}
              placeholder="20 min"
            />
            <Input
              label="Servings"
              type="number"
              inputMode="numeric"
              min={1}
              value={String(form.servings)}
              onChange={(e) => updateField('servings', Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(value) => updateField('difficulty', value as RecipeInput['difficulty'])}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' },
              ]}
            />
          </div>

          <Select
            label="Category"
            value={form.category_id}
            onChange={(value) => updateField('category_id', value)}
            placeholder="Choose a category…"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id}
          />

          <label className="flex items-center gap-3 min-h-11 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
              className="w-6 h-6 shrink-0 accent-primary"
            />
            <span className="text-base font-bold text-ink">Featured: show on the home page</span>
          </label>
        </Card>

        <ListEditor
          title="Ingredients"
          tone="pastel-pink"
          items={form.ingredients}
          onChange={(items) => updateField('ingredients', items)}
          placeholder={() => 'e.g. 1 cup flour'}
          addLabel="+ Add ingredient"
        />

        <ListEditor
          title="Steps"
          tone="pastel-mint"
          multiline
          items={form.instructions}
          onChange={(items) => updateField('instructions', items)}
          placeholder={(i) => `Step ${i + 1}`}
          addLabel="+ Add step"
        />

        {/* Video */}
        <Card variant="default" className="p-4 sm:p-6">
          <Input
            label="YouTube video link (optional)"
            type="url"
            inputMode="url"
            value={form.youtube_link ?? ''}
            onChange={(e) => updateField('youtube_link', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            error={form.youtube_link?.trim() && !videoId ? 'This does not look like a YouTube link.' : undefined}
          />
          {videoId && (
            <div className="relative aspect-video mt-3 border-2 border-line-soft">
              <iframe
                src={youTubeEmbedUrl(videoId)}
                title="Video preview"
                loading="lazy"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          )}
        </Card>

        {/* Actions: stay on screen while the long form scrolls */}
        <div className="sticky bottom-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-bg border-t-2 border-line-soft">
          {formError && (
            <p role="alert" className="mb-2 text-base font-semibold text-primary-ink sm:text-right">{formError}</p>
          )}
          <div className="flex gap-3 sm:justify-end">
            <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving || uploading} className="flex-1 sm:flex-none">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create recipe'}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  );
}

// ── Editable list (ingredients, steps) ──

interface ListEditorProps {
  title: string;
  tone: 'pastel-pink' | 'pastel-mint';
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: (index: number) => string;
  addLabel: string;
  /** Use a taller text box per item: for steps, which are sentences. */
  multiline?: boolean;
}

function ListEditor({ title, tone, items, onChange, placeholder, addLabel, multiline = false }: ListEditorProps) {
  /** Row to put the cursor in when it appears: the one just added. */
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));

  const add = () => {
    setFocusIndex(items.length);
    onChange([...items, '']);
  };

  const remove = (index: number) => {
    setFocusIndex(null);
    const next = items.filter((_, i) => i !== index);
    onChange(next.length ? next : ['']);
  };

  return (
    <Card variant={tone} className="p-4 sm:p-6">
      <h2 className="text-subheading text-ink mb-3">{title}</h2>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span aria-hidden="true" className="shrink-0 w-7 pt-3 text-right text-base font-extrabold text-ink-soft">
              {i + 1}.
            </span>
            {multiline ? (
              <textarea
                value={item}
                rows={2}
                autoFocus={focusIndex === i}
                aria-label={`${title} ${i + 1}`}
                placeholder={placeholder(i)}
                onChange={(e) => update(i, e.target.value)}
                className={`${fieldClasses} flex-1 resize-y`}
              />
            ) : (
              <input
                value={item}
                autoFocus={focusIndex === i}
                aria-label={`${title} ${i + 1}`}
                placeholder={placeholder(i)}
                enterKeyHint="next"
                onChange={(e) => update(i, e.target.value)}
                // Enter moves on to a new row instead of submitting the whole form by accident.
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                className={`${fieldClasses} flex-1`}
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${title.toLowerCase()} ${i + 1}`}
              className="shrink-0 flex items-center justify-center w-11 h-12 text-ink-soft hover:text-primary-ink"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" onClick={add} className="mt-3">{addLabel}</Button>
    </Card>
  );
}
