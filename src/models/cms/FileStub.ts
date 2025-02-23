import { CmsStore } from '@tdev-stores/CmsStore';
import iEntry, { iEntryProps } from './iEntry';
import { action, computed } from 'mobx';
import { mdiFileCode, mdiFileDocumentOutline, mdiFileImage, mdiFilePdfBox } from '@mdi/js';
import { keysOfInterface } from '@tdev-models/helpers/keysOfInterface';
import { isApplication, isAudio, isImage, isVideo } from './helpers';

export interface FileStubProps extends iEntryProps {
    size: number;
    download_url: string | null;
    encoding?: string;
}

export interface BinFileProps extends FileStubProps {
    binData: Uint8Array;
}
export interface FileProps extends FileStubProps {
    content: string;
}

const FilePropKeys: ReadonlyArray<keyof FileProps> = keysOfInterface<
    keyof Omit<FileProps, 'encoding' | 'content'>
>()('name', 'path', 'url', 'git_url', 'html_url', 'sha', 'size', 'download_url');

const FileStubPropKeys: ReadonlyArray<keyof FileStubProps> = keysOfInterface<
    keyof Omit<FileStubProps, 'encoding'>
>()('name', 'path', 'url', 'git_url', 'html_url', 'sha', 'size', 'download_url');

export abstract class iFileStub extends iEntry {
    readonly size: number;
    readonly downloadUrl: string;

    constructor(props: FileStubProps, store: CmsStore) {
        super(props, store);
        this.size = props.size;
        this.downloadUrl = props.download_url!;
    }

    get isEditing() {
        return false;
    }

    get canEdit() {
        return false;
    }

    setEditing(isEditing: boolean) {
        // no-op
    }

    @computed
    get extension() {
        return this.name.split('.').pop() || '';
    }

    @computed
    get mimeExtension() {
        switch (this.extension) {
            case 'jpg':
            case 'jpeg':
                return 'jpeg';
            case 'svg':
                return 'svg+xml';
            case 'm4a':
            case 'm4v':
                return 'mp4';
            case 'mov':
                return 'quicktime';
            case 'mkv':
                return 'x-matroska';
            case 'avi':
                return 'video/x-msvideo';
            case 'mpg':
                return 'mpeg';
            case 'tif':
                return 'tiff';
            case 'heics':
                return 'heic-sequence';
            case 'heifs':
                return 'heif-sequence';
            default:
                return this.extension;
        }
    }

    @computed
    get mimeType() {
        if (this.isImage) {
            return 'image';
        }
        if (this.isVideo) {
            return 'video';
        }

        if (this.isAudio) {
            return 'audio';
        }
        if (this.isApplicationType) {
            return 'application';
        }
    }

    @computed
    get isAudio() {
        return isAudio(this.extension);
    }

    @computed
    get isImage() {
        return isImage(this.extension);
    }

    @computed
    get isVideo() {
        return isVideo(this.extension);
    }

    @computed
    get isApplicationType() {
        return isApplication(this.extension);
    }

    @computed
    get isBinary() {
        return this.isImage || this.isVideo || this.isApplicationType || this.isAudio;
    }

    @computed
    get isPdf() {
        return /(pdf)$/i.test(this.extension);
    }

    @computed
    get isCode() {
        return /(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|swift|json|yml|yaml|html|htmx|xml|css)$/i.test(
            this.extension
        );
    }

    @computed
    get isMarkdown() {
        return /(md|mdx)$/i.test(this.extension);
    }

    @computed
    get iconColor() {
        if (this.isImage) {
            return 'var(--ifm-color-blue)';
        }
        if (this.isCode) {
            return 'var(--ifm-color-success)';
        }
        if (this.isPdf) {
            return 'var(--ifm-color-danger)';
        }
        return undefined;
    }

    @computed
    get icon() {
        if (this.isImage) {
            return mdiFileImage;
        }
        if (this.isCode) {
            return mdiFileCode;
        }
        if (this.isPdf) {
            return mdiFilePdfBox;
        }
        return mdiFileDocumentOutline;
    }

    get props(): FileStubProps {
        return {
            name: this.name,
            path: this.path,
            url: this.url,
            git_url: this.gitUrl,
            html_url: this.htmlUrl,
            sha: this.sha,
            download_url: this.downloadUrl,
            size: this.size
        };
    }

    @computed
    get sizeMb() {
        return this.size / 1024 / 1024;
    }

    /**
     * returns true when the file is larger than 1MB.
     * In this case, the content will not be provided by the github api
     * and must be fetched separately.
     */
    @computed
    get isLF() {
        return this.sizeMb > 1;
    }

    @action
    fetchContent(editAfterFetch: boolean = false) {
        if (this.isLF) {
            return this.store.github?.fetchRawContent(this, editAfterFetch);
        }
        this.store.github?.fetchFile(this.branch, this.path, editAfterFetch);
    }

    @computed
    get isOnMainBranch() {
        const main = this.store.github?.defaultBranch?.name;
        if (!main) {
            return undefined;
        }
        return main === this.branch;
    }

    static ValidateProps(props: Partial<FileStubProps> | any, type: 'stub'): FileStubProps | undefined;
    static ValidateProps(props: Partial<FileProps> | any, type: 'full'): FileProps | undefined;
    static ValidateProps(
        props: Partial<FileProps> | any,
        type: 'stub' | 'full'
    ): FileProps | FileStubProps | undefined {
        const validP = {} as FileProps;
        let isValid = true;
        const keys = type === 'stub' ? FileStubPropKeys : FilePropKeys;
        keys.forEach((k) => {
            if (props[k] === undefined) {
                isValid = false;
                console.warn('Missing key', k);
            } else {
                (validP as any)[k] = props[k];
            }
        });
        if (type === 'full') {
            if (props['content'] === undefined && props['rawBase64'] === undefined) {
                isValid = false;
                console.warn('Missing key', 'content or rawBase64');
            }
        }
        if (isValid) {
            return validP;
        }
    }
}

class FileStub extends iFileStub {
    readonly type = 'file_stub';
}

export default FileStub;
