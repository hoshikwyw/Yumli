import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '@/features/recipes/hooks/useRecipes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BackLink, Button, Card, Container, Input, Select, Skeleton, StateMessage, Textarea } from '@/components/ui';
import ListEditor from '@/features/admin/components/ListEditor';
import PhotoPicker from '@/features/admin/components/PhotoPicker';
import * as recipeService from '@/features/recipes/recipeService';
import type { RecipeInput } from '@/features/recipes/recipeService';
import { getYouTubeId, youTubeEmbedUrl } from '@/lib/youtube';
import { errorMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';

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

type FieldErrors = Partial<Record<
  'title' | 'description' | 'category_id' | 'images' | 'prep_time' | 'cook_time' | 'ingredients' | 'instructions',
  string
>>;

/**
 * What must be filled in before a recipe can be saved, with the message for
 * each gap. It mirrors the server's rules (api/_lib/validate.ts), so the admin
 * sees every problem at once instead of one server error at a time.
 */
function validate(form: RecipeInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Give the recipe a name.';
  if (!form.description.trim()) errors.description = 'Add a short description.';
  if (!form.category_id) errors.category_id = 'Choose a category.';
  if (form.images.length === 0) errors.images = 'Add at least one photo.';
  if (!form.prep_time.trim()) errors.prep_time = 'Add a prep time.';
  if (!form.cook_time.trim()) errors.cook_time = 'Add a cook time.';
  if (!form.ingredients.some((item) => item.trim())) errors.ingredients = 'Add at least one ingredient.';
  if (!form.instructions.some((item) => item.trim())) errors.instructions = 'Add at least one step.';
  return errors;
}

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();
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
  /** Photos uploaded in this visit: they belong to no saved recipe until Save succeeds. */
  const [newUploads, setNewUploads] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    recipeService.getRecipeById(id, { fresh: true })
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

  const handleAddImages = async (files: File[]) => {
    setUploading(true);
    const uploaded: string[] = [];
    const label = (done: number) => (files.length === 1 ? 'Uploading photo…' : `Uploading photo ${done + 1} of ${files.length}…`);
    // One notification follows the whole upload: a progress bar, then the result.
    const toastId = notify.loading(label(0), { progress: 0 });
    try {
      for (const [index, file] of files.entries()) {
        notify.update(toastId, { title: label(index), progress: index / files.length });
        uploaded.push(await recipeService.uploadImage(file));
      }
      notify.update(toastId, {
        type: 'success',
        title: files.length === 1 ? 'Photo added' : `${files.length} photos added`,
        progress: null,
        duration: 4000,
      });
    } catch (error) {
      notify.update(toastId, { type: 'error', title: 'Upload failed', description: errorMessage(error), progress: null });
    }
    // Keep whatever did upload, even if a later file failed.
    if (uploaded.length > 0) {
      setImages([...form.images, ...uploaded]);
      setNewUploads((prev) => [...prev, ...uploaded]);
    }
    setUploading(false);
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

  /**
   * Ask before throwing work away. On yes, photos uploaded in this visit are
   * removed from storage too: nothing refers to them, so they would sit there forever.
   */
  const confirmDiscard = () => {
    if (dirty && !confirm('Discard your changes?')) return false;
    for (const url of newUploads) void recipeService.deleteImage(url).catch(() => {});
    return true;
  };

  const handleCancel = () => {
    if (confirmDiscard()) navigate('/admin');
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
      notify.success(id ? 'Changes saved' : 'Recipe created', { description: clean.title });
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
          icon={loadState === 'missing' ? 'search' : 'sad'}
          title={loadState === 'missing' ? 'This recipe no longer exists' : 'Could not load this recipe'}
          action={<Button to="/admin" variant="primary">Back to dashboard</Button>}
        />
      </Container>
    );
  }

  const videoId = form.youtube_link ? getYouTubeId(form.youtube_link) : null;

  return (
    <Container size="md" className="py-4 sm:py-8">
      <BackLink
        to="/admin"
        onClick={(e) => { if (!confirmDiscard()) e.preventDefault(); }}
      >
        Dashboard
      </BackLink>
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

          <PhotoPicker
            images={form.images}
            max={MAX_IMAGES}
            uploading={uploading}
            error={errors.images}
            onAdd={handleAddImages}
            onRemove={handleRemoveImage}
            onMakeCover={handleMakeCover}
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
              error={errors.prep_time}
            />
            <Input
              label="Cook time"
              value={form.cook_time}
              onChange={(e) => updateField('cook_time', e.target.value)}
              placeholder="20 min"
              error={errors.cook_time}
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
          error={errors.ingredients}
        />

        <ListEditor
          title="Steps"
          tone="pastel-mint"
          multiline
          items={form.instructions}
          onChange={(items) => updateField('instructions', items)}
          placeholder={(i) => `Step ${i + 1}`}
          addLabel="+ Add step"
          error={errors.instructions}
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
