import { AppBar, Box, Breadcrumbs, createStyles, Divider, IconButton, Menu, MenuItem, Theme } from "@material-ui/core";
import { WithStyles, withStyles } from "@material-ui/styles";
import { logoutAction } from "actions/auth";
import { closeTutorialDrawerAction, openTutorialDrawerAction } from "actions/tutorial";
import React from "react";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { RootState } from "reducers";
import { TDispatch } from "types";
import { FlexRowItemCenterBox } from "widgets/Box";
import { blinkTopProgressAction, setSettingsAction } from "actions/settings";
import { APP_BAR_HEIGHT, APP_BAR_ZINDEX } from "./Constants";
import {
  HelpIcon,
  ImpersonateIcon,
  KalmLogo2Icon,
  KalmTextLogoIcon,
  KalmUserIcon,
  MenuIcon,
  MenuOpenIcon,
} from "widgets/Icon";
import { ThemeToggle } from "theme/ThemeToggle";
import { IconButtonWithTooltip } from "widgets/IconButtonWithTooltip";
import StringConstants from "utils/stringConstants";
import Button from "@material-ui/core/Button";
import { withClusterInfo, WithClusterInfoProps } from "hoc/withClusterInfo";
import { stopImpersonating } from "api/realApi/index";
import { push } from "connected-react-router";
import deepOrange from "@material-ui/core/colors/deepOrange";
import { SubjectTypeUser } from "types/member";

const mapStateToProps = (state: RootState) => {
  const activeNamespace = state.namespaces.active;

  const auth = state.auth;
  const email = auth.email;
  const impersonation = auth.impersonation;
  const impersonationType = auth.impersonationType;

  return {
    isOpenRootDrawer: state.settings.isOpenRootDrawer,
    tutorialDrawerOpen: state.tutorial.drawerOpen,
    impersonation,
    impersonationType,
    activeNamespace,
    email,
  };
};

const styles = (theme: Theme) =>
  createStyles({
    appBar: {
      color: "white",
      backgroundColor: theme.palette.type === "light" ? theme.palette.primary.main : theme.palette.background.paper,
      position: "fixed",
      top: 0,
      transition: theme.transitions.create("all", {
        duration: theme.transitions.duration.short,
      }),
      height: APP_BAR_HEIGHT,
      zIndex: APP_BAR_ZINDEX,
    },
    barContainer: {
      height: "100%",
      width: "100%",
      margin: "0 auto",
      position: "relative",
      // padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    barLeft: {
      display: "flex",
      alignItems: "center",
    },
    shrinkButton: {
      // margin: `0 10px`
    },
    breadcrumb: {
      color: "#eeeeee",
    },
    breadLink: {
      color: "#eeeeee",
      fontSize: "18px",
      fontWeight: "normal",
      padding: "0 0",
      paddingLeft: 5,
      paddingRight: 5,
      borderBottom: "2px solid transparent",
      "&.disabled": {
        color: "#FFF",
        cursor: "unset",
      },
      "&.disabled:hover": {
        color: "#FFF",
        backgroundColor: "unset",
        fontWeight: "unset",
        borderBottom: "2px solid transparent",
      },
      "&:hover": {
        color: "white",
        borderBottom: "2px solid white",
      },
    },
    barRight: {
      display: "flex",
      alignItems: "center",
      "& > *": {
        marginLeft: "2px",
      },
    },
    barAvatar: {
      cursor: "pointer",
    },
  });

interface Props
  extends WithStyles<typeof styles>,
    ReturnType<typeof mapStateToProps>,
    RouteComponentProps,
    WithClusterInfoProps {
  dispatch: TDispatch;
}

interface State {
  authMenuAnchorElement: null | HTMLElement;
}

