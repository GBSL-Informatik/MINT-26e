import React from 'react';
import { observer } from 'mobx-react-lite';
import { InitState } from 'docusaurus-live-brython/theme/CodeEditor/WithScript/Types';
import Script, { ScriptMeta } from '@site/src/models/documents/Script';
import { useFirstMainDocument } from '@site/src/hooks/useFirstMainDocument';
import Loader from '@site/src/components/Loader';
import CodeBlock from '@theme/CodeBlock';
import useIsBrowser from '@docusaurus/useIsBrowser';
export const Context = React.createContext<Script | undefined>(undefined);

const ScriptContext = observer((props: InitState & { children: JSX.Element }) => {
    const isBrowser = useIsBrowser();
    const [meta] = React.useState(new ScriptMeta(props));
    const doc = useFirstMainDocument(props.id, meta);
    if (!isBrowser) {
        return <CodeBlock language={props.lang}>{props.code}</CodeBlock>;
    }

    if (!doc || !doc.isInitialized) {
        return (
            <div style={{ position: 'relative' }}>
                <CodeBlock language={props.lang}>{props.code}</CodeBlock>
                <Loader label="Editor laden..." overlay />
            </div>
        );
    }
    return <Context.Provider value={doc}>{props.children}</Context.Provider>;
});

export default ScriptContext;
