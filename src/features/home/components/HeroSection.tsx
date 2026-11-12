import { useTranslation } from 'react-i18next';
import { Button, Container, PixelArt, type SpriteName } from '@/components/ui';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * Four food stickers. Each sits on a solid brand colour, not a "soft" tint:
 * solid colours look the same in light and dark mode, so the pictures stay
 * bright on a dark page. From tablet width up the tiles tilt a little, like
 * stickers pressed onto a page; the picture inside is turned back the same
 * amount (`level`), because pixel art looks ragged when it is rotated.
 */
const tiles: { icon: SpriteName; tone: string; tilt: string; level: string }[] = [
  { icon: 'pot', tone: 'bg-warm', tilt: 'md:-rotate-3', level: 'md:rotate-3' },
  { icon: 'noodles', tone: 'bg-secondary', tilt: 'md:rotate-2', level: 'md:-rotate-2' },
  { icon: 'fish', tone: 'bg-accent', tilt: 'md:rotate-3', level: 'md:-rotate-3' },
  { icon: 'toast', tone: 'bg-primary', tilt: 'md:-rotate-2', level: 'md:rotate-2' },
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
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
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

          {/* One row of four on phones; a 2x2 sticker sheet beside the text from tablet up */}
          <div aria-hidden="true" className="relative w-full max-w-sm mx-auto md:max-w-[26rem] md:mr-0 lg:mr-8">
            <div className="grid grid-cols-4 md:grid-cols-2 gap-3 sm:gap-4 md:gap-7">
              {tiles.map((tile) => (
                <div
                  key={tile.icon}
                  className={`relative aspect-square pixel-box transition-transform duration-300 md:hover:scale-105 ${tile.tone} ${tile.tilt}`}
                >
                  {/* Inset, not padding: percentage padding is measured against the grid, not the tile */}
                  <PixelArt name={tile.icon} className={`absolute inset-[12%] w-[76%] h-[76%] ${tile.level}`} />
                </div>
              ))}
            </div>

            {/* Loose stickers around the sheet: only where there is room for them */}
            <PixelArt name="heart" className="hidden md:block absolute -top-8 -right-4 w-12 h-12 animate-float" />
            <PixelArt name="star" className="hidden md:block absolute -bottom-8 -left-5 w-12 h-12 animate-float [animation-delay:-1.5s]" />
          </div>
        </div>
      </Container>

      <div className="pixel-divider" />
    </section>
  );
}
