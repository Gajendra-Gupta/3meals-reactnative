import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LoginIcon from '../assets/images/Login';
import LogInWithGoogle from './login_methods/LogInWithGoogle';
import i18n from '../i18n/config';

class Login extends React.Component {
		
	render() {
		return (
			<ScrollView style={styles.container}>
				<View style={styles.loginWrapper}>
					<LoginIcon style={styles.loginIcon} />
					<Text style={styles.loginTitle}>{i18n.t('LOGIN_LoginToContinue')}</Text>
					<View style={styles.loginMethods}>
						<LogInWithGoogle/>
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	loginWrapper: {
		display: 'flex',
		alignItems: 'center',
		marginTop: 70,
		marginLeft: 10,
		marginRight: 10,
	},
	loginIcon: {
		width: 100,
		height: 100,
	},
	loginTitle: {
		margin: 20,
		fontWeight: '500',
		color: '#1e1e1e',
		textAlign: 'center',
		fontSize: 18
	},
	loginMethods: {
		justifyContent: 'center',
		width: '100%',
		marginLeft: 16,
		backgroundColor: 'rgba(0,0,0,0.05)',
		padding: 16,
		flex: 1,
		display: 'flex',
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
		overflow: 'hidden',
		flexDirection: 'column',
	},
});

export default Login;