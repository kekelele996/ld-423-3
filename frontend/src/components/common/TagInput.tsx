import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, onAdd, onRemove, placeholder = '输入标签后按回车添加' }: TagInputProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        setInput('');
      }
    }
  };

  return (
    <div className="tag-input">
      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} aria-label={`删除标签 ${tag}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
