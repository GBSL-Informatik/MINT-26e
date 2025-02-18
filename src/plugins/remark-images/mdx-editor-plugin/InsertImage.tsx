import React from 'react';
// import styles from '../../../styles/ui.module.css';
import Popup from 'reactjs-popup';
import { ImageDialog } from './ImagesDialog';
import Button from '@tdev-components/shared/Button';
import { mdiImageOutline } from '@mdi/js';

/**
 * A toolbar button that allows the user to insert an image from an URL.
 * For the button to work, you need to have the `imagePlugin` plugin enabled.
 * @group Toolbar Components
 */
export const InsertImage = React.forwardRef<HTMLButtonElement, Record<string, never>>((_, forwardedRef) => {
    return (
        <Popup
            trigger={
                <span>
                    <Button icon={mdiImageOutline} />
                </span>
            }
            on="click"
            closeOnDocumentClick
            overlayStyle={{ background: 'rgba(0,0,0,0.5)' }}
            modal
        >
            <ImageDialog />
        </Popup>
    );
});
