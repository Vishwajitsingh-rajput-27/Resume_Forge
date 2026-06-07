'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore, Certification } from '@/store/resume-store';

const empty = (): Certification => ({
  id: uuid(), name: '', issuer: '', issueDate: '',
  expiryDate: '', credentialId: '', url: '',
});

export function CertificationsStep() {
  const { resume, addCertification, removeCertification } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Certification[]>(
    resume.certifications.length ? resume.certifications : []
  );

  const update = (id: string, field: keyof Certification, value: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  };

  const add = () => {
    const e = empty();
    setItems((prev) => [...prev, e]);
    setExpanded(e.id);
    addCertification(e);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
    removeCertification(id);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No certifications added yet.</p>
          <p className="text-xs mt-1">AWS, Google, Coursera, Udemy — all count!</p>
        </div>
      )}

      {items.map((cert, i) => (
        <div key={cert.id} className="border border-[var(--border-default)] rounded-xl overflow-hidden">
          <div
            className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] cursor-pointer"
            onClick={() => setExpanded(expanded === cert.id ? null : cert.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{cert.name || `Certification ${i + 1}`}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{cert.issuer}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); remove(cert.id); }}
              className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--text-muted)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {expanded === cert.id
              ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            }
          </div>

          {expanded === cert.id && (
            <div className="p-4 grid grid-cols-2 gap-3">
              {([
                ['name',         'Certification Name *', 'AWS Solutions Architect',    'col-span-2'],
                ['issuer',       'Issuing Organization', 'Amazon Web Services',         'col-span-2'],
                ['issueDate',    'Issue Date',           '2024-01',                    ''],
                ['expiryDate',   'Expiry Date',          '2027-01',                    ''],
                ['credentialId', 'Credential ID',        'ABC123XYZ',                  ''],
                ['url',          'Certificate URL',      'https://credly.com/...',     ''],
              ] as [keyof Certification, string, string, string][]).map(([field, label, placeholder, cls]) => (
                <div key={field} className={cls}>
                  <label className="block text-xs font-medium mb-1">{label}</label>
                  <input
                    value={cert[field] as string}
                    onChange={(e) => update(cert.id, field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-sm focus:outline-none focus:ring-1 focus:ring-[#00C896]/40"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={add}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border-default)] text-[var(--text-muted)] hover:border-[#00C896]/40 hover:text-[#00C896] text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
