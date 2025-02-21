import { ButtonOrDropdownButton, insertJsx$, insertMarkdown$, usePublisher } from '@mdxeditor/editor';
import React from 'react';
import {
    mdiApplicationOutline,
    mdiDotsVerticalCircleOutline,
    mdiFormatListCheckbox,
    mdiMathIntegral,
    mdiMathIntegralBox,
    mdiMathSin
} from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Icon from '@mdi/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertJsxElements = () => {
    const insertJsx = usePublisher(insertJsx$);
    const insertMdx = usePublisher(insertMarkdown$);
    const [editor] = useLexicalComposerContext();

    return (
        <>
            <Button
                icon={mdiMathIntegral}
                title="InlineMath"
                onClick={() => {
                    insertMdx('$\\LaTeX$');
                }}
            />
            <ButtonOrDropdownButton
                items={[
                    {
                        label: <Button icon={mdiFormatListCheckbox} text="DocCardList" iconSide="left" />,
                        value: 'DocCardList'
                    },
                    {
                        label: <Button icon={mdiApplicationOutline} text="BrowserWindow" iconSide="left" />,
                        value: 'BrowserWindow'
                    },
                    {
                        label: <Button icon={mdiMathIntegralBox} text="Math-Block" iconSide="left" />,
                        value: 'Math'
                    }
                ]}
                title="Insert JSX Elements"
                onChoose={(value) => {
                    setTimeout(() => {
                        editor.update(() => {
                            switch (value) {
                                case 'DocCardList':
                                    insertJsx({
                                        name: 'DocCardList',
                                        kind: 'flow',
                                        props: {}
                                    });
                                    break;
                                case 'BrowserWindow':
                                    insertJsx({
                                        name: 'BrowserWindow',
                                        kind: 'flow',
                                        props: {}
                                    });
                                    break;
                                case 'Math':
                                    insertMdx('$$\n\\LaTeX\n$$');
                                    break;
                            }
                        });
                    }, 1);
                }}
            >
                <Icon path={mdiDotsVerticalCircleOutline} size={1} />
            </ButtonOrDropdownButton>
        </>
    );
};
