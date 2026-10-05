import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/utils/cn';

export interface EditableProjectTitleProps {
  className?: string;
  initialTitle?: string;
  onTitleChange?: (newTitle: string) => void;
}

export const EditableProjectTitle: React.FC<EditableProjectTitleProps> = ({
  className,
  initialTitle,
  onTitleChange,
}) => {
  const storeTitle = useProjectStore((s) => s.title);
  const storeSetTitle = useProjectStore((s) => s.setTitle);

  const activeTitle = initialTitle ?? storeTitle;
  const updateTitle = onTitleChange ?? storeSetTitle;

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(activeTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftTitle(activeTitle);
  }, [activeTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = draftTitle.trim();
    const finalTitle = trimmed.length > 0 ? trimmed : 'Proyek Tanpa Judul';
    updateTitle(finalTitle);
    setDraftTitle(finalTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftTitle(activeTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn('relative inline-flex items-center gap-1', className)}>
        <input
          ref={inputRef}
          type="text"
          data-tour-id="project-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          aria-label="Nama proyek"
          className="text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-accent-primary rounded-md px-2 py-0.5 outline-none ring-2 ring-accent-primary/20 shadow-xs transition-all w-48 sm:w-64"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="p-1 rounded bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors cursor-pointer"
          title="Simpan nama proyek (Enter)"
          aria-label="Simpan nama proyek"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      data-tour-id="project-title-input"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      className={cn(
        'group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer select-none',
        'bg-slate-50/90 hover:bg-slate-100 border border-slate-200/90 hover:border-accent-primary/50 shadow-2xs transition-all duration-150',
        className
      )}
      title="Klik untuk mengubah nama proyek"
      aria-label="Ubah nama proyek"
    >
      <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-accent-primary transition-colors truncate max-w-35 sm:max-w-xs border-b border-dashed border-slate-300 group-hover:border-accent-primary/60 pb-px">
        {activeTitle}
      </span>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-slate-200/70 group-hover:bg-accent-primary/10 text-slate-400 group-hover:text-accent-primary transition-colors shrink-0">
        <Pencil className="w-2.5 h-2.5" />
      </span>
    </div>
  );
};

export default EditableProjectTitle;
