// https://github.com/mdx-editor/editor/blob/main/src/plugins/codemirror/CodeMirrorEditor.tsx
import { useCellValues } from '@mdxeditor/gurx';
import React from 'react';

import { languages } from '@codemirror/language-data';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { basicLight } from 'cm6-theme-basic-light';
import { basicSetup } from 'codemirror';
import { codeBlockLanguages$, codeMirrorAutoLoadLanguageSupport$, codeMirrorExtensions$ } from '.';
import {
    CodeBlockEditorProps,
    readOnly$,
    Select,
    useCodeBlockEditorContext,
    useTranslation
} from '@mdxeditor/editor';
import { useCodeMirrorRef } from './useCodeMirrorRef';
import styles from './styles.module.scss';
import Card from '@tdev-components/shared/Card';
import RemoveJsxNode from '@tdev-components/Cms/MdxEditor/RemoveJsxNode';
import clsx from 'clsx';
import GenericAttributeEditor, { GenericPropery, GenericValueProperty } from '../../GenericAttributeEditor';
import { extractMetaProps } from '@tdev/theme/CodeBlock';
import { v4 } from 'uuid';

export const COMMON_STATE_CONFIG_EXTENSIONS: Extension[] = [];
const EMPTY_VALUE = '__EMPTY_VALUE__';

const LANGUAGE_ALIAS_MAP: { [key: string]: string } = {
    ['mdx-code-block']: 'tsx'
};

const DOCUSAURUS_LINE_HIGHLIGHT_REGEX = /^\{(\d|,|\.|-)+\}$/;

const PYTHON_PROPS: GenericPropery[] = [
    {
        name: 'live_py',
        type: 'checkbox',
        required: false,
        sideEffect: (props, initial) => {
            if (props.live_py && !props.id && !props.slim) {
                return [{ name: 'id', value: (initial.id as string) || v4() }];
            } else if (!props.live_py) {
                const change = [];
                if (props.slim) {
                    change.push({ name: 'slim', value: '' });
                }
                if (props.id) {
                    change.push({ name: 'id', value: '' });
                }
                return change;
            }
        }
    },
    {
        name: 'slim',
        type: 'checkbox',
        required: false
    },
    {
        name: 'id',
        type: 'string',
        required: false,
        sideEffect: (props, initial) => {
            const delta: { name: string; value: string }[] = [];
            if (!props.live_py) {
                return;
            }
            if (props.id) {
                if (props.slim) {
                    delta.push({ name: 'slim', value: '' });
                }
            } else if (!props.slim) {
                delta.push({ name: 'slim', value: 'true' });
            }
            return delta;
        }
    },
    { name: 'readonly', type: 'checkbox', required: false },
    { name: 'noDownload', type: 'checkbox', required: false },
    { name: 'noReset', type: 'checkbox', required: false },
    { name: 'noCompare', type: 'checkbox', required: false },
    {
        name: 'versioned',
        type: 'checkbox',
        required: false,
        description: 'Jede Sekunde eine Version abspeichern.'
    },
    {
        name: 'noHistory',
        type: 'checkbox',
        required: false,
        description: 'Versionshistory verstecken'
    },
    {
        name: 'maxLines',
        type: 'number',
        required: false,
        description: 'Maximale Anzahl Zeilen bevor gescrollt wird.'
    }
];

