import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
      <div className={cn('relative inline-flex items-center', className)}>
        <input
          ref={inputRef}
          type="text"
          data-tour-id="project-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          aria-label="Nama proyek"
          className="text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-accent-primary/60 rounded px-1.5 py-0.5 outline-none ring-2 ring-accent-primary/20 shadow-xs transition-all w-48 sm:w-64"
        />
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
        'group inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer select-none',
        'hover:bg-slate-100/70 border border-transparent hover:border-slate-200/60 transition-colors',
        className
      )}
      title="Klik untuk mengubah nama proyek"
    >
      <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate max-w-35 sm:max-w-xs">
        {activeTitle}
      </span>
      <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
};

export default EditableProjectTitle;
