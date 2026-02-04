import { Layout } from '@/components/layout/Layout';
import { BaseConfigurator } from '@/components/configurator/BaseConfigurator';

export default function ConfiguratorRoundShell() {
  return (
    <Layout>
      <BaseConfigurator
        shape="round"
        withCurb={false}
        titleDe="Lichtkuppel / Oberschale (Rund)"
        titleEn="Skylight / Top Shell (Round)"
      />
    </Layout>
  );
}
