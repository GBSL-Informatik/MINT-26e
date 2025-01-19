import { CmsStore } from '@tdev-stores/CmsStore';
import { action, computed, IObservableArray, observable } from 'mobx';
import { Octokit, RestEndpointMethodTypes as GhTypes } from '@octokit/rest';
import siteConfig from '@generated/docusaurus.config';
import FileStub from './FileStub';
import Dir from './Dir';
import File from './File';
import { ApiState } from '@tdev-stores/iStore';
import Branch, { MergeStatus } from './Branch';
import PR from './PR';
const { organizationName, projectName } = siteConfig;

export type GhRepo = GhTypes['repos']['get']['response']['data'];
export type GhBranch = GhTypes['repos']['listBranches']['response']['data'][number];
export type GhPr =
    | GhTypes['pulls']['list']['response']['data'][number]
    | GhTypes['pulls']['create']['response']['data'];

const PR_PAGE_SIZE = 20;
// name: string;
// commit: {
//     sha: string;
//     url: string;
// };
// protected: boolean;
// protection?: components["schemas"]["branch-protection"];
// protection_url?: string;

class Github {
    readonly store: CmsStore;

    /* contains branch <-> rootDirectory */
    entries = observable.map<string, IObservableArray<Dir | File | FileStub>>([], { deep: false });
    @observable.ref accessor octokit: Octokit;

    branches = observable.array<Branch>([]);

    PRs = observable.array<PR>([]);

    @observable.ref accessor repo: GhRepo | undefined;

    apiStates = observable.map<string, ApiState>([], { deep: false });

    constructor(accessToken: string, store: CmsStore) {
        this.store = store;
        this.octokit = new Octokit({ auth: accessToken });
    }

    @action
    load() {
        return Promise.all([this.fetchRepo(), this.fetchBranches(), this.fetchPRs()]);
    }

