import { observer } from 'mobx-react-lite';
import { CmsTextContext, useFirstCmsTextDocumentIfExists } from '@tdev-components/documents/CmsText/shared';
import React from 'react';
import CodeBlock, { Props as CodeBlockProps } from '@theme/CodeBlock';
import PermissionsPanel from '@tdev-components/PermissionsPanel';
import { Props as DefaultCmsProps } from '..';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CmsActions from '../CmsActions';

interface Props extends DefaultCmsProps {
    codeBlockProps?: CodeBlockProps;
}

const CmsCode = observer((props: Props) => {
    const { id, name, showActions } = props;
    const contextId = name ? React.useContext(CmsTextContext)?.entries[name] : undefined;
    const rootId = id || contextId;
    const cmsText = useFirstCmsTextDocumentIfExists(rootId);
    if (!cmsText || !cmsText.canDisplay) {
        return showActions && rootId ? <CmsActions rootId={rootId} /> : null;
    }
    if (showActions && rootId) {
        return (
            <div className={clsx(styles.container, props.codeBlockProps?.title && styles.withTitle)}>
                <CmsActions rootId={rootId} className={clsx(styles.codeBlock)} />
                <CodeBlock {...(props.codeBlockProps || {})}>{cmsText.text}</CodeBlock>
            </div>
        );
    }

    return <CodeBlock {...(props.codeBlockProps || {})}>{cmsText.text}</CodeBlock>;
});

export default CmsCode;
