import { TokenMaster } from "@anontown/api-client";
import {
  FontIcon,
  IconButton,
  IconMenu,
  MenuItem,
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from "material-ui";
import {
  getMuiTheme,
  lightBaseTheme,
  MuiThemeProvider,
} from "material-ui/styles";
import * as React from "react";
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { Observable } from "rxjs";
import * as pages from "../pages";
import {
  apiClient,
  createUserData,
} from "../utils";
import * as style from "./app.scss";
import { UserStore, appInject } from "../stores";

const muiTheme = getMuiTheme(lightBaseTheme);

interface AppProps extends RouteComponentProps<{}> {
  user: UserStore
}

interface AppState {
  isInit: boolean;
}

export const App = appInject(withRouter(class extends React.Component<AppProps, AppState> {
  previousLocation = this.props.location;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      isInit: false,
    };
  }

  componentWillMount() {
    Observable.of(localStorage.getItem("token"))
      .map(tokenStr => {
        if (tokenStr !== null) {
          return { ...JSON.parse(tokenStr), type: "master" } as TokenMaster;
        } else {
          throw Error();
        }
      })
      .mergeMap(token => apiClient.findTokenOne(token))
      .mergeMap(token => createUserData(token))
      .subscribe(data => {
        this.props.user.setData(data);
        this.setState({ isInit: true });
      }, () => {
        this.props.user.setData(null);
        this.setState({ isInit: true });
      });
  }

  componentWillUpdate(nextProps: AppProps) {
    const { location } = this.props;
    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  logout() {
    this.props.user.setData(null);
  }

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.state.isInit
          ? <div className={style.container}>
            <Toolbar className={style.header}>
              <ToolbarGroup firstChild={true}>
                <ToolbarTitle text="Anontown" />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton containerElement={<Link to="/" />}>
                  <FontIcon className="material-icons">home</FontIcon>
                </IconButton>
                <IconButton containerElement={<Link to="/topic/search" />}>
                  <FontIcon className="material-icons">search</FontIcon>
                </IconButton>
                {this.props.user.data !== null
                  ? <IconButton containerElement={<Link to="/notifications" />}>
                    <FontIcon className="material-icons">notifications</FontIcon>
                  </IconButton>
                  : null}
                <IconMenu
                  iconButtonElement={
                    <IconButton touch={true}>
                      <FontIcon className="material-icons">people</FontIcon>
                    </IconButton>
                  }>
                  {this.props.user.data !== null
                    ? [
                      <MenuItem
                        key="1"
                        primaryText="プロフ管理"
                        containerElement={<Link to="/profiles" />} />,
                      <MenuItem
                        key="2"
                        primaryText="お知らせ"
                        containerElement={<Link to="/messages" />} />,
                      <MenuItem
                        key="3"
                        primaryText="設定"
                        containerElement={<Link to="/settings/account" />} />,
                      <MenuItem
                        key="4"
                        primaryText="ログアウト"
                        onClick={() => this.logout()} />,
                    ]
                    : <MenuItem
                      primaryText="ログイン/登録"
                      containerElement={<Link to="/in" />} />}

                </IconMenu>
                <IconButton containerElement={<a
                  href="https://document.anontown.com/"
                  target="_blank" />}>
                  <FontIcon className="material-icons">help</FontIcon>
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
            <div className={style.main}>
              <Switch location={isModal ? this.previousLocation : location}>
                <Route exact path="/" component={pages.HomePage} />
                <Route exact path="/res/:id" component={pages.ResPage} />
                <Route exact path="/res/:id/reply" component={pages.ResReplyPage} />
                <Route exact path="/topic/search" component={pages.TopicSearchPage} />
                <Route exact path="/topic/create" component={pages.TopicCreatePage} />
                <Route exact path="/topic/:id" component={pages.TopicPage} />
                <Route exact path="/topic/:id/data" component={pages.TopicDataPage} />
                <Route exact path="/topic/:id/fork" component={pages.TopicForkPage} />
                <Route exact path="/topic/:id/edit" component={pages.TopicEditPage} />
                <Route exact path="/profiles" component={pages.ProfilesPage} />
                <Route exact path="/notifications" component={pages.NotificationsPage} />
                <Route exact path="/messages" component={pages.MessagesPage} />
                <Route exact path="/in" component={pages.InPage} />
                <Route exact path="/auth" component={pages.AuthPage} />
                <Route path="/settings" component={pages.SettingsPage} />
                <Route exact path="/profile/:id" component={pages.ProfilePage} />
                <Route component={pages.NotFoundPage} />
              </Switch>
              {isModal ? <Route path="/res/:id" component={pages.ResModal} /> : null}
              {isModal ? <Route path="/res/:id/reply" component={pages.ResReplyModal} /> : null}
              {isModal ? <Route path="/profile/:id" component={pages.ProfileModal} /> : null}
              {isModal ? <Route path="/topic/:id/data" component={pages.TopicDataModal} /> : null}
              {isModal ? <Route path="/topic/:id/fork" component={pages.TopicForkModal} /> : null}
              {isModal ? <Route path="/topic/:id/edit" component={pages.TopicEditModal} /> : null}
            </div>
          </div>
          : null}
      </MuiThemeProvider>
    );
  }
}));