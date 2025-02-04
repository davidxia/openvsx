/********************************************************************************
 * Copyright (c) 2019 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import * as React from 'react';
import { withStyles, createStyles } from '@material-ui/styles';
import { Theme, WithStyles, Avatar, Menu, Typography, MenuItem, Link, Divider, IconButton } from '@material-ui/core';
import { Link as RouteLink } from 'react-router-dom';
import { isError } from '../../extension-registry-types';
import { UserSettingsRoutes } from './user-settings';
import { AdminDashboardRoutes } from '../admin-dashboard/admin-dashboard';
import { MainContext } from '../../context';

const avatarStyle = (theme: Theme) => createStyles({
    avatar: {
        width: '30px',
        height: '30px'
    },
    link: {
        cursor: 'pointer',
        textDecoration: 'none'
    },
    menuItem: {
        cursor: 'auto'
    },
    menuButton: {
        border: 'none',
        background: 'none',
        padding: 0
    },
    logoutButton: {
        color: theme.palette.primary.dark,
    }
});

class UserAvatarComponent extends React.Component<UserAvatarComponent.Props, UserAvatarComponent.State> {

    static contextType = MainContext;
    declare context: MainContext;

    protected avatarButton: HTMLElement | null;
    protected abortController = new AbortController();

    constructor(props: UserAvatarComponent.Props) {
        super(props);

        this.state = {
            open: false
        };
    }

    componentDidMount() {
        this.updateCsrf();
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    protected async updateCsrf() {
        try {
            const csrfToken = await this.context.service.getCsrfToken(this.abortController);
            if (!isError(csrfToken)) {
                this.setState({ csrf: csrfToken.value });
            }
        } catch (err) {
            this.context.handleError(err);
        }
    }

    protected readonly handleAvatarClick = () => {
        this.setState({ open: !this.state.open });
    };
    protected readonly handleClose = () => {
        this.setState({ open: false });
    };

    render(): React.ReactNode {
        const user = this.context.user;
        if (!user) {
            return null;
        }
        return <React.Fragment>
            <IconButton
                title={`Logged in as ${user.loginName}`}
                aria-label='User Info'
                onClick={this.handleAvatarClick}
                ref={ref => this.avatarButton = ref} >
                <Avatar
                    src={user.avatarUrl}
                    alt={user.loginName}
                    variant='rounded'
                    classes={{ root: this.props.classes.avatar }} />
            </IconButton>
            <Menu
                open={this.state.open}
                anchorEl={this.avatarButton}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={this.handleClose} >
                <MenuItem className={this.props.classes.menuItem}>
                    <Link href={user.homepage}>
                        <Typography variant='body2' color='textPrimary'>
                            Logged in as
                        </Typography>
                        <Typography variant='overline' color='textPrimary'>
                            {user.loginName}
                        </Typography>
                    </Link>
                </MenuItem>
                <Divider />
                <MenuItem className={this.props.classes.menuItem}>
                    <RouteLink onClick={this.handleClose} to={UserSettingsRoutes.PROFILE} className={this.props.classes.link}>
                        <Typography variant='button' color='textPrimary'>
                            Settings
                        </Typography>
                    </RouteLink>
                </MenuItem>
                {
                    user.role && user.role === 'admin' ?
                        <MenuItem className={this.props.classes.menuItem}>
                            <RouteLink onClick={this.handleClose} to={AdminDashboardRoutes.MAIN} className={this.props.classes.link}>
                                <Typography variant='button' color='textPrimary'>
                                    Admin Dashboard
                                </Typography>
                            </RouteLink>
                        </MenuItem>
                        :
                        ''
                }
                <MenuItem className={this.props.classes.menuItem}>
                    <form method='post' action={this.context.service.getLogoutUrl()}>
                        {this.state.csrf ? <input name='_csrf' type='hidden' value={this.state.csrf} /> : null}
                        <button type='submit' className={`${this.props.classes.link} ${this.props.classes.menuButton}`}>
                            <Typography variant='button' className={this.props.classes.logoutButton}>
                                Log Out
                            </Typography>
                        </button>
                    </form>
                </MenuItem>
            </Menu>
        </React.Fragment>;
    }
}

export namespace UserAvatarComponent {
    export interface Props extends WithStyles<typeof avatarStyle> {
    }

    export interface State {
        open: boolean;
        csrf?: string;
    }
}

export const UserAvatar = withStyles(avatarStyle)(UserAvatarComponent);
