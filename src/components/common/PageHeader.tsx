import type { ReactNode } from 'react';
import Container from './Container';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <section className="relative bg-bg pixel-cross py-8 sm:py-12 md:py-16">
      <Container className="relative z-10 text-center">
        <h1 className="text-title text-ink">{title}</h1>
        {subtitle && (
          <p className="text-lead text-ink-soft max-w-2xl mx-auto mt-2 sm:mt-3">{subtitle}</p>
        )}
        {children}
      </Container>
      <div className="absolute bottom-0 left-0 right-0 pixel-divider-primary" />
    </section>
  );
}
