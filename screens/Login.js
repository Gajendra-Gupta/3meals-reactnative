import React from 'react';
import { StyleSheet, ScrollView, Text, View, Image, TouchableHighlight, Linking } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../config';

class UserProfile extends React.Component {

	render() {

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title='userProfile' />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							{this._renderUserMenu()}
							<View style={styles.separator} />
						</View>						

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