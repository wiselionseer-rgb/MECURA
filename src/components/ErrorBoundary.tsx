import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      try {
        const firestoreError = JSON.parse(this.state.error?.message || '');
        if (firestoreError.error && firestoreError.error.includes('Missing or insufficient permissions')) {
          errorMessage = 'Erro de permissão no banco de dados. Por favor, contate o administrador.';
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ops! Algo deu errado.</h1>
          <p className="text-[#8A8A9E] mb-6">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-mecura-neon text-[#0A0A0F] font-bold py-2 px-6 rounded-full"
          >
            Recarregar Página
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-left max-w-full overflow-auto">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
