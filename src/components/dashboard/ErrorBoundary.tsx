'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Validator Component Caught Error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl my-4 text-rose-900 shadow-sm animate-in fade-in">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                        <span className="text-xl">⚠️</span> Rendering Exception
                    </h2>
                    <p className="text-sm font-semibold mb-2">
                        The validator interface encountered a client-side error:
                    </p>
                    <pre className="text-xs text-rose-800 bg-rose-100 p-3 rounded-lg overflow-x-auto">
                        {this.state.error?.message || 'Unknown error occurred'}
                    </pre>
                    <button
                        className="mt-4 px-4 py-2 bg-rose-600 text-white font-medium rounded-lg text-sm hover:bg-rose-700 transition"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
