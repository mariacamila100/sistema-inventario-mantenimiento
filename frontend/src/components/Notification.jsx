import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Notification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-600",
    error: "bg-red-50 border-red-100 text-red-600",
  };

  const Icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-[2rem] border shadow-2xl shadow-slate-200/50 animate-in slide-in-from-right-full duration-300 z-[100] ${styles[type]}`}>
      {Icons[type]}
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;