export const CodeMirrorEditor = ({ language, nodeKey, code, focusEmitter, meta }: CodeBlockEditorProps) => {
    const mappedLang = LANGUAGE_ALIAS_MAP[language] || language;
    const t = useTranslation();
    const { parentEditor, lexicalNode } = useCodeBlockEditorContext();
    const [readOnly, codeMirrorExtensions, autoLoadLanguageSupport, codeBlockLanguages] = useCellValues(
        readOnly$,
        codeMirrorExtensions$,
        codeMirrorAutoLoadLanguageSupport$,
        codeBlockLanguages$
    );

    const codeMirrorRef = useCodeMirrorRef(nodeKey, 'codeblock', language, focusEmitter);
    const { setCode } = useCodeBlockEditorContext();
    const editorViewRef = React.useRef<EditorView | null>(null);
    const elRef = React.useRef<HTMLDivElement | null>(null);

    const setCodeRef = React.useRef(setCode);
    setCodeRef.current = setCode;
    codeMirrorRef.current = {
        getCodemirror: () => editorViewRef.current!
    };

    React.useEffect(() => {
        void (async () => {
            const extensions = [
                ...codeMirrorExtensions,
                basicSetup,
                basicLight,
                lineNumbers(),
                EditorView.lineWrapping,
                EditorView.updateListener.of(({ state }) => {
                    setCodeRef.current(state.doc.toString());
                })
            ];
            if (readOnly) {
                extensions.push(EditorState.readOnly.of(true));
            }
            if (language !== '' && autoLoadLanguageSupport) {
                const languageData = languages.find((l) => {
                    return (
                        l.name === mappedLang ||
                        l.alias.includes(mappedLang) ||
                        l.extensions.includes(mappedLang)
                    );
                });
                if (languageData) {
                    try {
                        const languageSupport = await languageData.load();
                        extensions.push(languageSupport.extension);
                    } catch (e) {
                        console.warn('failed to load language support for', language);
                    }
                }
            }
            elRef.current!.innerHTML = '';
            editorViewRef.current = new EditorView({
                parent: elRef.current!,
                state: EditorState.create({ doc: code, extensions })
            });
        })();
        return () => {
            editorViewRef.current?.destroy();
            editorViewRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readOnly, language]);
    const metaProps = React.useMemo(() => {
        const mProps = extractMetaProps({ metastring: meta });
        console.log('metaProps', mProps, meta);
        return Object.entries(mProps).reduce<Record<string, string>>((acc, [key, value]) => {
            if (DOCUSAURUS_LINE_HIGHLIGHT_REGEX.test(key)) {
                acc['highlightedLines'] = key.substring(1, key.length - 1);
            } else if (typeof value === 'boolean') {
                acc[key] = value ? 'true' : 'false';
            } else if (key === 'title') {
                acc[key] = `${value}`.replace(/(^")|("$)/g, '');
            } else {
                acc[key] = `${value}`;
            }
            return acc;
        }, {});
    }, [meta]);

    const onUpdate = React.useCallback(
        (values: GenericValueProperty[]) => {
            const updatedVals = values.reduce<Record<string, string>>((acc, prop) => {
                acc[prop.name] = prop.value;
                return acc;
            }, {});
            const metaString = Object.entries({ ...metaProps, ...updatedVals }).reduce<string>(
                (acc, [key, value]) => {
                    if (value === '' || !value || value === 'false') {
                        return acc;
                    }
                    if (value === 'true') {
                        return `${acc} ${key}`.trim();
                    }
                    if (key === 'title') {
                        return `${acc} title="${value}"`.trim();
                    }
                    if (key === 'highlightedLines') {
                        return `${acc} {${value}}`.trim();
                    }
                    return `${acc} ${key}=${value}`.trim();
                },
                ''
            );
            parentEditor.update(() => {
                lexicalNode.setMeta(metaString);
                setTimeout(() => {
                    parentEditor.update(() => {
                        lexicalNode.getLatest().select();
                    });
                });
            });
        },
        [metaProps, parentEditor, lexicalNode]
    );

    const properties = React.useMemo<GenericPropery[]>(() => {
        const props: GenericPropery[] = [
            { name: 'title', type: 'string', required: false, placeholder: 'Title' }
        ];
        if (['python', 'py', 'mpy'].includes(language)) {
            props.push(...PYTHON_PROPS);
        } else {
            props.push({ name: 'highlightedLines', type: 'string', required: false, placeholder: '1,4-6,9' });
            props.push({ name: 'showLineNumbers', type: 'checkbox', required: false });
        }
        return props;
    }, [language]);

    return (
        <Card
            classNames={{
                card: styles.editor,
                header: styles.toolbar
            }}
            header={
                <>
                    <Select
                        value={language}
                        onChange={(language) => {
                            parentEditor.update(() => {
                                lexicalNode.setLanguage(language === EMPTY_VALUE ? '' : language);
                                setTimeout(() => {
                                    parentEditor.update(() => {
                                        lexicalNode.getLatest().select();
                                    });
                                });
                            });
                        }}
                        triggerTitle={t('codeBlock.selectLanguage', 'Select code block language')}
                        placeholder={t('codeBlock.inlineLanguage', 'Language')}
                        items={Object.entries(codeBlockLanguages).map(([value, label]) => ({
                            value: value ? value : EMPTY_VALUE,
                            label
                        }))}
                    />
                    {metaProps.title && <h4>{metaProps.title.replace(/^"/, '').replace(/"$/, '')}</h4>}
                    <GenericAttributeEditor onUpdate={onUpdate} properties={properties} values={metaProps} />
                    <RemoveJsxNode
                        buttonClassName={clsx(styles.removeButton)}
                        onRemove={() => {
                            parentEditor.update(() => {
                                lexicalNode.remove();
                            });
                        }}
                    />
                </>
            }
        >
            <div
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <div ref={elRef} />
            </div>
        </Card>
    );
};
