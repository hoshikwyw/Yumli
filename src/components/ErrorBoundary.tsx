import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence: if a page crashes while rendering, show a friendly
 * screen with a way out instead of a blank page. It sits above the router and
 * the providers, so it uses plain links and reads translations directly.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Yumli crashed while rendering:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="bg-bg min-h-dvh flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl" aria-hidden="true">😵</div>
          <h1 className="text-title text-ink mt-4">{i18n.t('error.title')}</h1>
          <p className="text-lead text-ink-soft mt-3">{i18n.t('error.text')}</p>
          {/* The technical message helps while developing; visitors do not need it. */}
          {import.meta.env.DEV && (
            <p className="mt-3 text-sm text-ink-muted break-words">{error.message}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center mt-7">
            <Button variant="primary" onClick={() => this.setState({ error: null })}>
              {i18n.t('error.retry')}
            </Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              {i18n.t('error.home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
