import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { ContactSection } from '@/components/home/ContactSection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <ProcessSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
