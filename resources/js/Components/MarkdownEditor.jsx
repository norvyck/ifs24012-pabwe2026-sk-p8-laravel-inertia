import React, { useEffect, useRef } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function MarkdownEditor({ initialValue = '', onChange, height = '450px' }) {
    const containerRef = useRef(null);
    const editorInstance = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        editorInstance.current = new Editor({
            el: containerRef.current,
            height: height,
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            initialValue: initialValue || '',
            events: {
                change: () => {
                    if (onChange && editorInstance.current) {
                        onChange(editorInstance.current.getMarkdown());
                    }
                },
            },
        });

        return () => {
            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorInstance.current) {
            const currentMarkdown = editorInstance.current.getMarkdown();
            if (initialValue !== currentMarkdown) {
                editorInstance.current.setMarkdown(initialValue || '');
            }
        }
    }, [initialValue]);

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
            <div ref={containerRef} />
        </div>
    );
}
