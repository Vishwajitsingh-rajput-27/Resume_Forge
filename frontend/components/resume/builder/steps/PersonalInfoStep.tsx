'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase } from 'lucide-react';
import { useResumeStore, PersonalInfo } from '@/store/resume-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          <Label htmlFor={`personal-${field.name}`} className="mb-1.5 block">
            {field.label}
          </Label>
          <div className="relative">
            <field.icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`personal-${field.name}`}
              {...register(field.name)}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              className="h-11 pl-10"
            />
          </div>
          {errors[field.name] && (
            <p className="field-error">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
