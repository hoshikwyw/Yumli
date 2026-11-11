import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fonts } from '../../themes/font';
import { Container, Card, Button, Badge, Input } from '../../components/common';
import * as recipeService from '../../services/recipeService';
import type { Recipe, Category } from '../../types';

type Tab = 'recipes' | 'categories';

export default function Dashboard() {
  const { isLoggedIn, checking, logout } = useAuth();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [tab, setTab] = useState<Tab>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState('');

  useEffect(() => {
    if (checking) return;
    if (!isLoggedIn) { navigate('/admin/login'); return; }
    loadData();
  }, [checking, isLoggedIn, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([recipeService.getRecipes(), recipeService.getCategories()]);
      setRecipes(r);
      setCategories(c);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleDeleteRecipe = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    setError('');
    try {
      await recipeService.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`);
    }
    setDeleting(null);
  };

  // ── Category handlers ──
  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setCatSaving(true);
    setCatError('');
    try {
      await recipeService.createCategory(name);
      setNewCatName('');
      const cats = await recipeService.getCategories();
      setCategories(cats);
    } catch (err: any) {
      setCatError(err.message?.includes('already used') ? 'Category already exists' : err.message || 'Failed to create');
    }
    setCatSaving(false);
  };

  const handleStartEditCat = (cat: Category) => {
    setEditingCat(cat.id);
    setEditCatName(cat.name);
    setCatError('');
  };

  const handleSaveEditCat = async (id: string) => {
    const name = editCatName.trim();
    if (!name) return;
    setCatSaving(true);
    setCatError('');
    try {
      await recipeService.updateCategory(id, name);
      setEditingCat(null);
      const cats = await recipeService.getCategories();
      setCategories(cats);
    } catch (err: any) {
      setCatError(err.message?.includes('already used') ? 'Name already taken' : err.message || 'Failed to update');
    }
    setCatSaving(false);
  };

  const handleDeleteCat = async (id: string, name: string) => {
    const recipesInCat = recipes.filter((r) => r.category === name).length;
    const msg = recipesInCat > 0
      ? `"${name}" has ${recipesInCat} recipe(s). Deleting will unlink them. Continue?`
      : `Delete category "${name}"?`;
    if (!confirm(msg)) return;
    setDeleting(id);
    try {
      await recipeService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
    setDeleting(null);
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const recipeCountForCat = (catName: string) => recipes.filter((r) => r.category === catName).length;

  return (
    <div style={{ backgroundColor: colors.bgPrimary }} className="min-h-screen">
      {/* Header */}
      <div style={{ backgroundColor: colors.cardBg, borderBottom: `3px solid ${colors.pixelBorder}` }} className="py-3 sm:py-4">
        <Container>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🍳</span>
              <h1 style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }} className="text-[10px] sm:text-sm">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/new">
                <Button variant="primary" size="sm">+ NEW</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>LOGOUT</Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6 sm:py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card variant="pastel-pink" className="p-3 sm:p-5 text-center">
            <div style={{ ...fonts.h2, color: colors.primary, fontSize: undefined }} className="text-base sm:text-xl">
              {recipes.length}
            </div>
            <div style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }} className="text-[10px] sm:text-xs mt-1">
              Recipes
            </div>
          </Card>
          <Card variant="pastel-mint" className="p-3 sm:p-5 text-center">
            <div style={{ ...fonts.h2, color: colors.accent, fontSize: undefined }} className="text-base sm:text-xl">
              {recipes.filter((r) => r.is_featured).length}
            </div>
            <div style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }} className="text-[10px] sm:text-xs mt-1">
              Featured
            </div>
          </Card>
          <Card variant="pastel-lavender" className="p-3 sm:p-5 text-center">
            <div style={{ ...fonts.h2, color: colors.secondary, fontSize: undefined }} className="text-base sm:text-xl">
              {categories.length}
            </div>
            <div style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }} className="text-[10px] sm:text-xs mt-1">
              Categories
            </div>
          </Card>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              backgroundColor: colors.primaryPastel,
              border: `2px solid ${colors.error}`,
              color: colors.error,
              fontFamily: "'Nunito', sans-serif",
              padding: '10px 14px',
              marginBottom: '16px',
            }}
            className="text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ border: 'none', background: 'none', color: colors.error, cursor: 'pointer', fontWeight: 700 }}>x</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['recipes', 'categories'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...fonts.tag,
                backgroundColor: tab === t ? colors.primary : colors.cardBg,
                color: tab === t ? colors.textLight : colors.textPrimary,
                border: `2px solid ${tab === t ? colors.primary : colors.pixelBorder}`,
                boxShadow: tab === t ? 'none' : `2px 2px 0px ${colors.pixelBorder}`,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ═══ Recipes Tab ═══ */}
        {tab === 'recipes' && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <p style={{ ...fonts.body, color: colors.textMuted }}>Loading recipes...</p>
              </div>
            ) : recipes.length === 0 ? (
              <Card variant="default" className="p-8 sm:p-12 text-center">
                <p style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }} className="text-sm sm:text-base mb-4">
                  No recipes yet. Add your first one!
                </p>
                <Link to="/admin/new">
                  <Button variant="primary" size="md">+ ADD RECIPE</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} variant="default" className="p-0 overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          style={{ color: colors.textPrimary, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                          className="text-sm sm:text-base truncate"
                        >
                          {recipe.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant={recipe.is_featured ? 'primary' : 'outline'}>
                            {recipe.is_featured ? 'FEATURED' : 'NORMAL'}
                          </Badge>
                          <span style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }} className="text-[10px] sm:text-xs">
                            {recipe.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <Link to={`/admin/edit/${recipe.id}`}>
                          <Button variant="outline" size="sm">EDIT</Button>
                        </Link>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                          disabled={deleting === recipe.id}
                          style={{ color: colors.error }}
                        >
                          {deleting === recipe.id ? '...' : 'DEL'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ Categories Tab ═══ */}
        {tab === 'categories' && (
          <div className="space-y-6">
            {/* Add new category */}
            <Card variant="default" className="p-4 sm:p-6">
              <h3
                style={{ ...fonts.h3, color: colors.textPrimary, fontSize: undefined }}
                className="text-[11px] sm:text-sm mb-4"
              >
                Add Category
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }}}
                  />
                </div>
                <Button
                  variant="primary" size="md"
                  onClick={handleAddCategory}
                  disabled={catSaving || !newCatName.trim()}
                >
                  {catSaving ? '...' : 'ADD'}
                </Button>
              </div>
              {catError && (
                <p style={{ color: colors.error, fontFamily: "'Nunito', sans-serif" }} className="text-xs sm:text-sm mt-2">
                  {catError}
                </p>
              )}
            </Card>

            {/* Category list */}
            {loading ? (
              <div className="text-center py-12">
                <p style={{ ...fonts.body, color: colors.textMuted }}>Loading...</p>
              </div>
            ) : categories.length === 0 ? (
              <Card variant="default" className="p-8 text-center">
                <p style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }} className="text-sm">
                  No categories yet. Add one above!
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const count = recipeCountForCat(cat.name);
                  const isEditing = editingCat === cat.id;

                  return (
                    <Card key={cat.id} variant="default" className="p-0">
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                        {/* Color dot */}
                        <div
                          style={{
                            width: '36px', height: '36px',
                            backgroundColor: colors.primaryPastel,
                            border: `2px solid ${colors.primary}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                            fontSize: '14px', color: colors.primary,
                          }}
                          className="rounded-lg"
                        >
                          {cat.name.charAt(0)}
                        </div>

                        {/* Name / edit input */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); handleSaveEditCat(cat.id); }
                                if (e.key === 'Escape') setEditingCat(null);
                              }}
                              style={{
                                fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 700,
                                border: `2px solid ${colors.primary}`, padding: '6px 10px',
                                outline: 'none', width: '100%', color: colors.textPrimary,
                                backgroundColor: colors.primaryPastel,
                              }}
                            />
                          ) : (
                            <>
                              <h3
                                style={{ color: colors.textPrimary, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
                                className="text-sm sm:text-base"
                              >
                                {cat.name}
                              </h3>
                              <span style={{ color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }} className="text-[10px] sm:text-xs">
                                {count} {count === 1 ? 'recipe' : 'recipes'}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEditing ? (
                            <>
                              <Button variant="primary" size="sm" onClick={() => handleSaveEditCat(cat.id)} disabled={catSaving}>
                                {catSaving ? '...' : 'SAVE'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setEditingCat(null)}>
                                ESC
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleStartEditCat(cat)}>
                                EDIT
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleDeleteCat(cat.id, cat.name)}
                                disabled={deleting === cat.id}
                                style={{ color: colors.error }}
                              >
                                {deleting === cat.id ? '...' : 'DEL'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
