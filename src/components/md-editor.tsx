import * as React from 'react';
import {
  TextField,
  IconButton,
  Toggle,
  Dialog
} from 'material-ui';
import { ImageAddAPhoto, ContentCreate } from 'material-ui/svg-icons';
import { Md } from './md';
import { Errors } from './errors';
import { Oekaki } from './oekaki';
import { imgur } from "../utils";
import { Observable } from "rxjs";

export interface MdEditorProps {
  value: string;
  maxRows?: number;
  minRows?: number;
  onChange?: (newValue: string) => void;
}

export interface MdEditorState {
  oekakiErrors?: string[],
  imageErrors?: string[],
  preview: boolean;
  slowOekaki: boolean;
  slowImage: boolean;
}

export class MdEditor extends React.Component<MdEditorProps, MdEditorState> {
  defaltMinRows = 5;

  constructor(props: MdEditorProps) {
    super(props);
    this.state = {
      preview: false,
      slowOekaki: false,
      slowImage: false
    }
  }

  render() {
    return (
      <div>
        <Dialog
          title="お絵かき"
          open={this.state.slowOekaki}
          autoScrollBodyContent={true}
          onRequestClose={() => this.setState({ slowOekaki: false })}>
          <Errors errors={this.state.oekakiErrors} />
          <Oekaki size={{ x: 320, y: 240 }} onSubmit={svg => {
            let data = new Blob([svg], { type: 'image/svg+xml' });
            imgur.upload(data)
              .subscribe(url => {
                this.setState({ slowOekaki: false, oekakiErrors: undefined });
                if (this.props.onChange) {
                  this.props.onChange(this.props.value + `![](${url})`);
                }
              }, () => {
                this.setState({ oekakiErrors: ['アップロードに失敗しました'] });
              });
          }} />
        </Dialog>
        <Dialog
          title="画像アップロード"
          open={this.state.slowImage}
          autoScrollBodyContent={true}
          onRequestClose={() => this.setState({ slowImage: false })}>
          <Errors errors={this.state.imageErrors} />
          <IconButton type="file" onChange={e => {
            let target = e.target as HTMLInputElement;
            let files = target.files;
            if (files !== null) {
              Observable.of(...Array.from(files))
                .map(file => {
                  let formData = new FormData();
                  formData.append('image', file);
                  return formData;
                })
                .mergeMap(form => imgur.upload(form))
                .map(url => `![](${url})`)
                .reduce((tags, tag) => tags + tag + "\n", "")
                .subscribe(tags => {
                  this.setState({ slowImage: false, oekakiErrors: undefined });
                  if (this.props.onChange) {
                    this.props.onChange(this.props.value + tags);
                  }
                }, () => {
                  this.setState({ imageErrors: ['アップロードに失敗しました'] });
                });
            }
          }}>
            <ImageAddAPhoto />
          </IconButton>
        </Dialog>
        <div>
          <IconButton onClick={() => this.setState({ slowImage: true })}>
            <ImageAddAPhoto />
          </IconButton>
          <IconButton onClick={() => this.setState({ slowOekaki: true })}>
            <ContentCreate />
          </IconButton>
        </div>
        <Toggle label='Preview' defaultToggled={this.state.preview} onToggle={(_e, v) => this.setState({ preview: v })} />
        <TextField multiLine={true}
          rows={this.props.minRows || this.defaltMinRows}
          rowsMax={this.props.maxRows}
          value={this.props.value}
          onChange={(_, v) => {
            if (this.props.onChange) {
              this.props.onChange(v);
            }
          }} />
        <Md body={this.props.value} />
      </div>
    );
  }
}