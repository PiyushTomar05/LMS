import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="inline-flex p-4 rounded-full bg-red-50 text-red-500 mb-6">
                                <AlertTriangle size={48} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
                            <p className="text-slate-500 mb-8">
                                An unexpected error has occurred. Our team has been notified.
                            </p>

                            <div className="bg-slate-50 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40 text-xs font-mono text-slate-600 border border-slate-200">
                                {this.state.error && this.state.error.toString()}
                            </div>

                            <button
                                onClick={this.handleReload}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
