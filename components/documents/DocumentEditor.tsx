'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function DocumentEditor({
  content,
  onChange,
  onSave,
  isSaving,
  readOnly = false
}: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      setHasChanges(true);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      setHasChanges(false);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', label: 'Bold' },
    { icon: Italic, command: 'italic', label: 'Italic' },
    { icon: Underline, command: 'underline', label: 'Underline' },
    { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
    { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
    { icon: Undo, command: 'undo', label: 'Undo' },
    { icon: Redo, command: 'redo', label: 'Redo' }
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Formatting Buttons */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/10">
              {toolbarButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => execCommand(button.command)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={button.label}
                  type="button"
                >
                  <button.icon className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>

            {/* Font Size */}
            <select
              onChange={(e) => execCommand('fontSize', e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="3"
            >
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>

            {/* Heading Styles */}
            <select
              onChange={(e) => execCommand('formatBlock', e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="p"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>

            {/* Save Button */}
            {onSave && (
              <div className="ml-auto">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {hasChanges ? 'Save Changes' : 'Saved'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden"
      >
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          className={`min-h-[600px] p-8 focus:outline-none text-white ${
            readOnly ? 'cursor-default' : 'cursor-text'
          }`}
          style={{
            lineHeight: '1.8',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
          suppressContentEditableWarning
        />
      </motion.div>

      {/* Character Count */}
      <div className="text-sm text-gray-400 text-right">
        {editorRef.current?.textContent?.length || 0} characters
      </div>
    </div>
  );
}
