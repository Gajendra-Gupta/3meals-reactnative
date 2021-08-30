import React from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, Alert, TouchableHighlight } from 'react-native';
import { GoogleSignin } from 'react-native-google-signin';
import SvgGoogleIcon from '../../assets/images/GoogleIcon';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

class LogInWithGoogle extends React.Component {

	componentDidMount() {
		this.initAsync();
	}

	initAsync = async () => {
		GoogleSignin.configure();
	};

	signInAsync = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			console.log("userInfo", userInfo);
			userInfo.user.phone = "";
			userInfo.login_type = "google";
			userInfo.user.password = userInfo.user.id;
			this.props.saveUserGoogleData(userInfo);
		} catch (error) {
			console.log(error);
			Alert.alert(i18n.t('Error'), i18n.t('LOGINGOOGLE_ErrorMsg'));
		}
	};

	render() {
		return (
			<TouchableHighlight underlayColor='transparent' onPress={this.signInAsync} >
				<View style={styles.wrapper}>
					<SvgGoogleIcon style={styles.loginIcon} width={32} height={32} />
					<Text style={styles.title}>{i18n.t('LOGINGOOGLE_LoginWithGoogle')}</Text>
				</View>
			</TouchableHighlight>
		);
	}
}

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	loginIcon: {
		margin: 16,
	},
	title: {
		flex: 2,
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'left',
	}
});

const mapDispatchToProps = dispatch => {
	return {
		saveUserGoogleData: (user) => dispatch({ type: 'SAVEUSERGOOGLEDATA', data: user }),
	}
};

export default connect(null, mapDispatchToProps)(LogInWithGoogle);