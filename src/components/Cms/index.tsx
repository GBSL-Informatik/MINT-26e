import Layout from '@theme/Layout';

import { matchPath, Redirect, useHistory, useLocation } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { observer } from 'mobx-react-lite';
import Loader from '@tdev-components/Loader';
import React from 'react';
import { useStore } from '@tdev-hooks/useStore';
import { useGithubAccess } from '@tdev-hooks/useGithubAccess';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PathNav from '@tdev-components/MdxEditor/PathNav';
import Selector from '@tdev-components/Github/Branch/Selector';
import Directory from '@tdev-components/MdxEditor/Directory';
import MdxEditor from '@tdev-components/MdxEditor';
import DefaultEditor from '@tdev-components/Github/DefaultEditor';
import { ApiState } from '@tdev-stores/iStore';
import Card from '@tdev-components/shared/Card';
import Details from '@theme/Details';
import ImagePreview from '@tdev-components/Github/iFile/File/ImagePreview';
import PR from '@tdev-components/Github/PR';
import Branch from '@tdev-components/Github/Branch';

const CmsLandingPage = observer(() => {
    const cmsStore = useStore('cmsStore');
    const access = useGithubAccess();
    const { settings, github, activeEntry } = cmsStore;

    if (access === 'no-token') {
        return <Redirect to={'/gh-login'} />;
    }
    if (access === 'loading' || !settings || !github || !activeEntry) {
        return <Layout>Loading...</Layout>;
    }

    return (
        <main className={clsx(styles.cms)}>
            <PathNav item={activeEntry} />
            <Selector
                onSelect={(branchName) => {
                    if (cmsStore.branchNames.includes(branchName)) {
                        cmsStore.setBranch(branchName);
                    } else {
                        github.createNewBranch(branchName).then((branch) => {
                            cmsStore.setBranch(branchName);
                        });
                    }
                }}
            />
            {activeEntry.type === 'dir' ? (
                <Directory dir={activeEntry} />
            ) : (
                <>
                    {activeEntry.type === 'file' && activeEntry.content !== undefined ? (
                        <>
                            {activeEntry.isImage && (
                                <ImagePreview src={activeEntry.content} fileName={activeEntry.name} />
                            )}
                            {activeEntry.isMarkdown && (
                                <MdxEditor file={activeEntry} key={activeEntry.downloadUrl} />
                            )}
                            {!activeEntry.isImage && !activeEntry.isMarkdown && (
                                <DefaultEditor file={activeEntry} />
                            )}
                        </>
                    ) : (
                        <>
                            {github.apiStates.get(`${settings.activeBranchName}:${settings.activePath}`) ===
                                ApiState.SYNCING && (
                                <Card>
                                    <Loader
                                        label={`${settings.activeBranchName}:${settings.activePath} wird geladen...`}
                                        size={2}
                                    />
                                </Card>
                            )}
                        </>
                    )}
                </>
            )}
            <Details summary={'Files'}>
                <h4>Files</h4>
                <Directory dir={cmsStore.rootDir} />
            </Details>
            <Details summary={'PRs'}>
                <h4>PRs und Branches</h4>
                <ul>
                    {github.PRs.map((pr, idx) => {
                        return (
                            <li key={pr.number}>
                                <PR pr={pr} />
                            </li>
                        );
                    })}
                </ul>
                <ul>
                    {github.branches
                        .filter((b) => !b.PR)
                        .map((branch, idx) => {
                            return (
                                <li key={branch.name}>
                                    <Branch branch={branch} />
                                </li>
                            );
                        })}
                </ul>
            </Details>
        </main>
    );
});

interface Props {
    fileToEdit?: string;
}

const PATHNAME_PATTERN = '/cms/*' as const;

const WithFileToEdit = observer((props: Props) => {
    const cmsStore = useStore('cmsStore');
    const history = useHistory();
    React.useEffect(() => {
        if (props.fileToEdit) {
            cmsStore.settings?.setActivePath(props.fileToEdit, true);
            history.replace(`/cms`);
        }
    }, [props.fileToEdit, history]);
    return <CmsLandingPage />;
});

const Cms = observer(() => {
    const location = useLocation();
    const routeParams = matchPath<string[]>(location.pathname, PATHNAME_PATTERN);
    const fileToEdit = routeParams?.params[0];
    return (
        <Layout title={`CMS`} description="Github">
            <BrowserOnly fallback={<Loader />}>
                {() => {
                    return <WithFileToEdit fileToEdit={fileToEdit} />;
                }}
            </BrowserOnly>
        </Layout>
    );
});

export default Cms;