class AppBarComponentRaw extends React.PureComponent<Props, State> {
  private headerRef = React.createRef<React.ReactElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      authMenuAnchorElement: null,
    };
  }

  renderAuth() {
    const { impersonation, impersonationType, email, dispatch } = this.props;
    const { authMenuAnchorElement } = this.state;

    let emailForDisplay: string = email;

    if (email.length > 15) {
      emailForDisplay = email.slice(0, 15) + "...";
    }

    return (
      <div>
        <IconButtonWithTooltip
          tooltipTitle={StringConstants.APP_AUTH_TOOLTIPS}
          aria-label={StringConstants.APP_AUTH_TOOLTIPS}
          aria-haspopup="true"
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            this.setState({ authMenuAnchorElement: event.currentTarget });
          }}
          color="inherit"
        >
          {!impersonation ? <KalmUserIcon /> : <ImpersonateIcon style={{ color: deepOrange[400] }} />}
        </IconButtonWithTooltip>
        <Menu
          id="menu-appbar"
          anchorEl={authMenuAnchorElement}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(authMenuAnchorElement)}
          onClose={() => {
            this.setState({ authMenuAnchorElement: null });
          }}
        >
          <MenuItem disabled>{emailForDisplay}</MenuItem>
          <MenuItem onClick={() => dispatch(push("/profile"))}>Profile</MenuItem>
          {!!impersonation ? (
            <MenuItem
              onClick={async () => {
                stopImpersonating();
                await dispatch(push("/"));
                window.location.reload();
              }}
            >
              {impersonationType === SubjectTypeUser
                ? `Stop impersonating ${impersonation}`
                : `Stop impersonating as member in ${impersonation} group`}
            </MenuItem>
          ) : null}
          {email.indexOf("localhost") < 0 ? (
            <Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  this.props.dispatch(logoutAction());
                }}
              >
                Logout
              </MenuItem>
            </Box>
          ) : null}
        </Menu>
      </div>
    );
  }

  renderThemeIcon = () => {
    return <ThemeToggle />;
  };

  renderTutorialIcon = () => {
    const { tutorialDrawerOpen, dispatch } = this.props;
    return (
      <IconButtonWithTooltip
        tooltipTitle={StringConstants.APP_TUTORIAL_TOOLTIPS}
        aria-label={StringConstants.APP_TUTORIAL_TOOLTIPS}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          tutorialDrawerOpen ? dispatch(closeTutorialDrawerAction()) : dispatch(openTutorialDrawerAction());
        }}
      >
        <HelpIcon style={{ fill: "white" }} />
      </IconButtonWithTooltip>
    );
  };

  private renderBreadcrumbContent = (path: string) => {
    switch (path) {
      case "applications":
      case "":
        return "Apps";
      case "routes":
        return "Routes";
      case "components":
        return "Components";
      case "certificates":
        return "Certificates";
      case "nodes":
        return "Nodes";
      case "loadbalancer":
        return "Load Balancer";
      case "disks":
        return "Disks";
      case "registries":
        return "Registries";
      case "new":
        return "New";
      case "upload":
        return "Upload";
      case "edit":
        return "Edit";
      case "sso":
        return "SSO";
      case "acme":
        return "ACME DNS Server";
      case "ci":
        return "CI";
      case "metrics":
        return StringConstants.APP_DASHBOARD_PAGE_NAME;
      default:
        return path;
    }
  };

  render() {
    const { classes, dispatch, isOpenRootDrawer, location, clusterInfo } = this.props;
    const pathArray = location.pathname.split("/");
    return (
      <AppBar ref={this.headerRef} id="header" position="relative" className={classes.appBar}>
        <div className={classes.barContainer}>
          <div className={classes.barLeft}>
            <IconButton
              className={classes.shrinkButton}
              onClick={() => dispatch(setSettingsAction({ isOpenRootDrawer: !isOpenRootDrawer }))}
              // size={"small"}
            >
              {isOpenRootDrawer ? <MenuOpenIcon color="white" /> : <MenuIcon color="white" />}
            </IconButton>
            <FlexRowItemCenterBox>
              <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb}>
                {pathArray.map((path, index) => {
                  if (path === "cluster") {
                    return null;
                  } else if (index === 0) {
                    return (
                      <Link key={index} className={classes.breadLink} to="/" onClick={() => blinkTopProgressAction()}>
                        <KalmLogo2Icon />
                        <KalmTextLogoIcon />
                      </Link>
                    );
                  } else if (index + 1 === pathArray.length) {
                    return (
                      <span key={index} className={`${classes.breadLink} disabled`}>
                        {this.renderBreadcrumbContent(path)}
                      </span>
                    );
                  } else {
                    return (
                      <Link
                        key={index}
                        className={classes.breadLink}
                        to={pathArray.slice(0, index + 1).join("/")}
                        onClick={() => blinkTopProgressAction()}
                      >
                        {this.renderBreadcrumbContent(path)}
                      </Link>
                    );
                  }
                })}
              </Breadcrumbs>
            </FlexRowItemCenterBox>
          </div>

          <div className={classes.barRight}>
            {clusterInfo.canBeInitialized && (
              <Box mr={2}>
                <Button to="/setup" component={Link} onClick={console.log} variant="outlined" color="secondary">
                  Finish the setup steps
                </Button>
              </Box>
            )}
            <Divider orientation="vertical" flexItem color="inherit" />
            <Box className={classes.barAvatar}>{this.renderThemeIcon()}</Box>
            <Divider orientation="vertical" flexItem color="inherit" />
            <div className={classes.barAvatar}>{this.renderTutorialIcon()}</div>
            <Divider orientation="vertical" flexItem color="inherit" />
            <div className={classes.barAvatar}>{this.renderAuth()}</div>
          </div>
        </div>
      </AppBar>
    );
  }
}

export const AppBarComponent = connect(mapStateToProps)(
  withStyles(styles)(withClusterInfo(withRouter(AppBarComponentRaw))),
);
