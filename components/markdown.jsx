import MarkdownToJsx from 'markdown-to-jsx';

export function Markdown({ content, className }) {
    return (
        <MarkdownToJsx
            className={['markdown', className].filter(Boolean).join(' ')}
        >
            {content}
        </MarkdownToJsx>
    );
}
