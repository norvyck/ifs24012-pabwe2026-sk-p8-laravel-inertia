import React, { useEffect, useRef } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';

export default function MarkdownViewer({ content = '' }) {
    const containerRef = useRef(null);
    const viewerInstance = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        viewerInstance.current = Editor.factory({
            el: containerRef.current,
            viewer: true,
            initialValue: content || '',
            theme: 'dark',
        });

        return () => {
            if (viewerInstance.current) {
                viewerInstance.current.destroy();
                viewerInstance.current = null;
            }
        };
    }, [content]);

    return (
        <div className="toastui-editor-dark prose prose-invert max-w-none text-slate-200 leading-relaxed font-sans">
            <div ref={containerRef} />
        </div>
    );
}
