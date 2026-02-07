import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading, confirmText = "Eliminar", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4">
      {/* Tamaño reducido a 320px y padding ajustado */}
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
        
        {/* Encabezado compacto: Icono y Título alineados */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`shrink-0 w-10 h-10 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#003366]'} rounded-xl flex items-center justify-center`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">
            {title}
          </h3>
        </div>

        {/* Mensaje con fuente bold pero tamaño pequeño */}
        <p className="text-slate-500 mb-6 text-xs font-bold leading-snug px-1">
          {message}
        </p>
        
        {/* Botones estilo Mini */}
        <div className="flex gap-2">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 ${type === 'danger' ? 'bg-red-500' : 'bg-[#003366]'} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;