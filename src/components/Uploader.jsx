import React, { useRef, useState } from 'react';
import { Crop, Upload, X } from 'lucide-react';
import Button from './Button';

export const Uploader = ({
  label = 'Upload images or videos',
  onFilesChanged = () => {},
  initialImages = [],
  maxFiles = 5,
  className = '',
  style = {}
}) => {
  const [files, setFiles] = useState(
    initialImages.map((url, i) => ({ id: `init-${i}`, url, name: `Existing Media ${i + 1}`, status: 'done' }))
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeCropFile, setActiveCropFile] = useState(null); // File object currently being cropped
  const fileInputRef = useRef(null);

  const processFiles = (newFileList) => {
    const updatedFiles = [...files];
    const limit = Math.min(newFileList.length, maxFiles - files.length);

    for (let i = 0; i < limit; i++) {
      const fileObj = newFileList[i];
      const newFile = {
        id: `file-${Date.now()}-${i}`,
        name: fileObj.name,
        status: 'uploading',
        progress: 10,
        url: URL.createObjectURL(fileObj)
      };

      updatedFiles.push(newFile);
      
      // Simulate slow premium upload progress
      let p = 10;
      const interval = setInterval(() => {
        p += 20;
        newFile.progress = p;
        setFiles([...updatedFiles]);
        if (p >= 100) {
          clearInterval(interval);
          newFile.status = 'done';
          setFiles([...updatedFiles]);
          onFilesChanged(updatedFiles.map(f => f.url));
        }
      }, 150);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id) => {
    const filtered = files.filter(f => f.id !== id);
    setFiles(filtered);
    onFilesChanged(filtered.map(f => f.url));
  };

  const simulateCrop = (file) => {
    setActiveCropFile(file);
  };

  const saveCroppedImage = () => {
    // Simulated crop: update status and close
    setActiveCropFile(null);
  };

  const [urlInput, setUrlInput] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }} className={className}>
      {label && <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{label}</span>}

      {/* Direct Image URL Paste Input */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Paste Image URL directly (e.g. https://...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            if (urlInput.trim()) {
              const newFile = {
                id: `url-${Date.now()}`,
                url: urlInput.trim(),
                name: 'Web Image',
                status: 'done'
              };
              const updated = [...files, newFile];
              setFiles(updated);
              onFilesChanged(updated.map(f => f.url));
              setUrlInput('');
            }
          }}
        >
          Add URL
        </Button>
      </div>
      
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--primary)' : 'var(--border-color)'}`,
          backgroundColor: isDragOver ? 'var(--primary-light)' : 'var(--bg-app)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
          <Upload size={20} />
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Drag & drop files here, or <span style={{ color: 'var(--primary)' }}>browse</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Supports JPEG, PNG, MP4 up to 10MB (Max {maxFiles} files)
        </div>
      </div>

      {/* Uploaded File List Items */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginTop: '8px' }}>
          {files.map(file => (
            <div
              key={file.id}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '1',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {file.status === 'uploading' ? (
                <div style={{ padding: '4px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Uploading...</span>
                  <div style={{ width: '80%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${file.progress}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              ) : (
                <>
                  <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {/* Floating Action Buttons */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }} className="file-overlay">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); simulateCrop(file); }}
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: 'white', color: 'black', cursor: 'pointer' }}
                      title="Crop Image"
                    >
                      <Crop size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--danger)', color: 'white', cursor: 'pointer' }}
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simulated Image Cropper Overlay */}
      {activeCropFile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>Crop Image Tool</span>
              <button onClick={() => setActiveCropFile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={16} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '200px', height: '200px', border: '2px solid var(--primary)', overflow: 'hidden' }}>
                <img src={activeCropFile.url} alt="To Crop" style={{ width: '150%', height: '150%', position: 'absolute', top: '-25%', left: '-25%', objectFit: 'cover', opacity: 0.8 }} />
                {/* Crop lines grid */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px dashed rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '33.3%', bottom: '33.3%', left: 0, right: 0, borderTop: '1px dashed rgba(255,255,255,0.5)', borderBottom: '1px dashed rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: '33.3%', right: '33.3%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.5)', borderRight: '1px dashed rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Drag corners to trim bounds. Simulated crop size: 400 x 400px (1:1 aspect)</span>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: 'var(--bg-app)' }}>
              <Button variant="outline" size="sm" onClick={() => setActiveCropFile(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveCroppedImage}>Apply Crop</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        div[style*="aspect-ratio"]:hover .file-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
export default Uploader;
