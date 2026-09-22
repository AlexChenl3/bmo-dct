import { useRef, useState } from "react";

/**
 * Lets the user pick a weights CSV file to upload.
 *
 * Props:
 *  - onUpload(file): called with a File when the user selects/drops a file
 *  - busy: boolean, disables controls while a request is in flight
 */
export default function UploadPanel({ onUpload, busy }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    onUpload(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <section className="panel">
      <p className="muted">
        Upload an ETF CSV File (ex: <code>ETF1.csv</code> or <code>ETF2.csv</code>).
      </p>

      <div
        className={`dropzone${dragging ? " dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current && inputRef.current.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden-input"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <strong>Drop a CSV file here</strong>
      </div>

    </section>
  );
}