    @action
    fetchRepo() {
        return this.octokit.repos.get({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                this.repo = res.data;
            })
        );
    }

    @computed
    get defaultBranchName() {
        if (!this.repo) {
            return undefined;
        }
        return this.repo.default_branch;
    }

    @computed
    get defaultBranch() {
        if (!this.repo) {
            return undefined;
        }
        return this.branches.find((ref) => ref.name === this.defaultBranchName);
    }

    @action
    fetchBranches() {
        return this.octokit.repos.listBranches({ repo: projectName!, owner: organizationName! }).then(
            action((res) => {
                const branches = res.data.map((br) => new Branch(br, this));
                this.branches.replace(branches);
            })
        );
    }

    @action
    fetchPRs(page?: number) {
        return this.octokit.pulls
            .list({
                repo: projectName!,
                owner: organizationName!,
                state: 'open',
                per_page: PR_PAGE_SIZE,
                sort: 'created',
                direction: 'desc',
                page: page ?? 1
            })
            .then(
                action((res) => {
                    const prs = res.data.map((pr) => new PR(pr, this));
                    const newPRs = new Set(prs.map((pr) => pr.number));
                    this.PRs.replace([...this.PRs.filter((pr) => !newPRs.has(pr.number)), ...prs]);
                })
            );
    }

    @action
    fetchPrState(number: number) {
        return this.octokit.pulls
            .get({
                repo: projectName!,
                owner: organizationName!,
                pull_number: number
            })
            .then(
                action((res) => {
                    return res.data;
                })
            );
    }

    @computed
    get nextPrName() {
        const now = new Date().toISOString().replace('T', '--').replaceAll(':', '-').slice(0, 17);
        return `cms/pr-${now}`;
    }

    @action
    saveFileInNewBranchAndCreatePr(file: File, newBranch: string) {
        this.createNewBranch(newBranch)
            .then(async () => {
                await this.createOrUpdateFile(file.path, file.content, newBranch, file.sha);
                await this.createPR(newBranch, newBranch);
                this.store.settings?.setLocation(newBranch, file.path);
            })
            .catch(() => {
                return this.deleteBranch(newBranch).catch(() => {
                    console.warn('Failed to delete branch', newBranch);
                });
            });
    }

    @action
    rebaseBranch(branch: string, to: string) {
        // octokit has no "rebase" action, so do a merge
        return this.octokit.repos
            .merge({
                owner: organizationName!,
                repo: projectName!,
                base: to,
                head: branch,
                commit_message: `Merge ${branch} into ${to}`
            })
            .then(
                action((res) => {
                    const newBranch = new Branch({ name: branch, commit: res.data }, this);
                    this._addBranchEntry(newBranch);
                    newBranch.sync();
                    if (newBranch.PR) {
                        newBranch.PR.sync();
                    }
                    return res.data;
                })
            )
            .catch((err) => {
                console.error('Error merging branch', err);
                return err;
            });
    }

    @action
    mergePR(prNumber: number) {
        this.octokit.pulls
            .merge({
                owner: organizationName!,
                repo: projectName!,
                pull_number: prNumber,
                merge_method: 'merge', // or "squash" or "rebase"
                commit_title: `CMS: Merge #${prNumber}`
            })
            .then(
                action((res) => {
                    const pr = this.store.findPr(prNumber);
                    if (pr) {
                        pr.setMerged(true);
                        pr.sync();
                    }
                })
            );
    }

    @action
    closeAndDeletePr(prNumber: number) {
        const pr = this.PRs.find((p) => p.number === prNumber);
        if (!pr) {
            return;
        }
        this.closePr(prNumber).then(() => {
            this.deleteBranch(pr.branchName).catch(() => {
                console.warn('Failed to delete branch', pr.branchName);
            });
        });
    }

    @action
    deleteBranch(name: string) {
        return this.octokit.git
            .deleteRef({
                owner: organizationName!,
                repo: projectName!,
                ref: `heads/${name}`
            })
            .then(
                action(() => {
                    const current = this.branches.find((b) => b.name === name);
                    if (current) {
                        this.branches.remove(current);
                    }
                })
            );
    }

    @action
    closePr(prNumber: number) {
        return this.octokit.pulls
            .update({
                owner: organizationName!,
                repo: projectName!,
                pull_number: prNumber,
                state: 'closed'
            })
            .then(
                action(() => {
                    const current = this.PRs.find((b) => b.number === prNumber);
                    if (current) {
                        this.PRs.remove(current);
                    }
                })
            );
    }

    @action
    createNewBranch(name: string) {
        if (!this.defaultBranch) {
            return Promise.resolve();
        }

        return this.octokit.git
            .createRef({
                owner: organizationName!,
                repo: projectName!,
                ref: `refs/heads/${name}`,
                sha: this.defaultBranch.sha
            })
            .then(
                action((res) => {
                    const newBranch = new Branch(
                        {
                            name: name,
                            commit: {
                                sha: res.data.object.sha,
                                url: res.data.object.url
                            }
                        },
                        this
                    );
                    this._addBranchEntry(newBranch);
                    return newBranch;
                })
            );
    }

    @action
    createPR(branch: string, title: string, body?: string) {
        if (!this.defaultBranchName) {
            return Promise.resolve();
        }
        return this.octokit.pulls
            .create({
                owner: organizationName!,
                repo: projectName!,
                title: title,
                head: branch,
                base: this.defaultBranchName, // or whatever base branch
                body: body
            })
            .then((res) => {
                const pr = new PR(res.data, this);
                this._addPr(pr);
                return pr;
            });
    }

    @action
    saveFile(file: File, commitMessage?: string) {
        return this.createOrUpdateFile(file.path, file.content, file.branch, file.sha, commitMessage);
    }

    @action
    fetchBranchStatus(from: Branch, to?: Branch) {
        const toBranch = to?.sha || this.defaultBranch?.name;
        if (!toBranch) {
            return Promise.resolve();
        }
        return this.octokit.repos
            .compareCommitsWithBasehead({
                basehead: `${toBranch}...${from.name}`,
                owner: organizationName!,
                repo: projectName!
            })
            .then((res) => res.data);
    }

    @action
    createOrUpdateFile(path: string, content: string, branch: string, sha?: string, commitMessage?: string) {
        const textContent = new TextEncoder().encode(content);
        const base64Content = btoa(String.fromCharCode(...textContent));
        const current = this.store.findEntry(branch, path) as File | undefined;
        return this.octokit!.repos.createOrUpdateFileContents({
            owner: organizationName!,
            repo: projectName!,
            path: path, // File path in repo
            message: commitMessage || (sha ? `Update: ${path}` : `Create ${path}`),
            content: base64Content,
            branch: branch,
            sha: sha
        }).then(
            action((res) => {
                const resContent = File.ValidateProps(res.data.content, 'stub');
                if (!resContent) {
                    return;
                }
                switch (res.status) {
                    case 200:
                        // file updated
                        if (current) {
                            const file = new File({ ...resContent, content: content }, this.store);
                            this._addFileEntry(branch, file);
                            file.setEditing(true);
                        }
                        break;
                    case 201:
                        // file created
                        const file = new File({ ...resContent, content: content }, this.store);
                        this._addFileEntry(branch, file);
                        break;
                }
            })
        );
    }

    @action
    fetchDirectory(branch: string, path: string = '') {
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branch
            })
            .then(
                action((res) => {
                    const entries = res.data;
                    if (Array.isArray(entries)) {
                        if (entries.length === 0) {
                            return [];
                        }
                        if (!this.entries.has(branch)) {
                            this.entries.set(branch, observable.array([], { deep: false }));
                        }
                        const arr = this.entries.get(branch)!;
                        entries.forEach((entry) => {
                            const old = arr.find((e) => e.path === entry.path);
                            if (old) {
                                if (old.sha === entry.sha) {
                                    return;
                                }
                                arr.remove(old);
                            }
                            switch (entry.type) {
                                case 'dir':
                                    arr.push(new Dir(entry, this.store));
                                    break;
                                case 'file':
                                    arr.push(new FileStub(entry, this.store));
                                    break;
                            }
                        });
                        return arr;
                    }
                    return [];
                })
            );
    }

    @action
    fetchFile(branch: string, path: string, editAfterFetch: boolean = false) {
        const apiId = `${branch}:${path}`;
        this.apiStates.set(apiId, ApiState.SYNCING);
        return this.octokit.repos
            .getContent({
                owner: organizationName!,
                repo: projectName!,
                path: path,
                ref: branch
            })
            .then(
                action((res) => {
                    if ('content' in res.data) {
                        const props = File.ValidateProps(res.data, 'stub');
                        if (props) {
                            this.apiStates.delete(apiId);
                            const content = new TextDecoder().decode(
                                Uint8Array.from(atob(res.data.content), (c) => c.charCodeAt(0))
                            );
                            const file = new File({ ...props, content: content }, this.store);
                            this._addFileEntry(branch, file);
                            if (editAfterFetch) {
                                file.setEditing(true);
                            }
                            return file;
                        }
                    }
                    this.apiStates.set(apiId, ApiState.ERROR);
                })
            )
            .catch(
                action((err) => {
                    console.log('Error fetching file', err);
                    this.apiStates.set(apiId, ApiState.ERROR);
                })
            );
    }

    /**
     * This method adds the File only to the entries map - it won't create or update the file on GitHub.
     */
    @action
    _addFileEntry(refName: string, file: File) {
        if (!this.entries.has(refName)) {
            this.entries.set(refName, observable.array([], { deep: false }));
        }
        const old = this.store.findEntry(refName, file.path);
        if (old) {
            this.entries.get(refName)!.remove(old);
        }
        this.entries.get(refName)!.push(file);
    }

    @action
    _addBranchEntry(branch: Branch) {
        const current = this.branches.find((b) => b.name === branch.name);
        if (current) {
            this.branches.remove(current);
        }
        this.branches.push(branch);
    }

    @action
    _addPr(pr: PR) {
        const current = this.PRs.find((b) => b.number === pr.number);
        if (current) {
            this.PRs.remove(current);
        }
        this.PRs.push(pr);
    }
}

export default Github;
