import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 font-medium">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;