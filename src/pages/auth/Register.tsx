import { Layout } from '@/components/layout/Layout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {language === 'de' ? 'Konto erstellen' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Registrieren Sie sich für ein neues Konto'
                : 'Sign up for a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
