import { uploadData } from 'aws-amplify/storage';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState, useRef } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
  file: File | null;
  progress: number;
  status: UploadStatus;
  error: string | null;
}

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FileUpload() {
  const [state, setState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
    error: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setState(s => ({ ...s, file: null, error: 'Only PDF files are allowed.' }));
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setState(s => ({ ...s, file: null, error: `File exceeds the ${MAX_SIZE_MB} MB limit.` }));
      return;
    }

    setState({ file, progress: 0, status: 'idle', error: null });
  }

  async function handleUpload() {
    if (!state.file) return;

    const fileBaseName = state.file.name.replace(/\.pdf$/i, '');

    setState(s => ({ ...s, status: 'uploading', progress: 0, error: null }));

    try {
      const userAttributes = await fetchUserAttributes();
      const { email, name } = userAttributes;
      const cedula = userAttributes['custom:Cédula'];

      if (!cedula) {
        throw new Error('No se encontro la cedula del usuario en Cognito.');
      }

      await uploadData({
        path: `documentos-retanqueo/${cedula}/${Date.now()}-${fileBaseName}.pdf`,
        data: state.file!,
        options: {
          contentType: 'application/pdf',
          onProgress({ transferredBytes, totalBytes }) {
            if (totalBytes) {
              const pct = Math.round((transferredBytes / totalBytes) * 100);
              setState(s => ({ ...s, progress: pct }));
            }
          },
          metadata: {
            ...(email && { uploaderEmail: email }),
            ...(name && { uploaderName: name }),
          },
        },
      }).result;

      setState({ file: null, progress: 100, status: 'success', error: null });
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setState(s => ({ ...s, status: 'error', error: message }));
    }
  }

  function handleReset() {
    setState({ file: null, progress: 0, status: 'idle', error: null });
    if (inputRef.current) inputRef.current.value = '';
  }

  const isUploading = state.status === 'uploading';

  return (
    <div className="upload-card">
      <h2 className="upload-title">Upload PDF Document</h2>
      <p className="upload-hint">Accepted format: PDF &nbsp;|&nbsp; Max size: {MAX_SIZE_MB} MB</p>

      <label className="file-label">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="file-input"
        />
        <span className="file-btn">Choose file</span>
        <span className="file-name">
          {state.file ? state.file.name : 'No file chosen'}
        </span>
      </label>

      {state.file && (
        <p className="file-meta">
          {(state.file.size / 1024).toFixed(1)} KB
        </p>
      )}

      {isUploading && (
        <div className="progress-bar" role="progressbar" aria-valuenow={state.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${state.progress}%` }} />
          <span className="progress-label">{state.progress}%</span>
        </div>
      )}

      {state.status === 'success' && (
        <p className="feedback success">File uploaded successfully!</p>
      )}

      {state.error && (
        <p className="feedback error" role="alert">{state.error}</p>
      )}

      <div className="upload-actions">
        <button
          onClick={handleUpload}
          disabled={!state.file || isUploading}
          className="primary-btn"
        >
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>

        {(state.status === 'success' || state.status === 'error') && (
          <button onClick={handleReset} className="secondary-btn">
            Upload another
          </button>
        )}
      </div>
    </div>
  );
}
