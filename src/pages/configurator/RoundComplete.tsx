import { Layout } from '@/components/layout/Layout';
import { BaseConfigurator } from '@/components/configurator/BaseConfigurator';

export default function ConfiguratorRoundComplete() {
  return (
    <Layout>
      <BaseConfigurator
        shape="round"
        withCurb={true}
        titleDe="Lichtkuppel mit Aufsatzkranz (Rund)"
        titleEn="Skylight with Mounting Curb (Round)"
      />
    </Layout>
  );
}
