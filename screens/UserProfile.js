import React from 'react';
import { StyleSheet, ScrollView, Text, View, Image, TouchableHighlight, Linking } from 'react-native';
import { connect } from 'react-redux';
import LogInWithGoogle from '../components/login_methods/LogInWithGoogle';
import Feather from 'react-native-vector-icons/Feather';
import { GoogleSignin } from 'react-native-google-signin';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../config';

class UserProfile extends React.Component {

	componentDidMount() {
		this.initAsync();
	}

	initAsync = async () => {
		GoogleSignin.configure();
	};

	_renderUserMenu = () => {
		const menu = [
			{
				title: i18n.t('PROFILE_MyOrders'),
				icon: 'Search',
				page: 'Orders',
			},
			{
				title: i18n.t('PROFILE_MyFavorites'),
				icon: 'Heart',
				page: 'Favorites',
			},
		];

		/*Check if user is logged in or return login methods*/

		if (!this.props.loggedInWith) {
			return (
				<View>
					{/* <LogInWithGoogle />
					<View style={styles.separator} /> */}
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Login') }}>
						<View style={styles.listItem}>
							<Feather name='mail' style={styles.menuIcon} />
							<Text style={styles.listItemTitle}>{i18n.t("PAGEHEADER_LOGIN")}</Text>
						</View>
					</TouchableHighlight>
					<View style={styles.separator} />
				</View>


			);
		}

		const usermenu = menu.map((item, i) => (
			<TouchableHighlight underlayColor='transparent' key={i} onPress={() => { this.props.navigation.navigate(item.page) }}>
				<View>
					

					<View style={styles.listItem}>
						{item.icon == 'Search' ? (
							<Feather name='search' style={styles.menuIcon} />
						) : (
								<Feather name='heart' style={styles.menuIcon} />
							)}
						<Text style={styles.listItemTitle}>{item.title}</Text>
					</View>
					<View style={styles.separator} />
				</View>
			</TouchableHighlight>

		));

		return usermenu;
	};

	_renderServerMenu = () => {
		const serverlist = this.props.serverMenu;

		if (serverlist.length == 0) {
			return null;
		}

		return (
			<View style={styles.wrapper}>
				{serverlist.map((item, i) => (
					<TouchableHighlight underlayColor='transparent' key={parseInt(i) + 1} onPress={() => { Linking.openURL(item.url) }}>
						<View style={styles.listItem}>
							<Feather name='link' style={styles.menuIcon} />
							<Text style={styles.listItemTitle}>{i18n.t(item.title)}</Text>
						</View>
					</TouchableHighlight>
				))}
				<View style={styles.separator} />
			</View>
		);
	};

	_logOut = async () => {
		const loggedinwith = this.props.loggedInWith;

		if (loggedinwith == 'google') {
			await GoogleSignin.signOut();
			this.props.clearUserData();
		}
	};

	render() {

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title='userProfile' />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							{this._renderUserMenu()}							
						</View>

						

						{this.props.loggedInWith ? (
							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('EditProfile') }}>
								<View style={styles.listItem}>
									<Feather name='user' style={styles.menuIcon} />
									<Text style={styles.listItemTitle}>{i18n.t('TEXT_EDIT_PROFILE')}</Text>
								</View>
							</TouchableHighlight>							
						) : null}
						{this.props.loggedInWith ? (<View style={styles.separator} />) : null}
						
						{this.props.loggedInWith ? (
							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('ChangePassword') }}>
								<View style={styles.listItem}>
									<Feather name='lock' style={styles.menuIcon} />
									<Text style={styles.listItemTitle}>{i18n.t('CHANGE_PASSWORD_ChangePassword')}</Text>
								</View>
							</TouchableHighlight>							
						) : null}
						{this.props.loggedInWith ? (<View style={styles.separator} />) : null}
						{this._renderServerMenu()}
						{this.props.loggedInWith ? (
							<View style={styles.wrapper}>
								<TouchableHighlight underlayColor='transparent' onPress={this._logOut}>
									<View style={styles.listItem}>
										<Feather name='log-out' style={styles.menuIcon} />
										<Text style={styles.listItemTitle}>{i18n.t('PROFILE_Logout')}</Text>
									</View>
								</TouchableHighlight>
								<View style={styles.separator} />
							</View>
						) : null}
					</View>
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	userMenu: {
		marginBottom: 8,
		marginTop: 8,
	},
	separator: {
		borderBottomWidth: 1,
		marginLeft: 16,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	listItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
	},
	menuIcon: {
		paddingTop: 16,
		paddingBottom: 16,
		paddingRight: 32,
		paddingLeft: 16,
		color: '#1e1e1e',
		fontSize: 24,
	},
	listItemTitle: {
		flex: 2,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e',
	},
});

const mapStateToProps = state => {
	return {
		currentUser: state.currentUser,
		serverMenu: state.serverMenu,
		loggedInWith: state.loggedInWith,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		clearUserData: () => dispatch({ type: 'CLEARUSERDATA' })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);