import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

const loginSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    setLoading(false);

    if (error) {
      toast({
        title: language === 'de' ? 'Anmeldefehler' : 'Login Error',
        description: language === 'de' 
          ? 'E-Mail oder Passwort ungültig' 
          : 'Invalid email or password',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: language === 'de' ? 'Willkommen!' : 'Welcome!',
      description: language === 'de' 
        ? 'Sie wurden erfolgreich angemeldet' 
        : 'You have been logged in successfully',
    });

    navigate(from, { replace: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {language === 'de' ? 'Anmelden' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {language === 'de' ? 'Noch kein Konto?' : "Don't have an account?"}{' '}
          <Link to="/register" className="text-primary hover:underline">
            {language === 'de' ? 'Registrieren' : 'Sign Up'}
          </Link>
        </p>
      </form>
    </Form>
  );
}
