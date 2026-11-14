import React, { useEffect, useRef } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function MarkdownViewer({ content = '' }) {
    const containerRef = useRef(null);
    const viewerInstance = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        viewerInstance.current = Editor.factory({
            el: containerRef.current,
            viewer: true,
            initialValue: content || '',
        });

        return () => {
            if (viewerInstance.current) {
                viewerInstance.current.destroy();
                viewerInstance.current = null;
            }
        };
    }, [content]);

    return (
        <div className="prose max-w-none text-slate-800 leading-relaxed font-sans">
            <div ref={containerRef} />
        </div>
    );
}
