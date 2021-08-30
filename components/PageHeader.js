import React from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import IosStatusBar from './IosStatusBar';
import { connect } from 'react-redux';
import i18n, { rtl } from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../config';

class PageHeader extends React.Component {

	_getUserName = () => {
		const user = this.props.currentUser;
		const loggedinwith = this.props.loggedInWith;


		if (loggedinwith == 'google') {
			return (
				<View style={styles.userNameWrapper}>
					<Text style={styles.userNameTitle} numberOfLines={1}><Text style={styles.headerTitle}>{user.user.name}</Text></Text>
					<Image style={styles.userPhoto} source={{ uri: user.user.photo }} />
				</View>
			);
		}

		return <Text style={styles.headerTitle}>{i18n.t('PAGEHEADER_Account')}</Text>;
	}

	render() {
	
		return (
			<View style={styles.pageHeaderWrapper}>
				<View style={this.props.hasTabs == true ? styles.headerWithTabs : styles.header}>

					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.goBack(null) }} >
						<Feather name={rtl ? 'arrow-right' : 'arrow-left'} style={styles.backIcon} />
					</TouchableHighlight>

					{this.props.title != 'userProfile' ? (
						<Text style={styles.headerTitle} numberOfLines={1}>{this.props.title}</Text>
					) : this._getUserName()}
				</View>
				{this.props.hasTabs != true ? <IosStatusBar /> : null}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	pageHeaderWrapper: {
		position: 'relative',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: getStatusBarHeight() + 4,
		height: 56 + getStatusBarHeight(),
		width: '100%',
		backgroundColor: '#eeeeee',
	},
	headerWithTabs: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 4,
		height: 56,
		width: '100%',
		backgroundColor: '#eeeeee',
	},
	backIcon: {
		fontSize: 24,
		color: '#1e1e1e',
		marginRight: 32,
	},
	headerTitle: {
		color: '#1e1e1e',
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		marginRight: 16,
		textAlign: 'left',
	},
	userNameWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		textAlign: 'left',
	},
	userNameTitle: {
		flex: 2,
		textAlign: 'left',
	},
	userPhoto: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginLeft: 16,
		overflow: 'hidden',
	},
});
const mapStateToProps = state => {
	return {
		currentUser: state.currentUser,
		loggedInWith: state.loggedInWith,
	};
};

export default connect(mapStateToProps)(PageHeader);