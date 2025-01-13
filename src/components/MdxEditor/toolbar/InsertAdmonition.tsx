import {
    ButtonOrDropdownButton,
    iconComponentFor$,
    insertDirective$,
    useCellValue,
    usePublisher,
    useTranslation
} from '@mdxeditor/editor';
import React from 'react';
import { ADMONITION_TYPES } from '../directive-editors/AdmonitionDirectiveDescriptor';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertAdmonition = () => {
    const insertDirective = usePublisher(insertDirective$);
    const iconComponentFor = useCellValue(iconComponentFor$);
    const t = useTranslation();

    const items = React.useMemo(() => {
        return ADMONITION_TYPES.map((type) => ({ value: type, label: type }));
    }, [t]);

    return (
        <ButtonOrDropdownButton
            title={t('toolbar.admonition', 'Insert Admonition')}
            onChoose={(admonitionName) => {
                insertDirective({
                    type: 'containerDirective',
                    name: admonitionName
                });
            }}
            items={items}
        >
            {iconComponentFor('admonition')}
        </ButtonOrDropdownButton>
    );
};
