'use client';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useResumeStore, Certification } from '@/store/resume-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const empty = (): Certification => ({
  id: uuid(), name: '', issuer: '', issueDate: '',
  expiryDate: '', credentialId: '', url: '',
});

export function CertificationsStep() {
  const { resume, addCertification, updateCertification, removeCertification } = useResumeStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Certification[]>(
    resume.certifications.length ? resume.certifications : []
  );

  const update = (id: string, field: keyof Certification, value: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
    updateCertification(id, { [field]: value });
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
        <div className="py-8 text-center text-muted-foreground">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No certifications added yet.</p>
          <p className="mt-1 text-xs">AWS, Google, Coursera, Udemy — all count!</p>
        </div>
      )}

      {items.map((cert, i) => (
        <Card key={cert.id} className="overflow-hidden shadow-none">
          <div
            className="flex cursor-pointer items-center gap-3 bg-muted/50 px-4 py-3"
            onClick={() => setExpanded(expanded === cert.id ? null : cert.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{cert.name || `Certification ${i + 1}`}</div>
              <div className="truncate text-xs text-muted-foreground">{cert.issuer}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); remove(cert.id); }}
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove certification"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
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
                  <Label htmlFor={`cert-${cert.id}-${field}`} className="mb-1 block text-xs">
                    {label}
                  </Label>
                  <Input
                    id={`cert-${cert.id}-${field}`}
                    value={cert[field] as string}
                    onChange={(e) => update(cert.id, field, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="h-12 w-full border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary"
      >
        <Plus className="w-4 h-4" /> Add Certification
      </Button>
    </div>
  );
}
