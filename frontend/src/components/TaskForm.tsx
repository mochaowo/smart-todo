import React, { useState, useRef, useEffect } from 'react';
import { TaskCreate } from '../types/Task';
import { format } from 'date-fns';

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(2);
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        // 只有當所有欄位都為空時才收縮
        if (!title && !description && !dueDate && !tags) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [title, description, dueDate, tags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 如果沒有填寫日期，使用當天日期
    const effectiveDueDate = dueDate || format(new Date(), 'yyyy-MM-dd');

    // 將日期轉換為 ISO 格式的字符串
    let formattedDueDate: string | undefined;
    if (effectiveDueDate) {
      const date = new Date(effectiveDueDate);
      // 設置時間為當天的 23:59:59
      date.setHours(23, 59, 59, 999);
      formattedDueDate = date.toISOString();
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: formattedDueDate,
      tags: tags || undefined
    });

    // 重置表單
    setTitle('');
    setDescription('');
    setPriority(2);
    setDueDate('');
    setTags('');
    setIsExpanded(false);
  };

  const handleTitleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPriority(2);
    setDueDate('');
    setTags('');
    setIsExpanded(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <input
          type="text"
          placeholder="添加新任務..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={handleTitleFocus}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {isExpanded && (
          <>
            <textarea
              placeholder="任務描述（可選）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>低優先級</option>
                  <option value={2}>中優先級</option>
                  <option value={3}>高優先級</option>
                </select>
              </div>
              
              <div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="到期日期（可選，默認為今天）"
                />
              </div>
            </div>
            
            <input
              type="text"
              placeholder="標籤（用逗號分隔）"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!title.trim()}
              >
                添加任務
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
