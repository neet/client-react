import {
  Dialog,
  ListItem,
  TextField,
} from "material-ui";
import * as React from "react";
import { ng } from "../../models";

export interface NGHashNodeEditorProps {
  value: ng.NGNodeHash;
  onChange: (node: ng.NGNodeHash) => void;
  select: JSX.Element;
  nestedLevel: number;
  rightIconButton?: React.ReactElement<any>;
  openDialog: boolean;
  changeOpenDialog: (v: boolean) => void;
}

export interface NGHashNodeEditorState {
}

export class NGHashNodeEditor extends React.Component<NGHashNodeEditorProps, NGHashNodeEditorState> {
  constructor(props: NGHashNodeEditorProps) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <>
      <Dialog
        open={this.props.openDialog}
        autoScrollBodyContent={true}
        onRequestClose={() => this.props.changeOpenDialog(false)}>
        {this.props.select}
        <TextField
          floatingLabelText="HASH"
          value={this.props.value.hash}
          onChange={(_e, v) => {
            this.props.onChange({
              ...this.props.value,
              hash: v,
            });
          }} />
      </Dialog>
      <ListItem
        nestedLevel={this.props.nestedLevel}
        rightIconButton={this.props.rightIconButton}
        onClick={() => this.props.changeOpenDialog(true)}
        primaryText={`HASH:${this.props.value.hash}`} />
    </>;
  }
}
