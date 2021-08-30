import React from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Image, TouchableHighlight, Linking, Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import i18n, { rtl } from '../i18n/config';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { API_URL, APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONCOLOR, WEBSITEURL } from '../config';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-community/async-storage';



class ChangePasswordScreen extends React.Component {

	state = {
		user_id: this.props.currentUser.user.id,
		current_password: null,
		new_pasword: null,
		confirm_new_pasword: null,
	}

	
	async change() {

		console.log("change", JSON.stringify(this.state));	

		if (this.state.current_password == "" || this.state.current_password == null) {
			Alert.alert(null, i18n.t('CHANGE_PASSWORD_ErrorCurrentPassword'))
			return;
		}
		else if (this.state.new_pasword == "" || this.state.new_pasword == null) {
			Alert.alert(null, i18n.t('CHANGE_PASSWORD_ErrorNewPassword'))
			return;
		}
		else if (this.state.confirm_new_pasword == "" || this.state.confirm_new_pasword == null) {
			Alert.alert(null, i18n.t('CHANGE_PASSWORD_ErrorConfirmPassword'))
			return;
		}
		else if (this.state.new_pasword != this.state.confirm_new_pasword) {
			Alert.alert(null, i18n.t('CHANGE_PASSWORD_ErrorPasswordNotMatched'))
			return;
		}
		

		let response = await fetch(API_URL + "change_password.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		});
		let json = await response.json();

		console.log("response", json);	

		if (json.status == 1) {			
			Alert.alert(null, json.message);				
			this.props.navigation.navigate("User");
		}
		else {
			Alert.alert(null, json.message)
		}


	}

	setInput = (key, search) => {
		this.setState({ ...this.state, [key]: search });
	};



	render() {

		return (
			<View style={styles.container}>

				<View style={styles.header}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.goBack(null) }} >
						<Feather name={rtl ? 'arrow-right' : 'arrow-left'} style={styles.backIcon} />
					</TouchableHighlight>
					<Text style={styles.headerTitle} numberOfLines={1}>{i18n.t('CHANGE_PASSWORD_ChangePassword')}</Text>
				</View>



				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							
							<TextInput style={styles.input} secureTextEntry={true} placeholderTextColor="gray" placeholder={i18n.t('CHANGE_PASSWORD_CurrentPassword')} onChangeText={val => this.setInput('current_password', val)} />
							<TextInput style={styles.input} secureTextEntry={true} placeholderTextColor="gray" placeholder={i18n.t('CHANGE_PASSWORD_NewPassword')} onChangeText={val => this.setInput('new_pasword', val)} />
							<TextInput style={styles.input} secureTextEntry={true} placeholderTextColor="gray" placeholder={i18n.t('CHANGE_PASSWORD_ConfirmPassword')} onChangeText={val => this.setInput('confirm_new_pasword', val)} />
						

							<TouchableHighlight underlayColor='transparent' onPress={() => { this.change() }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={styles.button}>{i18n.t('CHANGE_PASSWORD_ChangePassword')}</Text>
							</TouchableHighlight>


						</View>
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
	input: {
		borderBottomWidth: 1,
		marginLeft: 16,
		marginRight: 15,
		padding: 10,
		marginTop: 15,
		fontSize : 18,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	button: {
		marginTop: 50,
		backgroundColor: PRIMARYBUTTONCOLOR,
		width: 180,
		textAlign: 'center',
		padding: 10,
		color: '#fff',
		borderRadius: 10,
		overflow : 'hidden',
		fontWeight: '700',
		fontSize: 18


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
		saveUserData: (user) => dispatch({ type: 'SAVEUSERDATA', data: user }),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordScreen);