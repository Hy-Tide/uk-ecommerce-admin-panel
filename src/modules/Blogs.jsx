import React, { useState } from 'react';
import { Bold, Heading1, Heading2, Italic, Link, List, Plus, Save, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input, { Select, Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card from '../components/Card';
import ViewToggle from '../components/ViewToggle';
import ListView from '../components/ListView';
import GridView from '../components/GridView';

export const Blogs = ({
  blogs = [],
  setBlogs,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeBlog, setActiveBlog] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-blogs') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-blogs', newView);
  };

  // Editor Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Published');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  // Rich Text Editor simulations
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
      setTitle(blog.title);
      setSlug(blog.slug);
      setAuthor(blog.author);
      setCategory(blog.category);
      setFeaturedImage(blog.featuredImage || '');
      setContent(blog.content);
      setStatus(blog.status);
      setSeoTitle(blog.seoTitle || '');
      setSeoDesc(blog.seoDescription || '');
    } else {
      setTitle('');
      setSlug('');
      setAuthor('Mugesh');
      setCategory('Health & Nutrition');
      setFeaturedImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400');
      setContent('');
      setStatus('Draft');
      setSeoTitle('');
      setSeoDesc('');
    }
    setDrawerOpen(true);
  };

  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!title) {
      addToast('Blog title is required', 'danger');
      return;
    }

    const payload = {
      id: activeBlog ? activeBlog.id : `b-${Date.now()}`,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      author,
      category,
      featuredImage,
      content,
      status,
      seoTitle: seoTitle || title,
      seoDescription: seoDesc,
      publishedDate: status === 'Published' ? new Date().toISOString().split('T')[0] : ''
    };

    if (activeBlog) {
      setBlogs(blogs.map(b => b.id === activeBlog.id ? payload : b));
      addToast('Blog post updated', 'success');
    } else {
      setBlogs([payload, ...blogs]);
      addToast('Blog post created', 'success');
    }

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: activeBlog ? 'Blog Article Edited' : 'Blog Article Created',
        module: 'Blogs',
        detail: `${activeBlog ? 'Updated' : 'Created'} article: ${payload.title}`
      },
      ...auditLogs
    ]);

    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    const deleted = blogs.find(b => b.id === id);
    setBlogs(blogs.filter(b => b.id !== id));
    addToast('Blog post removed', 'warning');
    
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: 'Blog Deleted',
        module: 'Blogs',
        detail: `Removed blog post: ${deleted?.title}`
      },
      ...auditLogs
    ]);
  };

  const columns = [
    {
      key: 'title',
      label: 'Article Details',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={row.featuredImage} alt={row.title} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
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
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} style={{ padding: '6px', color: 'var(--danger)' }}><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyinput: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Blog Articles Publisher</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Compose customer tips, nutrition logs, farm highlights, and promotional blog sheets.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={() => openBlogDrawer(null)}>
            Compose Article
          </Button>
        </div>
      </div>

      {/* Main catalog */}
      <Card title="Composed Blog Catalog">
        <div style={{ marginTop: '12px' }}>
          {viewMode === 'list' ? (
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
              subtitleKey="content"
              statusKey="status"
              createdKey="publishedDate"
              onEdit={openBlogDrawer}
              onDelete={item => handleDelete(item.id)}
              initialRowsPerPage={8}
            />
          )}
        </div>
      </Card>

      {/* Composition editor drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeBlog ? 'Modify Article draft' : 'Compose Blog Article'}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveBlog}>Save Draft</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Navigating Summer Organic Berries" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Select label="Category Tag" value={category} onChange={(e) => setCategory(e.target.value)} options={['Health & Nutrition', 'Cooking Guide', 'Farm Updates', 'Promotions']} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="summer-organic-berries" />
            <Input label="Featured Banner URL" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
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
              rows={12}
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
            <Select label="Publish State" value={status} onChange={(e) => setStatus(e.target.value)} options={['Draft', 'Published']} />
            <Input label="SEO Page Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <Textarea label="SEO Page Description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
        </form>
      </Drawer>

    </div>
  );
};
export default Blogs;
