import React from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Image, TouchableHighlight, Linking, Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { API_URL, APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONCOLOR, WEBSITEURL } from '../config';

class EditProfile extends React.Component {

	state = {
		first_name: this.props.currentUser.user.givenName,
		last_name: this.props.currentUser.user.familyName,
		phone_no: this.props.currentUser.user.phone,
		email: this.props.currentUser.user.email,
		login_type: this.props.currentUser.login_type,
		password: this.props.currentUser.user.password
	}



	async updateProfile() {

		console.log("login", JSON.stringify(this.state));
		//Alert.alert(null, i18n.t('ConnectError'))

		//Alert.alert(null, i18n.t('ConnectError'))

		if (this.state.first_name == "" || this.state.first_name == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_FirstName'))
			return;
		}
		else if (this.state.last_name == "" || this.state.last_name == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_LastName'))
			return;
		}

		else {
			if (this.state.phone_no == "" || this.state.phone_no == null) {
				Alert.alert(null, i18n.t('ERROR_MESSAGE_PHONE'))
				return;
			}
			else {
				if (this.state.phone_no.length < 10) {
					Alert.alert(null, i18n.t('ERROR_MESSAGE_VAILD_PHONE'))
					return;
				}
			}
		}

		let response = await fetch(API_URL + "edit_customer.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		});
		let json = await response.json();
		//console.log("response Edit", json)
		if (json.status == 1) {

			let userInfo = {
				scopes:
					['https://www.googleapis.com/auth/userinfo.profile',
						'https://www.googleapis.com/auth/userinfo.email'],
				serverAuthCode: null,
				idToken: null,
				login_type: this.props.currentUser.login_type,
				user: {
					photo: '',
					email: this.props.currentUser.user.email,
					familyName: this.state.last_name,
					givenName: this.state.first_name,
					name: this.state.first_name + ' ' + this.state.last_name,
					phone: this.state.phone_no,
					id: this.props.currentUser.user.id,
					password: this.state.password
				}
			}
			Alert.alert(i18n.t("EDIT_PROFILE_SuccessTitle"), i18n.t("EDIT_PROFILE_SuccessMessage"))
			this.props.saveUserGoogleData(userInfo);
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
		console.log("Login Data1", this.props.currentUser);


		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={i18n.t('HEAD_TEXT_PROFILE')} />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_FIRST_NAME')}</Text>
							<TextInput style={styles.input} value={this.state.first_name} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_FIRST_NAME')} onChangeText={val => this.setInput('first_name', val)} />
							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_LAST_NAME')}</Text>
							<TextInput style={styles.input} value={this.state.last_name} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_LAST_NAME')} onChangeText={val => this.setInput('last_name', val)} />
							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_EMAIL')}</Text>							
							<TextInput style={styles.input} keyboardType='email-address' value={this.state.email} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_EMAIL')} onChangeText={val => this.setInput('email', val)} />
							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_PHONE_NUMBER')}</Text>
							<TextInput style={styles.input} value={this.state.phone_no} keyboardType='numeric' placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_PHONE_NUMBER')} onChangeText={val => this.setInput('phone_no', val)} />
							{/* <Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_PASSWORD')}</Text>
							<TextInput style={styles.input} value={this.state.password} secureTextEntry={true} placeholder={i18n.t('PLACEHOLDER_PASSWORD')} onChangeText={val => this.setInput('password', val)} /> */}


							<TouchableHighlight underlayColor='transparent' onPress={() => { this.updateProfile() }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={styles.button}>{i18n.t('BUTTON_PROFILE_TEXT')}</Text>
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
	inputLabel: {		
		marginLeft: 10,
		marginTop : 15,
		fontFamily : APPFONTMEDIUM,
				
	},
	input: {
		borderBottomWidth: 1,
		marginLeft: 16,
		marginRight: 15,
		padding : 10,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	button: {
		margin: 15,
		backgroundColor: PRIMARYBUTTONCOLOR,
		width: 150,
		textAlign: 'center',
		padding: 10,
		color: '#fff',
		borderRadius: 10,
		fontWeight: '700',
		fontSize: 18,
		overflow: 'hidden'


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
		saveUserGoogleData: (user) => dispatch({ type: 'SAVEUSERGOOGLEDATA', data: user }),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);