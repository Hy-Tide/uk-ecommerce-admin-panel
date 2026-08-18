import React, { useState, useEffect } from 'react';
import { Bold, Heading1, Heading2, Italic, Link, List, Plus, Save, Trash2, FolderPlus, Tag } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card from '../components/Card';
import ViewToggle from '../components/ViewToggle';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import { fetchBlogs, createBlog, updateBlog, deleteBlog, toggleBlogStatus, fetchBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory, showSnackbar } from '../services/api';
import { TableShimmer, ShimmerCardGrid } from '../components/ShimmerSkeleton';

export const Blogs = ({
  blogs: initialBlogs = [],
  setBlogs: setParentBlogs,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [blogs, setBlogsState] = useState(initialBlogs);
  const [blogCategories, setBlogCategories] = useState([]);
  const [editingCat, setEditingCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [activeBlog, setActiveBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-blogs-v2') || 'grid';
  });

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  const updateBlogs = (newList) => {
    setBlogsState(newList);
    if (typeof setParentBlogs === 'function') {
      setParentBlogs(newList);
    }
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-blogs-v2', newView);
  };

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('Healthy Recipes');
  const [summary, setSummary] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('Healthy, Nutrition');
  const [readingTime, setReadingTime] = useState('5');
  const [status, setStatus] = useState('Published');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Fetch live blog categories from API
  const loadBlogCategories = async () => {
    try {
      const res = await fetchBlogCategories();
      if (res && res.success !== false) {
        const list = res.data?.categories || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          setBlogCategories(list);
          if (list.length > 0 && !categoryId) {
            setCategoryId(list[0]._id || list[0].id);
            setCategory(list[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch blog categories:', err);
    }
  };

  // Fetch live blogs from backend
  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetchBlogs();
      if (res && res.success !== false) {
        const list = res.data?.blogs || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(b => normalizeBlog(b));
          updateBlogs(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
    loadBlogCategories();
  }, []);

  const normalizeBlog = (b) => {
    const authorName = typeof b.author === 'object' && b.author !== null
      ? (b.author.name || b.author.email || 'Admin')
      : (b.author || 'Admin');

    const tagsArr = Array.isArray(b.tags)
      ? b.tags
      : (typeof b.tags === 'string' ? b.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const isPub = b.isPublished !== undefined
      ? Boolean(b.isPublished)
      : (b.status ? b.status === 'Published' : (b.isActive !== undefined ? Boolean(b.isActive) : true));

    return {
      id: b._id || b.id || `b-${Date.now()}`,
      _id: b._id || b.id,
      title: b.title || '',
      slug: b.slug || '',
      author: authorName,
      category: b.category || b.categoryName || 'Healthy Recipes',
      categoryId: b.categoryId || null,
      summary: b.summary || b.excerpt || '',
      excerpt: b.excerpt || b.summary || '',
      featuredImage: b.coverImage || b.featuredImage,
      coverImage: b.coverImage || b.featuredImage || '',
      content: b.content || '',
      tags: tagsArr,
      tagsText: tagsArr.join(', '),
      readingTime: b.readingTime !== undefined ? String(b.readingTime) : '5',
      status: isPub ? 'Published' : 'Draft',
      isPublished: isPub,
      seoTitle: b.metaTitle || b.seoTitle || b.title || '',
      seoDescription: b.metaDescription || b.seoDescription || b.summary || '',
      metaKeywords: b.metaKeywords || '',
      publishedDate: typeof b.createdAt === 'string' ? b.createdAt.split('T')[0] : (b.publishedDate || new Date().toISOString().split('T')[0])
    };
  };

  const openCreateCatModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('');
    setCreateCatModalOpen(true);
  };

  const openEditCatModal = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name || '');
    setCatSlug(cat.slug || '');
    setCatDesc(cat.description || '');
    setCatImage(cat.image || '');
    setEditCatModalOpen(true);
  };

  const [createCatModalOpen, setCreateCatModalOpen] = useState(false);
  const [editCatModalOpen, setEditCatModalOpen] = useState(false);

  const handleSaveBlogCategory = async (e) => {
    if (e) e.preventDefault();
    if (!catName.trim()) {
      if (addToast) addToast('Category name is required', 'danger');
      return;
    }

    setIsCreatingCategory(true);
    const catPayload = {
      name: catName.trim(),
      slug: catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: catDesc.trim(),
      image: catImage.trim() || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
      displayOrder: editingCat ? (editingCat.displayOrder || 1) : blogCategories.length + 1,
      isActive: editingCat && editingCat.isActive !== undefined ? editingCat.isActive : true
    };

    const isEdit = Boolean(editingCat && (editingCat._id || editingCat.id));
    const targetId = editingCat ? (editingCat._id || editingCat.id) : null;

    try {
      let res;
      if (isEdit) {
        res = await updateBlogCategory(targetId, catPayload);
      } else {
        res = await createBlogCategory(catPayload);
      }

      if (res && res.success !== false) {
        const savedData = res.data?.category || res.data || { ...catPayload, _id: targetId };
        if (isEdit) {
          setBlogCategories(blogCategories.map(c => ((c._id || c.id) === targetId ? { ...c, ...savedData } : c)));
          if (addToast) addToast('Blog category updated successfully', 'success');
          setEditCatModalOpen(false);
        } else {
          setBlogCategories([...blogCategories, savedData]);
          setCategoryId(savedData._id || savedData.id);
          setCategory(savedData.name);
          if (addToast) addToast('Blog category created successfully', 'success');
          setCreateCatModalOpen(false);
        }
        setEditingCat(null);
        setCatName('');
        setCatSlug('');
        setCatDesc('');
        setCatImage('');
      } else {
        const msg = res?.error || res?.message || 'Failed to save category';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving blog category:', err);
      if (addToast) addToast(err.message || 'Error saving category', 'danger');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteBlogCategory = async (catId) => {
    try {
      const res = await deleteBlogCategory(catId);
      if (res && res.success !== false) {
        setBlogCategories(blogCategories.filter(c => (c._id || c.id) !== catId));
        if (addToast) addToast('Blog category deleted', 'warning');
      } else {
        setBlogCategories(blogCategories.filter(c => (c._id || c.id) !== catId));
        if (addToast) addToast('Blog category removed locally', 'warning');
      }
    } catch (err) {
      console.error('Error deleting blog category:', err);
      setBlogCategories(blogCategories.filter(c => (c._id || c.id) !== catId));
    }
  };



  // Rich Text Formatting helper
  const insertFormatting = (tag) => {
    const textarea = document.getElementById('blog-rich-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (tag === 'bold') replacement = `**${selected}**`;
    if (tag === 'italic') replacement = `*${selected}*`;
    if (tag === 'h1') replacement = `# ${selected}`;
    if (tag === 'h2') replacement = `## ${selected}`;
    if (tag === 'list') replacement = `\n- ${selected}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    textarea.focus();
  };

  const openBlogDrawer = (blog = null) => {
    setActiveBlog(blog);
    if (blog) {
      setTitle(blog.title || '');
      setSlug(blog.slug || '');
      setAuthor(blog.author || 'Admin');
      setCategoryId(blog.categoryId || '');
      setCategory(blog.category || 'Healthy Recipes');
      setSummary(blog.summary || '');
      setExcerpt(blog.excerpt || '');
      setFeaturedImage(blog.coverImage || blog.featuredImage || '');
      setContent(blog.content || '');
      setTagsText(Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tagsText || ''));
      setReadingTime(blog.readingTime ? String(blog.readingTime) : '5');
      setStatus(blog.status || (blog.isPublished ? 'Published' : 'Draft'));
      setSeoTitle(blog.seoTitle || '');
      setSeoDesc(blog.seoDescription || '');
      setMetaKeywords(blog.metaKeywords || '');
    } else {
      setTitle('');
      setSlug('');
      setAuthor('Admin');
      setCategoryId(blogCategories[0]?._id || blogCategories[0]?.id || '');
      setCategory(blogCategories[0]?.name || 'Healthy Recipes');
      setSummary('');
      setExcerpt('');
      setFeaturedImage('');
      setContent('');
      setTagsText('Healthy, Breakfast, Nutrition, Food, Lifestyle');
      setReadingTime('5');
      setStatus('Published');
      setSeoTitle('');
      setSeoDesc('');
      setMetaKeywords('');
    }
    setDrawerOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (addToast) addToast('Blog title is required', 'danger');
      return;
    }

    setIsSubmitting(true);

    const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const parsedTags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const isPub = status === 'Published';

    const apiPayload = {
      title: title.trim(),
      categoryId: categoryId || activeBlog?.categoryId || "",
      author: author.trim() || 'Admin',
      content: content.trim(),
      summary: summary.trim() || excerpt.trim() || title.trim(),
      excerpt: excerpt.trim() || summary.trim() || title.trim(),
      coverImage: featuredImage.trim(),
      tags: parsedTags,
      metaTitle: seoTitle.trim() || title.trim(),
      metaDescription: seoDesc.trim(),
      metaKeywords: metaKeywords.trim(),
      readingTime: Number(readingTime) || 5,
      isPublished: isPub
    };

    const isEdit = Boolean(activeBlog && (activeBlog._id || activeBlog.id));
    const targetId = activeBlog ? (activeBlog._id || activeBlog.id) : null;

    try {
      let res;
      if (isEdit) {
        res = await updateBlog(targetId, apiPayload);
      } else {
        res = await createBlog(apiPayload);
      }

      if (res && res.success !== false) {
        const savedData = res.data?.blog || res.data || res;
        const normalizedSaved = normalizeBlog({
          ...savedData,
          category,
          status
        });

        if (isEdit) {
          updateBlogs(blogs.map(b => (b.id === targetId || b._id === targetId) ? normalizedSaved : b));
          if (addToast) addToast('Blog article updated successfully', 'success');
        } else {
          updateBlogs([normalizedSaved, ...blogs]);
          if (addToast) addToast(res.message || 'Blog created successfully', 'success');
        }

        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Admin',
              action: isEdit ? 'Blog Article Edited' : 'Blog Article Created',
              module: 'Blogs',
              detail: `${isEdit ? 'Updated' : 'Created'} article: ${apiPayload.title}`
            },
            ...auditLogs
          ]);
        }

        setDrawerOpen(false);
      } else {
        const msg = res?.error || res?.message || 'Failed to save blog post';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving blog:', err);
      if (addToast) addToast(err.message || 'An unexpected error occurred', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (b) => {
    const targetId = typeof b === 'object' ? (b._id || b.id) : b;
    const blogObj = typeof b === 'object' ? b : blogs.find(item => item.id === targetId || item._id === targetId);

    try {
      const res = await deleteBlog(targetId);
      if (res && res.success !== false) {
        updateBlogs(blogs.filter(item => item.id !== targetId && item._id !== targetId));
        if (addToast) addToast('Blog post deleted successfully', 'warning');

        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Admin',
              action: 'Blog Deleted',
              module: 'Blogs',
              detail: `Removed blog post: ${blogObj?.title || targetId}`
            },
            ...auditLogs
          ]);
        }
      } else {
        updateBlogs(blogs.filter(item => item.id !== targetId && item._id !== targetId));
        if (addToast) addToast('Blog post removed locally', 'warning');
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
      updateBlogs(blogs.filter(item => item.id !== targetId && item._id !== targetId));
      if (addToast) addToast('Blog post removed locally', 'warning');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Article Details',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.coverImage || row.featuredImage || '/logo.png'}
            alt={row.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.png';
              e.target.style.opacity = '0.35';
              e.target.style.objectFit = 'contain';
            }}
            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'normal', maxWidth: '320px' }}>{row.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>By: {row.author} | Category: {row.category}</span>
          </div>
        </div>
      )
    },
    { key: 'slug', label: 'URL Slug' },
    {
      key: 'publishedDate',
      label: 'Published',
      render: (row) => <span>{row.publishedDate || 'N/A'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status === 'Published' ? 'success' : 'secondary'}>{row.status}</Badge>
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => openBlogDrawer(row)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} style={{ padding: '6px', color: 'var(--danger)' }}><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Blog Articles Publisher</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Compose customer tips, nutrition logs, farm highlights, and promotional blog sheets.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={FolderPlus} onClick={() => setCategoryModalOpen(true)}>
            Blog Categories ({blogCategories.length})
          </Button>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={() => openBlogDrawer(null)}>
            Compose Article
          </Button>
        </div>
      </div>

      {/* Main catalog */}
      <Card title="Composed Blog Catalog">
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            viewMode === 'grid' ? <ShimmerCardGrid count={6} height="240px" /> : <TableShimmer rows={6} cols={5} />
          ) : viewMode === 'list' ? (
            <ListView
              columns={columns}
              data={blogs}
              initialRowsPerPage={5}
            />
          ) : (
            <GridView
              data={blogs}
              idKey="id"
              imageKey="featuredImage"
              titleKey="title"
              subtitleKey="summary"
              statusKey="status"
              createdKey="publishedDate"
              onEdit={openBlogDrawer}
              onDelete={item => handleDelete(item)}
              initialRowsPerPage={8}
            />
          )}
        </div>
      </Card>

      {/* Blog Categories Management List Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Blog Categories Directory"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateCatModal}>
              Create New Category
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCategoryModalOpen(false)}>Close</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Active Categories ({blogCategories.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {blogCategories.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '16px', textAlign: 'center' }}>No blog categories available.</div>
            ) : (
              blogCategories.map(cat => (
                <div key={cat._id || cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Tag size={18} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/{cat.slug}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Button variant="outline" size="sm" onClick={() => openEditCatModal(cat)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDeleteBlogCategory(cat._id || cat.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Dedicated Create Blog Category Modal */}
      <Modal
        isOpen={createCatModalOpen}
        onClose={() => setCreateCatModalOpen(false)}
        title="Create New Blog Category"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setCreateCatModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleSaveBlogCategory} disabled={isCreatingCategory}>
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBlogCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Healthy Recipes" required />
          <Input label="Category Slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="e.g. healthy-recipes" />
          <Textarea label="Description" rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Discover healthy recipes, nutritious meal ideas, and wellness tips..." />
          <Input label="Cover Image URL" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
        </form>
      </Modal>

      {/* Dedicated Edit Blog Category Modal */}
      <Modal
        isOpen={editCatModalOpen}
        onClose={() => setEditCatModalOpen(false)}
        title={`Edit Category — ${editingCat?.name || ''}`}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setEditCatModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveBlogCategory} disabled={isCreatingCategory}>
              {isCreatingCategory ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBlogCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Healthy Recipes" required />
          <Input label="Category Slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="e.g. healthy-recipes" />
          <Textarea label="Description" rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Discover healthy recipes, nutritious meal ideas..." />
          <Input label="Cover Image URL" value={catImage} onChange={(e) => setCatImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
        </form>
      </Modal>

      {/* Composition editor drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeBlog ? 'Modify Article Draft' : 'Compose Blog Article'}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveBlog} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (status === 'Published' ? 'Publish Article' : 'Save Draft')}
            </Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSaveBlog}>
          {/* Cover Image Upload at the Top */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Cover Image</span>
            {featuredImage ? (
              <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={featuredImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <label style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  Change Image
                  <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFeaturedImage(reader.result); reader.readAsDataURL(file); } }} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <div style={{ width: '100%', height: '140px', borderRadius: '8px', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: 'var(--bg-app)' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No cover image selected</span>
                <label style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  Upload Image
                  <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFeaturedImage(reader.result); reader.readAsDataURL(file); } }} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>

          <Input label="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 10 Healthy Breakfast Ideas to Start Your Day" required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Select
              label="Blog Category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                const match = blogCategories.find(c => (c._id || c.id) === e.target.value);
                if (match) setCategory(match.name);
              }}
              options={
                blogCategories.length > 0
                  ? blogCategories.map(c => ({ value: String(c._id || c.id), label: c.name }))
                  : [{ value: '', label: 'Please create a category first' }]
              }
            />
          </div>



          <Textarea label="Article Summary" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A quick guide to healthy breakfast ideas..." />
          <Textarea label="Article Excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Discover 10 healthy breakfast ideas packed with nutrition..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Tags (Comma separated)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Healthy, Breakfast, Nutrition" />
            <Input label="Est. Reading Time (Mins)" type="number" value={readingTime} onChange={(e) => setReadingTime(e.target.value)} placeholder="5" />
          </div>

          {/* Simulated Rich Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Article Content body</span>

            {/* Editor Toolbar formatting panel */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderBottom: 'none', padding: '6px 12px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('bold')} style={{ padding: '4px' }} title="Bold text"><Bold size={14} /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('italic')} style={{ padding: '4px' }} title="Italic text"><Italic size={14} /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('h1')} style={{ padding: '4px' }} title="Header 1"><Heading1 size={14} /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('h2')} style={{ padding: '4px' }} title="Header 2"><Heading2 size={14} /></Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting('list')} style={{ padding: '4px' }} title="Bullet list"><List size={14} /></Button>
            </div>

            <textarea
              id="blog-rich-content"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your rich article body..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <Select label="Publish State" value={status} onChange={(e) => setStatus(e.target.value)} options={['Published', 'Draft']} />
            <Input label="SEO Page Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="10 Healthy Breakfast Ideas | Healthy Living Blog" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Textarea label="SEO Page Description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Explore 10 delicious and healthy breakfast ideas..." />
            <Textarea label="SEO Keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="healthy breakfast, breakfast ideas, nutrition..." />
          </div>
        </form>
      </Drawer>

    </div>
  );
};

export default Blogs;


