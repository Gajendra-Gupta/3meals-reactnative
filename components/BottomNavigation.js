import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import ShoppingBasketIcon from '../assets/images/ShoppingBasket';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, BOTTOMTABSACTIVECOLOR, BOTTOMTABSICONSCOLOR, BOTTOMTABSCOLOR, APPCURRENCY_FORMAT } from '../config';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n from '../i18n/config';

class BottomNavigation extends React.Component {

	render() {
		const user = this.props.currentUser;
		const loggedinwith = this.props.loggedInWith;
		const userName = loggedinwith == 'google' && typeof user == 'object' && user.user.name ? user.user.name.split(' ') : null;
		const activeMenu = this.props.navigation.state.index;		

		return (
			<View style={[styles.container,{display : this.props.isPaypalOpen == true ? 'none' : 'flex'}]}>
				<View style={styles.containerInner}>
					<View style={styles.singleTab}>
						<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('Main')}}>
							<View style={styles.singleTabInner}>
								<Text style={styles.navIconWrapper} ><Feather name='home' style={activeMenu == 0 ? styles.navIconActive : styles.navIcon} /></Text>
								<Text style={activeMenu == 0 ? styles.navTitleActive : styles.navTitle} numberOfLines={1}>{i18n.t('BOTTOMNAV_Home')}</Text>
							</View>
						</TouchableHighlight>
					</View>
					<View style={styles.singleTab}>
						<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('Search')}}>
							<View style={styles.singleTabInner}>
								<Text style={styles.navIconWrapper} ><Feather name='search' style={activeMenu == 1 ? styles.navIconActive : styles.navIcon} /></Text>
								<Text style={activeMenu == 1 ? styles.navTitleActive :styles.navTitle} numberOfLines={1}>{i18n.t('BOTTOMNAV_Explore')}</Text>
							</View>
						</TouchableHighlight>
					</View>
					<View style={styles.singleTab}>
						<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('Cart')}}>
							<View style={styles.singleTabInner}>
								{parseFloat(this.props.total) > 0 ? (
									<ShoppingBasketIcon style={styles.navIconSVG} width={24} height={24} />
								) : (
									<Text style={styles.navIconWrapper} ><Feather name='shopping-bag' style={activeMenu == 2 ? styles.navIconActive : styles.navIcon} /></Text>
								)}
								{parseFloat(this.props.total) > 0 ? (			
									<Text style={activeMenu == 2 ? styles.navTitleActive : styles.navTitle} numberOfLines={1}>{i18n.toCurrency(this.props.total, APPCURRENCY_FORMAT)}</Text>
								) : (
									<Text style={activeMenu == 2 ? styles.navTitleActive : styles.navTitle} numberOfLines={1}>{i18n.t('BOTTOMNAV_Cart')}</Text>
								)}
							</View>
						</TouchableHighlight>
					</View>
					<View style={styles.singleTab}>
						<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.navigate('User')}}>
							<View style={styles.singleTabInner}>
								<Text style={styles.navIconWrapper} ><Feather name='user' style={activeMenu == 3 ? styles.navIconActive : styles.navIcon} /></Text>
								{userName ? (
								<Text style={activeMenu == 3 ? styles.navTitleActive : styles.navTitle} numberOfLines={1}>{typeof userName == 'object' ? userName[0] : userName}</Text>
								) : (
								<Text style={activeMenu == 3 ? styles.navTitleActive : styles.navTitle} numberOfLines={1}>{i18n.t('BOTTOMNAV_Account')}</Text>					
								)}
							</View>
						</TouchableHighlight>
					</View>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		...Platform.select({
			ios: {
				shadowColor: 'black',
				shadowOffset: { height: -3 },
				shadowOpacity: 0.1,
				shadowRadius: 3,
				height: 56 + getStatusBarHeight(),
			},
			android: {
				elevation: 20,
				height: 56,
			},
		}),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		backgroundColor: BOTTOMTABSCOLOR,
	},
	containerInner: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	singleTab: {
		flex: 1,
		maxWidth: 168,
	},
	singleTabInner: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 8,
	},
	navIcon: {
		fontSize: 24,
		color: BOTTOMTABSICONSCOLOR,
		textAlign: 'center',
		marginBottom: 2,
	},
	navIconActive: {
		fontSize: 24,
		color: BOTTOMTABSACTIVECOLOR,
		textAlign: 'center',
		marginBottom: 2,
	},
	navTitle: {
		fontSize: 12,
		fontFamily: APPFONTMEDIUM,
		color: 'rgba(0,0,0,0.6)',
		textAlign: 'center',
	},
	navTitleActive: {
		fontSize: 12,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		color: BOTTOMTABSACTIVECOLOR,
	},
	navIconSVG: {
		marginBottom: 2,
	},
});

const mapStateToProps = state => {
	return {
		total: state.cartTotals.total,
		currentUser: state.currentUser,
		loggedInWith: state.loggedInWith,
		isPaypalOpen: state.isPaypalOpen,
	};
};

export default connect(mapStateToProps)(BottomNavigation);