import { useTranslation } from 'react-i18next';
import { Button, Container } from './common';
import { ArrowRightIcon } from './icons';

/* Decorative food pictures: a tidy row of three on phones, an overlapping collage from tablet up. */
const tiles = [
  { src: '/stew.png', position: 'md:top-0 md:right-0 md:w-44 md:h-44 lg:w-64 lg:h-64' },
  { src: '/fish.png', position: 'md:bottom-0 md:left-[18%] md:w-36 md:h-36 lg:w-52 lg:h-52' },
  { src: '/noodle.png', position: 'md:top-6 md:left-[6%] md:w-20 md:h-20 lg:w-28 lg:h-28' },
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
                key={tile.src}
                className={`aspect-square md:aspect-auto md:absolute bg-surface pixel-box overflow-hidden ${tile.position}`}
              >
                <img src={tile.src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <img
              src="/bread.png"
              alt=""
              className="hidden md:block absolute bottom-8 right-[12%] w-12 h-12 object-cover animate-float"
            />
          </div>
        </div>
      </Container>

      <div className="pixel-divider" />
    </section>
  );
}
