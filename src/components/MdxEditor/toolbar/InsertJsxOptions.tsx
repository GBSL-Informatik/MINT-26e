import { ButtonOrDropdownButton, insertJsx$, usePublisher } from '@mdxeditor/editor';
import React from 'react';
import { mdiApplicationOutline, mdiDotsVerticalCircleOutline, mdiFormatListCheckbox } from '@mdi/js';
import Button from '@tdev-components/shared/Button';
import Icon from '@mdi/react';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertJsxElements = () => {
    const insertJsx = usePublisher(insertJsx$);
    return (
        <ButtonOrDropdownButton
            items={[
                {
                    label: <Button icon={mdiFormatListCheckbox} text="DocCardList" iconSide="left" />,
                    value: 'DocCardList'
                },
                {
                    label: <Button icon={mdiApplicationOutline} text="BrowserWindow" iconSide="left" />,
                    value: 'BrowserWindow'
                }
            ]}
            title="Insert JSX Elements"
            onChoose={(value) => {
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
                }
            }}
        >
            <Icon path={mdiDotsVerticalCircleOutline} size={1} />
        </ButtonOrDropdownButton>
    );
};
