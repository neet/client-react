import * as React from 'react';
import * as api from '@anontown/api-types';
import {
  IconButton
} from 'material-ui';
import {
  NavigationArrowDropUp,
  NavigationArrowDropDown
} from 'material-ui/svg-icons';
import { dateFormat } from '../utils';
import { Md } from './md';
import { UserData } from "../models";
import { Link } from "react-router-dom";
import { AtError } from "@anontown/api-client";
import { apiClient } from "../utils";
import { Snack } from "./snack";
import { connect } from "react-redux";
import { Store } from "../reducers";
import { ObjectOmit } from "typelevel-ts";

interface _HistoryProps {
  history: api.History,
  user: UserData | null
}

export type HistoryProps = ObjectOmit<_HistoryProps, "user">;

export interface HistoryState {
  detail: boolean;
  hashReses: api.Res[] | null;
  snackMsg: null | string
}

class _History extends React.Component<_HistoryProps, HistoryState> {
  constructor(props: _HistoryProps) {
    super(props);

    this.setState({ detail: false });
  }

  render() {
    return (
      <div>
        <Snack
          msg={this.state.snackMsg}
          onHide={() => this.setState({ snackMsg: null })} />
        <div>
          <IconButton onClick={() => this.setState({ detail: !this.state.detail })}>
            {this.state.detail ? <NavigationArrowDropUp /> : <NavigationArrowDropDown />}
          </IconButton>
          {dateFormat.format(this.props.history.date)}
          <a onClick={() => this.onHashClick()} > HASH:{this.props.history.hash}</a>
        </div>
        {this.state.detail ?
          <dl>
            <dt>タイトル</dt>
            <dd>{this.props.history.title}</dd>
            <dt>カテゴリ</dt>
            <dd><Link to={{ pathname: "/topic/search", search: new URLSearchParams({ title: '', tags: this.props.history.tags.join(' ') }).toString() }}>{this.props.history.tags.join(',')}</Link></dd >
            <dt>本文</dt>
            <dd>
              <Md body={this.props.history.text} />
            </dd >
          </dl > : null
        }
        {
          this.state.hashReses !== null
            ? this.state.hashReses.map(res => (<Res res={res} />))
            : null
        }
      </div >
    );
  }

  onHashClick() {
    if (this.state.hashReses === null) {
      apiClient.findResHash(this.props.user !== null ? this.props.user.token : null, {
        topic: this.props.history.topic,
        hash: this.props.history.hash
      }).subscribe(reses => {
        this.setState({ hashReses: reses });
      }, error => {
        if (error instanceof AtError) {
          this.setState({ snackMsg: "レスの取得に失敗しました" })
        } else {
          throw error;
        }
      });
    } else {
      this.setState({ hashReses: null });
    }
  }
}

export const History = connect((state: Store) => ({ user: state.user }))(_History);