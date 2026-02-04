import { Layout } from '@/components/layout/Layout';
import { BaseConfigurator } from '@/components/configurator/BaseConfigurator';

export default function ConfiguratorSquareComplete() {
  return (
    <Layout>
      <BaseConfigurator
        shape="square"
        withCurb={true}
        titleDe="Lichtkuppel mit Aufsatzkranz (Quadratisch)"
        titleEn="Skylight with Mounting Curb (Square)"
      />
    </Layout>
  );
}
