import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader, Container, Card, PixelArt } from '@/components/ui';

const features = [
  { icon: 'plate', titleKey: 'about.feature1Title', descKey: 'about.feature1Desc', variant: 'pastel-pink' },
  { icon: 'star', titleKey: 'about.feature2Title', descKey: 'about.feature2Desc', variant: 'pastel-lavender' },
  { icon: 'heart', titleKey: 'about.feature3Title', descKey: 'about.feature3Desc', variant: 'pastel-mint' },
] as const;

export default function About() {
  const { t } = useTranslation();
  useDocumentTitle(t('about.title'));

  return (
    <div className="bg-bg">
      <PageHeader title={t('about.title')} subtitle={t('about.subtitle')} />

      <section className="py-10 sm:py-14">
        <Container size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
            <Card variant="default">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop"
                alt=""
                width={800}
                height={600}
                className="w-full aspect-[4/3] object-cover bg-surface-alt"
              />
            </Card>

            <div>
              <h2 className="text-heading text-ink">{t('about.storyTitle')}</h2>
              <div className="mt-3 space-y-4 text-lead text-ink-soft">
                <p>{t('about.story1')}</p>
                <p>{t('about.story2')}</p>
                <p>{t('about.story3')}</p>
              </div>
            </div>
          </div>

          <ul className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <li key={feature.titleKey}>
                <Card variant={feature.variant} className="h-full p-5 sm:p-6 text-center">
                  <PixelArt name={feature.icon} className="w-12 h-12 mx-auto" />
                  <h3 className="text-subheading text-ink mt-3">{t(feature.titleKey)}</h3>
                  <p className="text-base text-ink-soft mt-1">{t(feature.descKey)}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </div>
  );
}
