import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {language === 'de' ? 'Anmelden' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Melden Sie sich mit Ihrem Konto an'
                : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
