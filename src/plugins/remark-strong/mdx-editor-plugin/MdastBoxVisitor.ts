/**
 * By Mdx Editor, @url https://github.com/mdx-editor/editor/tree/main/src/plugins/image
 */

import * as Mdast from 'mdast';
import { IS_BOLD, MdastImportVisitor } from '@mdxeditor/editor';
import { rootStore } from '@tdev/stores/rootStore';
import { $createBoxNode } from './BoxNode';

export const MdastBoxVisitor: MdastImportVisitor<Mdast.Strong> = {
    testNode: 'strong',
    visitNode({ mdastNode, actions, lexicalParent }) {
        const { position } = mdastNode;
        if (position) {
            const { cmsStore } = rootStore;

            const content =
                cmsStore.activeEntry?.type === 'file' ? cmsStore.activeEntry.contentAt(position) : undefined;
            if (content && content.startsWith('__')) {
                actions.addAndStepInto($createBoxNode());
                return;
            }
        }
        actions.addFormatting(IS_BOLD);
        actions.visitChildren(mdastNode, lexicalParent);
    },
    priority: 1
};
