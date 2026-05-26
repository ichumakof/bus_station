import { Button } from 'antd';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import PageError from './PageError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <PageError message="Интерфейс столкнулся с неожиданной ошибкой. Попробуйте перезагрузить страницу." />
          <Button type="primary" onClick={this.handleReload}>
            Перезагрузить страницу
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
