import * as React from 'react';
import * as api from '@anontown/api-types'
import { Errors } from './errors';
import { TextField, RaisedButton } from 'material-ui';
import { UserData } from "../models";
import { apiClient } from "../utils";
import { AtError } from "@anontown/api-client";
import { connect } from "react-redux";
import { Store } from "../reducers";
import { ObjectOmit } from "typelevel-ts";

interface _ClientEditorProps {
  client: api.Client | null,
  onUpdate?: (client: api.Client) => void,
  onAdd?: (client: api.Client) => void,
  user: UserData | null
}

export type ClientEditorProps = ObjectOmit<_ClientEditorProps, 'user'>;

export interface ClientEditorState {
  url: string,
  name: string,
  errors: string[],
}

class _ClientEditor extends React.Component<_ClientEditorProps, ClientEditorState> {
  constructor(props: _ClientEditorProps) {
    super(props);
    this.state = {
      url: props.client !== null ? props.client.url : '',
      name: props.client !== null ? props.client.name : '',
      errors: []
    };
  }

  render() {
    return this.props.user !== null
      ? <form onSubmit={() => this.submit()}>
        <Errors errors={this.state.errors} />
        <TextField floatingLabelText="名前" value={this.state.name} onChange={(_e, v) => this.setState({ name: v })} />
        <TextField floatingLabelText="url" value={this.state.url} onChange={(_e, v) => this.setState({ url: v })} />
        <RaisedButton type="submit" label="OK" />
      </form>
      : <div>ログインして下さい</div>;
  }

  submit() {
    if (this.props.user === null) {
      return;
    }

    if (this.props.client !== null) {
      apiClient.updateClient(this.props.user.token, {
        id: this.props.client.id,
        name: this.state.name,
        url: this.state.url
      }).subscribe(client => {
        if (this.props.onUpdate) {
          this.props.onUpdate(client);
        }
        this.setState({ errors: [] });
      }, error => {
        if (error instanceof AtError) {
          this.setState({ errors: error.errors.map(e => e.message) })
        } else {
          throw error;
        }
      });
    } else {
      apiClient.createClient(this.props.user.token, {
        name: this.state.name,
        url: this.state.url
      }).subscribe(client => {
        if (this.props.onAdd) {
          this.props.onAdd(client);
        }
        this.setState({ errors: [] });
      }, error => {
        if (error instanceof AtError) {
          this.setState({ errors: error.errors.map(e => e.message) })
        } else {
          throw error;
        }
      });
    }
  }
}

export const ClientEditor = connect((state: Store) => ({ user: state.user }))(_ClientEditor);