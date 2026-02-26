import type { Toast } from '../hooks/useToast';

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const bgColors: Record<Toast['type'], string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${bgColors[t.type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] animate-slide-in`}
        >
          <span className="flex-1 text-sm">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="text-white/70 hover:text-white text-lg leading-none">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
