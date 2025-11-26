import React, { useEffect, useRef, useState } from 'react';
import './Analyzer.css';

export default function GeminiAnalyzer({ onBack }) {
  const [prompt, setPrompt] = useState('');
  const [imageEntries, setImageEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const suggestions = [
    { icon: '👍', text: 'Rate my outfit' },
    { icon: '💍', text: 'For wedding' },
    { icon: '🥾', text: 'For trek' },
    { icon: '👕', text: 'Casual/Comfort' },
    { icon: '💘', text: 'Dating' },
  ];
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureTimeoutRef = useRef(null);
  const captureIndexRef = useRef(0);
  const imageEntriesRef = useRef([]);

  useEffect(() => {
    imageEntriesRef.current = imageEntries;
  }, [imageEntries]);

  useEffect(() => {
    // load persisted images from localStorage on mount
    const saved = window.localStorage.getItem('gemini_image_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // restore entries using data URLs as previews
          const restored = parsed.map((e) => ({ id: e.id, file: null, url: e.dataUrl, source: e.source }));
          setImageEntries(restored);
          setCaptureProgress(Math.min(restored.filter((r) => r.source === 'camera').length, 4));
        }
      } catch (e) {
        console.warn('Failed to parse saved images', e);
      }
    }

    return () => {
      // revoke only blob/object URLs (not data URLs)
      imageEntriesRef.current.forEach((entry) => {
        try {
          if (entry?.url && entry.url.startsWith('blob:')) URL.revokeObjectURL(entry.url);
        } catch (e) {
          /* ignore */
        }
      });
      stopCamera({ silent: true });
      clearCaptureTimeout();
    };
  }, []);

  function clearCaptureTimeout() {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  }

  function teardownCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function stopCamera({ silent = false } = {}) {
    if (!silent) {
      console.log('[Camera] stopCamera invoked, tearing down stream');
    }
    clearCaptureTimeout();
    captureIndexRef.current = 0;
    if (!silent) {
      setCapturing(false);
      setCameraVisible(false);
      setCaptureProgress(0);
    }
    teardownCameraStream();
  }

  function cancelCapture() {
    clearCaptureTimeout();
    captureIndexRef.current = 0;
    setCapturing(false);
    console.log('[Capture] cancelCapture triggered');
  }

  function addImageFile(file, source = 'upload') {
    if (!file) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const url = URL.createObjectURL(file);
    console.log('[Images] Adding image entry', { id, source, size: file.size });
    setImageEntries((prev) => [...prev, { id, file, url, source }]);
    if (source === 'camera') {
      setCaptureProgress((prev) => Math.min(prev + 1, 4));
    }

    // persist this image as a data URL in localStorage (read file async)
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const dataUrl = reader.result;
          const savedRaw = window.localStorage.getItem('gemini_image_entries');
          let saved = [];
          if (savedRaw) {
            try { saved = JSON.parse(savedRaw); } catch (e) { saved = []; }
          }
          saved.push({ id, dataUrl, source });
          window.localStorage.setItem('gemini_image_entries', JSON.stringify(saved));
          console.log('[Images] Persisted image to localStorage', { id, source });
        } catch (e) {
          console.warn('Failed to persist image', e);
        }
      };
      reader.onerror = (err) => {
        console.warn('Failed to read file for persistence', err);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.warn('No persistence for image', e);
    }
  }

  function removeImage(id) {
    let removedEntry = null;
    setImageEntries((prev) => {
      const next = [];
      prev.forEach((entry) => {
        if (entry.id === id) {
          removedEntry = entry;
          try {
            if (entry?.url && entry.url.startsWith('blob:')) URL.revokeObjectURL(entry.url);
          } catch (e) {
            /* ignore */
          }
        } else {
          next.push(entry);
        }
      });
      return next;
    });
    if (removedEntry) {
      console.log('[Images] Removed image entry', { id, source: removedEntry.source });
    }
    if (removedEntry?.source === 'camera') {
      setCaptureProgress((prev) => Math.max(0, Math.min(prev - 1, 4)));
    }

    // remove persisted entry if present
    try {
      const savedRaw = window.localStorage.getItem('gemini_image_entries');
      if (savedRaw) {
        let saved = [];
        try { saved = JSON.parse(savedRaw); } catch (e) { saved = []; }
        const next = saved.filter((s) => s.id !== id);
        window.localStorage.setItem('gemini_image_entries', JSON.stringify(next));
      }
    } catch (e) {
      console.warn('Failed to update localStorage on remove', e);
    }
  }

  function clearCameraImages() {
    console.log('[Images] Clearing camera-derived images');
    setImageEntries((prev) => {
      const retained = [];
      prev.forEach((entry) => {
        if (entry.source === 'camera') {
          try {
            if (entry?.url && entry.url.startsWith('blob:')) URL.revokeObjectURL(entry.url);
          } catch (e) { }
        } else {
          retained.push(entry);
        }
      });
      return retained;
    });
    setCaptureProgress(0);

    // remove camera-sourced persisted entries
    try {
      const savedRaw = window.localStorage.getItem('gemini_image_entries');
      if (savedRaw) {
        let saved = [];
        try { saved = JSON.parse(savedRaw); } catch (e) { saved = []; }
        const next = saved.filter((s) => s.source !== 'camera');
        window.localStorage.setItem('gemini_image_entries', JSON.stringify(next));
      }
    } catch (e) {
      console.warn('Failed to update localStorage on clearCameraImages', e);
    }
  }

  function clearAllImages() {
    console.log('[Images] Clearing all image entries');
    setImageEntries((prev) => {
      prev.forEach((entry) => {
        try {
          if (entry?.url && entry.url.startsWith('blob:')) URL.revokeObjectURL(entry.url);
        } catch (e) { }
      });
      return [];
    });
    setCaptureProgress(0);

    try {
      window.localStorage.removeItem('gemini_image_entries');
    } catch (e) {
      console.warn('Failed to clear localStorage for images', e);
    }
  }

  function onFileChange(e) {
    const files = Array.from(e.target.files ?? []);
    console.log('[Images] File input change detected', { fileCount: files.length });
    files.forEach((file) => addImageFile(file, 'upload'));
    if (e.target.value) {
      e.target.value = '';
    }
  }

  async function ensureVideoReady() {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2) {
      console.log('[Camera] Video already ready (readyState >= 2)');
      return;
    }
    console.log('[Camera] Waiting for video readyState >= 2. Current readyState:', video.readyState);
    await new Promise((resolve) => {
      const onLoadedData = () => {
        video.removeEventListener('loadeddata', onLoadedData);
        console.log('[Camera] loadeddata event fired');
        resolve();
      };
      video.addEventListener('loadeddata', onLoadedData);
    });
  }

  async function attachStreamToVideo(stream) {
    const video = videoRef.current;
    // wait until the video element is available in case this was called
    // before the update that renders the <video> (openCamera sets cameraVisible then calls here)
    if (!video) {
      await new Promise((resolve) => {
        const waitForVideo = () => {
          if (videoRef.current) return resolve();
          requestAnimationFrame(waitForVideo);
        };
        requestAnimationFrame(waitForVideo);
      });
    }
    const resolvedVideo = videoRef.current;
    if (!resolvedVideo) return;
    console.log('[Camera] Attaching stream to video element');
    resolvedVideo.srcObject = stream;
    resolvedVideo.muted = true;
    resolvedVideo.playsInline = true;
    resolvedVideo.setAttribute('playsinline', 'true');

    await new Promise((resolve) => {
      const onMetadata = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        console.log('[Camera] loadedmetadata event fired');
        resolve();
      };
      if (video.readyState >= 1) {
        console.log('[Camera] Video metadata already available (readyState >= 1)');
        resolve();
      } else {
        video.addEventListener('loadedmetadata', onMetadata);
      }
    });

    try {
      const playPromise = resolvedVideo.play();
      if (playPromise instanceof Promise) {
        console.log('[Camera] Awaiting video.play()');
        await playPromise;
      }
    } catch (playErr) {
      console.warn('Video play rejected:', playErr);
    }
    await ensureVideoReady();
  }

  async function openCamera() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }
    if (capturing) {
      cancelCapture();
    }
    try {
      console.log('[Camera] Requesting user media');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      console.log('[Camera] Media stream obtained', {
        tracks: stream.getTracks().map((track) => ({ kind: track.kind, readyState: track.readyState })),
      });
      streamRef.current = stream;
      // ensure the video element mounts before we attach the stream
      setCameraVisible(true);
      // wait for the video element to be present (attachStreamToVideo also waits, but doing a short tick here
      // ensures we don't bail early in some timing scenarios)
      await new Promise((res) => requestAnimationFrame(res));
      await attachStreamToVideo(stream);
      setCameraError(null);
      console.log('[Camera] Camera successfully opened and preview should be visible');
    } catch (err) {
      console.error('Unable to access camera:', err);
      setCameraError('Unable to access camera. Please check permissions and try again.');
      teardownCameraStream();
      setCameraVisible(false);
      setCapturing(false);
    }
  }

  function handleCloseCamera() {
    cancelCapture();
    stopCamera();
    setCameraError(null);
  }

  async function captureSnapshot() {
    const video = videoRef.current;
    if (!video) return null;
    console.log('[Capture] Attempting snapshot, video readyState:', video.readyState);
    await ensureVideoReady();
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    console.log('[Capture] Snapshot dimensions', { width, height });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('[Capture] canvas.toBlob returned null');
            reject(new Error('Failed to capture photo'));
            return;
          }
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          console.log('[Capture] Snapshot blob created', { size: file.size });
          resolve(file);
        },
        'image/jpeg',
        0.92,
      );
    });
  }

  async function startAutoCapture() {
    if (capturing) return;
    if (!cameraVisible || !streamRef.current) {
      console.log('[Capture] No active camera stream, opening camera before auto capture');
      await openCamera();
      if (!streamRef.current) return;
    }
    clearCameraImages();
    clearCaptureTimeout();
    captureIndexRef.current = 0;
    setCapturing(true);
    setCameraError(null);
    console.log('[Capture] Auto capture sequence started');

    const runCapture = async () => {
      try {
        console.log('[Capture] Capturing photo index', captureIndexRef.current + 1);
        const file = await captureSnapshot();
        if (file) {
          addImageFile(file, 'camera');
        }
        captureIndexRef.current += 1;
        const completed = captureIndexRef.current;
        setCaptureProgress(Math.min(completed, 4));
        if (completed >= 4) {
          console.log('[Capture] Completed four photos, stopping capture loop');
          setCapturing(false);
          captureTimeoutRef.current = null;
          return;
        }
        console.log('[Capture] Scheduling next capture in 3 seconds');
        captureTimeoutRef.current = setTimeout(runCapture, 3000);
      } catch (err) {
        console.error('Capture failed:', err);
        setCameraError('Unable to capture photo. Please try again.');
        cancelCapture();
      }
    };

    await runCapture();
  }

  // Helper: append suggestion text to prompt (avoid duplicate)
  function appendSuggestionToPrompt(cur, suggestionText) {
    if (!cur || cur.trim() === '') return suggestionText;
    // if already included, don't duplicate
    const parts = cur.split('\n').join(' ').split(' ').filter(Boolean);
    if (parts.join(' ').toLowerCase().includes(suggestionText.toLowerCase())) return cur;
    return `${cur.trim()} ${suggestionText}`;
  }

  // Helper: remove suggestion text from prompt if present
  function removeSuggestionFromPrompt(cur, suggestionText) {
    if (!cur) return '';
    const regex = new RegExp(`\\b${escapeRegExp(suggestionText)}\\b`, 'i');
    if (!regex.test(cur)) return cur;
    // remove exact phrase and clean up spaces
    const cleaned = cur.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function extractGeminiText(data) {
    try {
      if (data?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.data.candidates[0].content.parts[0].text;
      }
      if (data?.data?.text) {
        return data.data.text;
      }
      if (typeof data?.data === 'string') {
        return data.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Simple, safe formatter: convert limited markdown-like syntax to HTML
  function escapeHtml(unsafe) {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatResponseMarkdown(md) {
    if (!md) return '';
    // Escape first to avoid XSS
    let out = escapeHtml(md);

    // Headings: ### -> h3, ## -> h2, # -> h1 (at line starts)
    out = out.replace(/^###\s*(.+)$/gim, '<h3>$1</h3>');
    out = out.replace(/^##\s*(.+)$/gim, '<h2>$1</h2>');
    out = out.replace(/^#\s*(.+)$/gim, '<h1>$1</h1>');

    // Bold: **text**
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered list items: lines starting with * or -
    // Convert consecutive list lines into a single <ul>
    out = out.replace(/(^((?:[ \t]*[-\*]\s+.+\r?\n?)+))/gm, (match) => {
      const items = match
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^[-\*]\s+/, ''))
        .map((li) => `<li>${li}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    });

    // Paragraphs: split on double newlines
    const parts = out.split(/\n\s*\n/);
    out = parts
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        // if it already starts with a block tag, leave it
        if (/^<(h[1-6]|ul|ol|li|pre|blockquote)/i.test(p)) return p;
        return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    return out;
  }

  async function submitPrompt(text) {
    const currentImages = imageEntriesRef.current;
    const sanitizedPrompt = (text ?? '').trim();
    if (!sanitizedPrompt && currentImages.length === 0) {
      setError('Please enter a prompt or capture/upload images before submitting.');
      return;
    }
    console.log('[Submit] Preparing submission', { imageCount: currentImages.length, hasPrompt: Boolean(sanitizedPrompt) });
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const form = new FormData();
      form.append('prompt', text ?? '');
      if (currentImages.length) {
        for (let idx = 0; idx < currentImages.length; idx += 1) {
          const entry = currentImages[idx];
          const fieldName = idx === 0 ? 'image' : `image${idx}`;
          if (entry.file) {
            form.append(fieldName, entry.file);
            console.log('[Submit] Appending image to form', { fieldName, size: entry.file.size });
          } else if (entry.url && entry.url.startsWith('data:')) {
            // convert data URL back to blob/file
            try {
              // fetch can handle data URLs in modern browsers
              const resBlob = await (await fetch(entry.url)).blob();
              const fileObj = new File([resBlob], `persisted_${entry.id}.jpg`, { type: resBlob.type || 'image/jpeg' });
              form.append(fieldName, fileObj);
              console.log('[Submit] Appending persisted image to form', { fieldName, size: fileObj.size });
            } catch (e) {
              console.warn('Failed to append persisted dataUrl image', e, entry);
            }
          } else {
            console.warn('[Submit] Skipping image without file or data URL', entry);
          }
        }
      }

      console.log('Sending request to /api/analyze');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: form,
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers.get('content-type'));

      // Read body only once
      const bodyText = await res.text();
      console.log('Response body:', bodyText);

      let data;
      try {
        data = JSON.parse(bodyText);
        console.log('Parsed response:', data);
      } catch (parseErr) {
        console.error('Failed to parse JSON:', parseErr);
        console.error('Raw response:', bodyText.substring(0, 200));
        setError('Server returned invalid JSON: ' + bodyText.substring(0, 100));
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorMsg = data.error || data.data?.error?.message || JSON.stringify(data);
        console.error('Error response:', errorMsg);
        setError(errorMsg);
      } else {
        console.log('Success response received');
        setResponse(data);
      }
    } catch (err) {
      console.error('Exception in submitPrompt:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    await submitPrompt(prompt);
  }


  const textResponse = response ? extractGeminiText(response) : null;
  const formattedResponse = textResponse ? formatResponseMarkdown(textResponse) : null;
  const showSuggestions = !response && !error && !loading;

  return (
    <div className="gemini-analyzer">
      {/* --- ADDED BACK BUTTON --- */}
      {onBack && (
        <button className="analyzer-back-button" onClick={onBack}>
         ⬅ Back
        </button>
      )}

      {/* Top Section */}
      <div className="analyzer-top">
        <h1 className="analyzer-title">Outfit AI</h1>
        <p className="analyzer-subtitle">Get instant feedback on your style</p>
      </div>

      {/* Main Content */}
      <div className="analyzer-main">
        {/* Input Area */}
        <div className="analyzer-input-section">
          <div className="capture-controls">
            <button
              type="button"
              className={`camera-toggle-btn ${cameraVisible ? 'active' : ''}`}
              onClick={cameraVisible ? handleCloseCamera : openCamera}
              disabled={loading}
            >
              {cameraVisible ? 'Close Camera' : 'Open Camera'}
            </button>
            <span className="capture-hint">
              Collect 4 photos automatically, 3 seconds apart
              {imageEntries.length > 0 && (
                <>
                  {' • '}
                  {imageEntries.length} photo{imageEntries.length === 1 ? '' : 's'} ready
                </>
              )}
            </span>
          </div>

          {cameraError && <div className="camera-error-banner">{cameraError}</div>}

          {cameraVisible && (
            <div className="camera-preview">
              <video ref={videoRef} className="camera-feed" autoPlay playsInline muted />
              <div className="camera-actions">
                <button
                  type="button"
                  className="camera-action-btn primary"
                  onClick={capturing ? cancelCapture : startAutoCapture}
                  disabled={loading}
                >
                  {capturing ? 'Stop Capture' : 'Start Auto Capture'}
                </button>
                <button
                  type="button"
                  className="camera-action-btn"
                  onClick={handleCloseCamera}
                  disabled={capturing}
                >
                  Close Camera
                </button>
                <div className="capture-status">
                  {capturing
                    ? `Capturing photos... (${Math.min(captureProgress, 4)}/4)`
                    : `Captured ${Math.min(captureProgress, 4)}/4 photos`}
                </div>
              </div>
            </div>
          )}

          {imageEntries.length > 0 && (
            <div className="input-previews-grid">
              {imageEntries.map((entry, idx) => (
                <div className="input-image-preview" key={entry.id}>
                  <img src={entry.url} alt={`Selected ${idx + 1}`} />
                  <div className="preview-meta">
                    <span className="preview-badge">{entry.source === 'camera' ? 'Camera' : 'Upload'}</span>
                    <span className="preview-index">#{idx + 1}</span>
                  </div>
                  <button
                    className="remove-image-btn"
                    onClick={() => removeImage(entry.id)}
                    type="button"
                    aria-label="Remove image"
                  >
                    🗙
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="input-form">
            <div className="input-wrapper">
              {/* file upload icon moved to left */}
              <label className="file-input-label" htmlFor="file-input" title="Upload image">
                {/* camera/upload icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 7h2l2-3h6l2 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
                  <circle cx="10" cy="12" r="3" />
                </svg>
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="file-input-hidden"
              />

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something or choose below..."
                className="text-input"
                disabled={loading}
              />

              <button type="submit" disabled={loading || capturing} className="send-btn" aria-label="Send">
                {loading ? (
                  <svg className="spinner" viewBox="0 0 50 50" width="18" height="18" aria-hidden>
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" stroke="rgba(255,255,255,0.6)" strokeDasharray="90" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="send-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                    <path d="M2 21l20-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="suggestions-section">
            <div className="suggestions-grid">
              {suggestions.map((suggestion, idx) => {
                const isSelected = selectedSuggestions.includes(suggestion.text);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      // toggle selection
                      setSelectedSuggestions((prev) => {
                        if (prev.includes(suggestion.text)) {
                          // deselect: remove from selections and remove from prompt text if present
                          const next = prev.filter((p) => p !== suggestion.text);
                          setPrompt((cur) => removeSuggestionFromPrompt(cur, suggestion.text));
                          return next;
                        } else {
                          // select: add and append to prompt
                          const next = [...prev, suggestion.text];
                          setPrompt((cur) => appendSuggestionToPrompt(cur, suggestion.text));
                          return next;
                        }
                      });
                    }}
                    className={`suggestion-btn ${isSelected ? 'selected' : ''}`}
                    disabled={loading}
                    type="button"
                  >
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    <span className="suggestion-text">{suggestion.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {(response || error) && (
          <div className="results-section">
            {error && (
              <div className="error-box">
                <h3 className="response-heading">Error</h3>
                <p>{error}</p>
              </div>
            )}
            {response && textResponse && (
              <div className="success-box">
                <h3 className="response-heading">Analysis</h3>
                <div className="response-text" dangerouslySetInnerHTML={{ __html: formattedResponse }} />
              </div>
            )}
            {response && !textResponse && (
              <div className="info-box">
                <h3 className="response-heading">Raw Response</h3>
                <pre className="response-json">{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}
            <button
              onClick={() => {
                setResponse(null);
                setError(null);
                setPrompt('');
                clearAllImages();
                cancelCapture();
              }}
              className="new-analysis-btn"
            >
              New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
