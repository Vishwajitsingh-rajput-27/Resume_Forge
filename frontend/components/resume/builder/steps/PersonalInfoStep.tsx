'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase } from 'lucide-react';
import { useResumeStore, PersonalInfo } from '@/store/resume-store';

const schema = z.object({
  name:     z.string().min(2, 'Full name is required'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  linkedin: z.string().optional(),
  github:   z.string().optional(),
  website:  z.string().optional(),
  jobTitle: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const fields: Array<{
  name: keyof FormData; label: string; placeholder: string;
  icon: React.ElementType; type?: string;
}> = [
  { name: 'name',     label: 'Full Name *',       placeholder: 'Jane Smith',                 icon: User },
  { name: 'jobTitle', label: 'Professional Title', placeholder: 'Senior Software Engineer',   icon: Briefcase },
  { name: 'email',    label: 'Email *',            placeholder: 'jane@example.com',           icon: Mail,    type: 'email' },
  { name: 'phone',    label: 'Phone',              placeholder: '+1 (555) 000-0000',          icon: Phone,   type: 'tel' },
  { name: 'address',  label: 'Location',           placeholder: 'San Francisco, CA',          icon: MapPin },
  { name: 'linkedin', label: 'LinkedIn URL',       placeholder: 'linkedin.com/in/janesmith', icon: Linkedin },
  { name: 'github',   label: 'GitHub URL',         placeholder: 'github.com/janesmith',      icon: Github },
  { name: 'website',  label: 'Portfolio / Website', placeholder: 'janesmith.dev',            icon: Globe },
];

export function PersonalInfoStep() {
  const { resume, updatePersonalInfo } = useResumeStore();

  const { register, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: resume.personalInfo,
    mode: 'onChange',
  });

  const values = watch();
  useEffect(() => {
    updatePersonalInfo(values as PersonalInfo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field.name} className={field.name === 'name' ? 'sm:col-span-2' : ''}>
          <label className="block text-sm font-medium mb-1.5">{field.label}</label>
          <div className="relative">
            <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              {...register(field.name)}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896] text-sm transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          {errors[field.name] && (
            <p className="text-xs text-[var(--error)] mt-1">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
