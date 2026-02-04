import { Layout } from '@/components/layout/Layout';
import { BaseConfigurator } from '@/components/configurator/BaseConfigurator';

export default function ConfiguratorSquareShell() {
  return (
    <Layout>
      <BaseConfigurator
        shape="square"
        withCurb={false}
        titleDe="Lichtkuppel / Oberschale (Quadratisch)"
        titleEn="Skylight / Top Shell (Square)"
      />
    </Layout>
  );
}
