import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    const { error } = await signUp(values.email, values.password, values.fullName);
    setLoading(false);

    if (error) {
      toast({
        title: language === 'de' ? 'Registrierungsfehler' : 'Registration Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: language === 'de' ? 'Registrierung erfolgreich!' : 'Registration successful!',
      description: language === 'de' 
        ? 'Bitte überprüfen Sie Ihre E-Mail zur Bestätigung' 
        : 'Please check your email to verify your account',
    });

    navigate('/login');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'de' ? 'Vollständiger Name' : 'Full Name'}</FormLabel>
              <FormControl>
                <Input placeholder="Max Mustermann" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'de' ? 'E-Mail' : 'Email'}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@beispiel.de"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'de' ? 'Passwort' : 'Password'}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {language === 'de' ? 'Passwort bestätigen' : 'Confirm Password'}
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {language === 'de' ? 'Registrieren' : 'Sign Up'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {language === 'de' ? 'Bereits ein Konto?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {language === 'de' ? 'Anmelden' : 'Sign In'}
          </Link>
        </p>
      </form>
    </Form>
  );
}
