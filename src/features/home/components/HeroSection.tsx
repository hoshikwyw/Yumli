import { useTranslation } from 'react-i18next';
import { Button, Container, PixelArt, type SpriteName } from '@/components/ui';
import { ArrowRightIcon } from '@/components/ui/icons';

/* Decorative food pictures: a tidy row of three on phones, an overlapping collage from tablet up. */
const tiles: { icon: SpriteName; tone: string; position: string }[] = [
  { icon: 'pot', tone: 'bg-warm-soft', position: 'md:top-0 md:right-0 md:w-44 md:h-44 lg:w-64 lg:h-64' },
  { icon: 'fish', tone: 'bg-accent-soft', position: 'md:bottom-0 md:left-[18%] md:w-36 md:h-36 lg:w-52 lg:h-52' },
  { icon: 'noodles', tone: 'bg-secondary-soft', position: 'md:top-6 md:left-[6%] md:w-20 md:h-20 lg:w-28 lg:h-28' },
];

/**
 * Top of the home page. It has no data to wait for, so it is on screen
 * immediately, however slow the connection.
 */
export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-bg pixel-hearts">
      <Container className="py-10 sm:py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="text-center md:text-left">
            <p className="text-eyebrow text-secondary-ink">{t('hero.tagline')}</p>
            <h1 className="text-display text-ink mt-3">
              <span className="block">{t('hero.title1')}</span>
              <span className="block text-primary-ink">{t('hero.title2')}</span>
            </h1>
            <p className="text-lead text-ink-soft mt-4 max-w-md mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>
            <div className="mt-6 sm:mt-8">
              <Button to="/recipes" variant="primary" size="lg" className="w-full sm:w-auto">
                {t('hero.cta')}
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm mx-auto md:max-w-none md:block md:relative md:h-80 lg:h-[420px]"
          >
            {tiles.map((tile) => (
              <div
                key={tile.icon}
                className={`relative aspect-square md:aspect-auto md:absolute pixel-box ${tile.tone} ${tile.position}`}
              >
                {/* Inset, not padding: percentage padding would be measured against the whole collage */}
                <PixelArt name={tile.icon} className="absolute inset-[10%] w-[80%] h-[80%]" />
              </div>
            ))}
            <PixelArt name="toast" className="hidden md:block absolute bottom-8 right-[12%] w-12 h-12 animate-float" />
          </div>
        </div>
      </Container>

      <div className="pixel-divider" />
    </section>
  );
}
