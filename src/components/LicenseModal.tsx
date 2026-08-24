import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { OSS_LICENSES, LicenseItem } from '../data/licenses';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">オープンソースライセンス (OSS Licenses)</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">本アプリケーションで使用しているオープンソースソフトウェアの著作権および許諾表示</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {OSS_LICENSES.map((item: LicenseItem, index: number) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={item.name}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden transition hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Item Summary Header */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">v{item.version}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.copyright}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-bold">
                      {item.license}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded License Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700/40 space-y-2.5 bg-slate-100/70 dark:bg-slate-900/40">
                    {item.repository && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">リポジトリ:</span>
                        <a
                          href={item.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-mono text-[11px] hover:underline font-semibold"
                        >
                          <span>{item.repository}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <div className="p-3 bg-white dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {item.licenseText}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
